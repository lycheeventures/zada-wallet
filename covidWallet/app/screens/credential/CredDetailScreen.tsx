import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dimensions, View, Text } from 'react-native';
import ViewShot from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { BACKGROUND_COLOR, BLACK_COLOR, GRAY_COLOR, WHITE_COLOR } from '../../theme/Colors';
import { getCredentialTemplate, replacePlaceHolders, sharePDF } from './utils';
import {
  get_local_issue_date,
  parse_date_time,
  showAskDialog,
  showMessage,
  showNetworkMessage,
  _showAlert,
} from '../../helpers';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectCredentialsStatus } from '../../store/credentials/selectors';

import OverlayLoader from '../../components/OverlayLoader';
import CredQRModal from './components/CredQRModal';
import DetailCard from './components/DetailCard';
import RenderValues from '../../components/RenderValues';
import usePreventScreenshot from '../../hooks/usePreventScreenshot';
import { removeCredentials } from '../../store/credentials/thunk';
import {
  decryptAES256CBC,
  encryptAES256CBC,
  generateRandomSecret,
  performSHA256,
} from '../../helpers/crypto';
import { getItemFromLocalStorage, saveItemInLocalStorage } from '../../helpers/Storage';
import { get_encrypted_credential, save_encrypted_credential } from '../../gateways/credentials';
import { convertStringToBase64 } from '../../helpers/utils';
import { selectNetworkStatus } from '../../store/app/selectors';

interface IProps {
  route: any;
  navigation: any;
}

