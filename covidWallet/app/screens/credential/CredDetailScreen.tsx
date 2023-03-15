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
import { AppDispatch, RootState, useAppDispatch, useAppSelector } from '../../store';
import { selectCredentialsStatus, selectSingleCredential } from '../../store/credentials/selectors';

import OverlayLoader from '../../components/OverlayLoader';
import CredQRModal from './components/CredQRModal';
import DetailCard from './components/DetailCard';
import RenderValues from '../../components/RenderValues';
import usePreventScreenshot from '../../hooks/usePreventScreenshot';
import { compressCredentials, removeCredentials } from '../../store/credentials/thunk';
import { selectNetworkStatus } from '../../store/app/selectors';
import { ICredentialObject } from '../../store/credentials/interface';

interface IProps {
  route: any;
  navigation: any;
}

const CredDetailScreen = (props: IProps) => {
  // Constants
  const credentialId = props.route.params.credentialId;
  const data = useAppSelector((state: RootState) =>
    selectSingleCredential(state, credentialId)
  ) as ICredentialObject; // Credential Object

  const dispatch = useAppDispatch<AppDispatch>();
  const viewShotRef = useRef(null);

  // Selectors
  const credentialStatus = useAppSelector(selectCredentialsStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGenerating, setGenerating] = useState(data?.qrCode === undefined ? true : false);
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

  useEffect(() => {
    if (data.credentialId) {
      if (data?.qrCode === undefined || data?.qrCode?.v !== 3) {
        dispatch(compressCredentials(data.credentialId));
      } else if (isGenerating) setGenerating(false);
    }
  }, [showQRModal, data?.qrCode]);

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
  }, [networkStatus]);

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

      // Capturing QR image using viewshot library.
      let qrUrl = await viewShotRef?.current?.capture();

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
      if (data?.qrCode === undefined) {
        showNetworkMessage();
        return;
      }
    }
    setShowQRModal(bool);
  };

  async function onSuccess() {
    dispatch(removeCredentials(data.credentialId));
  }

  return (
    <View style={styles.mainContainer}>
      {/* hidden QRCODE */}
      <View style={{ position: 'absolute', top: '5%', left: '5%' }}>
        {data.qrCode !== undefined && (
          <ViewShot ref={viewShotRef} options={{ fileName: 'QRCode', format: 'png', quality: 0.9 }}>
            <QRCode
              value={JSON.stringify(data.qrCode)}
              backgroundColor={BACKGROUND_COLOR}
              size={Dimensions.get('window').width * 0.7}
              ecl="L"
            />
          </ViewShot>
        )}
      </View>
      <View style={styles.innerContainer}>
        {credentialStatus === 'pending' && <OverlayLoader text="Deleting credential..." />}

        {isGeneratingPDF && <OverlayLoader text="Generating credential PDF..." />}

        <CredQRModal
          isVisible={showQRModal}
          onCloseClick={() => {
            setShowQRModal(false);
          }}
          isGenerating={isGenerating}
          data={data.qrCode}
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