const CredDetailScreen = (props: IProps) => {
  // Constants
  const data = props.route.params.data; // Credential
  const dispatch = useAppDispatch<AppDispatch>();
  const viewShotRef = useRef(null);

  // Selectors
  const credentialStatus = useAppSelector(selectCredentialsStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQRCode] = useState({});
  const [isGenerating, setGenerating] = useState(false);
  const [isGeneratingPDF, setGeneratingPDF] = useState(false);

  // Hooks
  // Prevent screenshot
  usePreventScreenshot({ navigation: props.navigation });

  // Useeffects
  useEffect(() => {
    if (credentialStatus === 'succeeded') {
      showMessage('ZADA Wallet', 'Credential is deleted successfully');
      props.navigation.goBack();
    }
  }, [credentialStatus, props.navigation]);

  // Setting header Icons
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <MaterialIcons
            onPress={() => createAndSharePDF()}
            style={styles.headerRightIcon}
            size={25}
            name="share"
          />
          <MaterialIcons
            onPress={() =>
              credentialStatus === 'idle'
                ? showAskDialog(
                    'Are you sure?',
                    'Are you sure you want to delete this certificate?',
                    onSuccess,
                    () => {}
                  )
                : {}
            }
            style={styles.headerRightIcon}
            size={25}
            name="delete"
          />
        </View>
      ),
    });
  }, [qrCode, networkStatus]);

  useEffect(() => {
    // Generate QR Code
    if (networkStatus === 'connected') {
      if (Object.keys(qrCode).length < 1) {
        generateQRCode();
      }
    }
  }, [networkStatus]);

  // Functions
  async function generateQRCode() {
    console.log('generateQRCode networkStatus => ', networkStatus);
    let encryptionKey = '';
    let hash = '';
    let isPDFAlreadyGenerated = await getItemFromLocalStorage(data.credentialId);
    if (!isPDFAlreadyGenerated) {
      encryptionKey = generateRandomSecret(64);
      // Hash from key.
      hash = await performSHA256(encryptionKey);
      let obj = {
        key: encryptionKey,
        hash,
      };
      let valuesInBase64 = convertStringToBase64(JSON.stringify(data.values));
      let str = await encryptAES256CBC(valuesInBase64, encryptionKey);
      save_encrypted_credential(data.credentialId, str, hash);
      saveItemInLocalStorage(data.credentialId, obj);
    } else {
      encryptionKey = isPDFAlreadyGenerated.key;
      hash = isPDFAlreadyGenerated.hash;
      let resp = await get_encrypted_credential(data.credentialId, hash);
      if (resp.data.sucess) {
        let encryptedCred = resp.data.credential.encryptedCredential;
        // decrypting
        await decryptAES256CBC(encryptedCred, encryptionKey);
      }
    }

    setQRCode({
      credentialId: data.credentialId,
      key: encryptionKey,
      type: 'cred_ver',
      version: 2,
    });
  }

  // Make and Share PDF
  const createAndSharePDF = async () => {
    // Return if internet is unavailable
    if (networkStatus === 'disconnected') {
      showNetworkMessage();
      return;
    }

    setGeneratingPDF(true);
    try {
      // Ordering data
      const orderedData = Object.keys(data.values)
        .sort()
        .reduce((obj: any, key) => {
          obj[key] = data.values[key];
          return obj;
        }, {});

      // Making html to be injected later as {key: value} pair.
      let credentialDetails = Object.keys(orderedData).map((key, index) => {
        let value = orderedData[key];
        value = parse_date_time(value);
        if (index % 3 === 0) {
          return `
        <tr>
        <td class="tds">
          <p class="pt">${key}: <strong>${value}</strong></p>
        </td>`;
        } else if ((index - 1) % 3 === 2) {
          return `</tr>`;
        } else {
          return `
        <td class="tds">
          <p class="pt">${key}: <strong>${value}</strong></p>
        </td>`;
        }
      });

      // Getting template
      let template = await getCredentialTemplate(data.schemaId, data.definitionId);

      // Making QR data.
      let qrUrl = await new Promise(async (resolve, reject) => {
        await fetch(
          'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + JSON.stringify(qrCode)
        ).then(async (resp) => {
          let blob = await resp.blob();

          resolve(
            new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.onload = (event) => {
                let base64String = event.target?.result;
                resolve(base64String);
              };
              reader.readAsDataURL(blob);
            })
          );
        });
      });

      // Injecting data into template
      let htmlStr = template.file;
      htmlStr = replacePlaceHolders(
        htmlStr,
        {
          ...orderedData,
          qrUrl,
          logo: data.imageUrl,
          type: data.type,
          organizationName: data.organizationName,
        },
        credentialDetails
      );

      // Share PDF
      await sharePDF(htmlStr);
      setGeneratingPDF(false);
    } catch (error) {
      setGeneratingPDF(false);
      console.log('error', error);
    }
  };

  const openQRModal = async (bool: boolean) => {
    if (networkStatus === 'disconnected') {
      showNetworkMessage();
      return;
    }
    // Else open QR modal.
    setShowQRModal(bool);
  };

  async function onSuccess() {
    dispatch(removeCredentials(data.credentialId));
  }

  return (
    <View style={styles.mainContainer}>
      {/* hidden QRCODE */}
      <View style={{ position: 'absolute', top: '5%', left: '5%' }}>
        <ViewShot ref={viewShotRef} options={{ fileName: 'QRCode', format: 'png', quality: 0.9 }}>
          <QRCode
            value={data.qrCode}
            backgroundColor={BACKGROUND_COLOR}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
          />
        </ViewShot>
      </View>
      <View style={styles.innerContainer}>
        {credentialStatus === 'pending' && <OverlayLoader text="Deleting credential..." />}

        {isGenerating && <OverlayLoader text="Generating credential QR..." />}

        {isGeneratingPDF && <OverlayLoader text="Generating credential PDF..." />}

        <CredQRModal
          isVisible={showQRModal}
          onCloseClick={() => {
            setShowQRModal(false);
          }}
          qrCode={qrCode}
        />

        <View style={styles.topContainer}>
          <DetailCard
            item={data}
            issue_date={
              data.values['Issue Time']
                ? get_local_issue_date(data.values['Issue Time'])
                : undefined
            }
            organizationName={data.organizationName}
            setShowQRModal={openQRModal}
          />
        </View>

        <RenderValues
          listStyle={{
            marginTop: 10,
          }}
          listContainerStyle={{
            paddingBottom: '10%',
          }}
          inputTextColor={GRAY_COLOR}
          inputTextWeight={'normal'}
          inputTextSize={16}
          labelColor={BLACK_COLOR}
          values={data.values}
        />
      </View>
    </View>
  );
};

const styles = {
  mainContainer: {
    backgroundColor: BACKGROUND_COLOR,
    flex: 1,
    padding: 10,
  },
  topContainer: {
    margin: 8,
  },
  innerContainer: {
    borderRadius: 10,
    borderColor: BACKGROUND_COLOR,
    borderWidth: 1,
    backgroundColor: WHITE_COLOR,
    height: '100%',
  },
  headerRightIcon: {
    paddingRight: 15,
    color: BLACK_COLOR,
  },
};
export default CredDetailScreen;
