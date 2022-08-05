import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import {
  BLACK_COLOR,
  GRAY_COLOR,
  GREEN_COLOR,
  WHITE_COLOR,
  BACKGROUND_COLOR,
} from '../theme/Colors';
import ViewShot from "react-native-view-shot";
import { themeStyles } from '../theme/Styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  delete_credential,
  generate_credential_qr,
} from '../gateways/credentials';
import QRCode from 'react-native-qrcode-svg';
import { showMessage, showAskDialog, _showAlert } from '../helpers/Toast';
import { deleteCredentialByCredId, getItem, saveItem } from '../helpers/Storage';
import OverlayLoader from '../components/OverlayLoader';
import SimpleButton from '../components/Buttons/SimpleButton';
import { PreventScreenshots } from 'react-native-prevent-screenshots';
import CredQRModal from '../components/CredQRModal';
import RenderValues from '../components/RenderValues';
import ConstantsList from '../helpers/ConfigApp';
import { Buffer } from 'buffer';
import { _handleAxiosError } from '../helpers/AxiosResponse';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { get_local_date_time, get_local_issue_date, parse_date_time } from '../helpers/time';
import DetailCard from '../components/Cards/DetailCard';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCredentialsStatus } from '../store/credentials/selectors';
import { removeCredentials } from '../store/credentials/thunk';

function DetailsScreen(props) {
  // Constants
  const data = props.route.params.data; // Credential
  const dispatch = useAppDispatch();

  // Selectors
  const credentialStatus = useAppSelector(selectCredentialsStatus);

  // Refs
  const viewShotRef = useRef(null);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGenerating, setGenerating] = useState(false);
  const [isGeneratingPDF, setGeneratingPDF] = useState(false);

  // Setting delete Icon
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <MaterialIcons
            onPress={() => generateAndSharePDF()}
            style={styles.headerRightIcon}
            size={25}
            name="share"
            padding={30}
          />
          <MaterialIcons
            onPress={() => (credentialStatus === 'idle' ? showAlert() : {})}
            style={styles.headerRightIcon}
            size={25}
            name="delete"
            padding={30}
          />
        </View>
      ),
    });
  });

  useEffect(() => {
    if (credentialStatus === 'succeeded') {
      showMessage('ZADA Wallet', 'Credential is deleted successfully');
      props.navigation.goBack();
    }
  }, [credentialStatus, props.navigation]);

  async function onSuccess() {
    try {
      dispatch(removeCredentials(data.credentialId));
    } catch (e) {
      _handleAxiosError(e);
    }
  }

  async function ReaderString(jsonData) {
    let values = JSON.parse(jsonData.qrCode);
    values = {
      ...values,
      issuer: 'zada',
    };
    values = JSON.stringify(values);

    return await viewShotRef.current.capture();
  }

  async function generateHTML(jsonData) {
    let url = await ReaderString(jsonData);

    if (!jsonData) {
      return '<div>Record Not Found</div>';
    }

    // Ordering data
    const orderedData = Object.keys(jsonData.values).sort().reduce(
      (obj, key) => {
        obj[key] = jsonData.values[key];
        return obj;
      },
      {}
    );

    let credentialDetails = Object.keys(orderedData).map((key, index) => {
      let value = orderedData[key];
      value = parse_date_time(value)

      return `<div class="pair-items">
              <b class="text-space" id="iizaq">${key}:</b>
              <p id="iizaq">${value}</p>
            </div>
              `;
    });

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
     <style>
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
      }
      .row {
        display: flex;
        justify-content: flex-start;
        align-items: stretch;
        flex-wrap: nowrap;
        padding: 0 10px;
      }
      .cell {
        flex-grow: 1;
        flex-basis: 100%;
      }
      #ix98 {
        flex-basis: 86.68%;
      }
      #ih9d {
        flex-basis: 50%;
        max-width: 100px;
      }
      #ivsh {
        height: 176px;
      }
      .pair-items p,
      .pair-items b {
        margin: 5px 0px !important;
      }
      #i2yt {
        width: calc(100% - 100px);
        position: absolute;
        top: 50%;
        left: 130px;
        transform: translateY(-50%);
        padding-left: 30px;
        justify-content: space-between;
        flex-direction: column;
        display: flex;
      }
      #ifo2 {
        color: black;
        width: 100%;
        height: 100%;
      }
      #ik2g {
        padding: 10px;
        font-size: 50px;
        display: flex;
        height: 100%;
        align-items: center;
      }

      #ig8t8 {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      #inj3u {
        display: flex;
        padding-right: 20px;
        padding-left: 20px;
      }
      #imcyy {
        margin: 10px 0 0;
        color: black;
        width: 150px;
        height: 150px;
      }
      .title-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .title-wrap p {
        flex-shrink: 0;
        margin: 0;
      }
      #ii0jf {
        font-size: 24px;
        padding: 10px;
        justify-content: space-around;
        display: flex;
      }
      #i6vai {
        justify-content: space-around;
        padding: 0 10px 10px 10px;
      }
      #id7t6 {
        padding: 0 10px;
      }
      #ibugt {
        width: 100%;
        height: 100%;
      }
      #ibk3g {
        width: 100%;
        padding: 5px;
        font-size: 16px;
      }
      #iutjp {
        display: flex;
        justify-content: flex-end;
      }
      #ijmqg {
        padding: 10px;
        display: flex;
        justify-content: space-around;
        align-items: center;
      }
      #iizaq {
        color: rgb(68, 68, 68);
        font-family: Poppins, Arial, Roboto, sans-serif;
        font-size: 12px;
      }

      #i5lto {
        width: 100%;
        display: flex;
      }
      .i0xih > div {
        display: flex;
        flex: 50%; /* or - flex: 0 50% - or - flex-basis: 50% - */
        /*demo*/
        padding: 5px;
        border: 1px solid black;
        border-top: 0;
        border-left: 0;
      }
      .i0xih > div:nth-child(-n + 2) {
        border-top: 1px solid black;
      }

      .i0xih > div:nth-child(odd) {
        border-left: 1px solid black;
      }

      .pair-items {
        /* display: flex;
        align-items: center; */
        width: 100%;
      }

      .up-items {
        position: relative;
        display: flex;
        align-items: flex-start;
      }

      #itii {
        position: relative;
        display: flex;
        align-items: center;
      }

      .i0xih {
        width: 100%;
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
      }

      #ir6hs {
        display: block;
      }

      #i0o3v {
       
      }
      .box-relative {
        position: relative;
      }
      @media (max-width: 768px) {
        .row {
          flex-wrap: wrap;
        }
      }
    </style>
  </head>

  <body id="i2wh">
    <div class="row" id="itii">
      <div class="cell" id="ih9d">
        <img id="ifo2" src="${jsonData.imageUrl}" />
      </div>
      <div class="cell" id="i2yt">
        <div id="ik2g"><b id="i86u">${jsonData.organizationName}</b></div>
      </div>
    </div>
    <div class="row up-items">
      <div class="cell" id="i5lto">
        <div id="ibk3g">
         <div class="title-wrap">
            <p>Credential Details</p>
            <div class="cell" id="ir6hs">
              <div id="iutjp">
                <span id="iizaq"
                  >Date: ${get_local_date_time(new Date())}</span
                >
              </div>
            </div>
          </div>
          <div class="i0xih">${credentialDetails.join('')}</div>
        </div>
      </div>
     
    </div>

    <div class="row" id="id7t6">
      <div class="cell" id="ig8t8">     
         <img id="imcyy" src="${url}" />
        <div id="ijmqg">
          <span id="iizaq">Scan with ZADA Wallet to verify.</span>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="cell" id="inj3u">
        <img
          id="ibugt"
          src="https://zada-assets.s3.ap-southeast-1.amazonaws.com/zada-process-pdf-image.png"
        />
      </div>
    </div>
    <div class="row box-relative">
      <div class="cell" id="i0o3v">
        <div id="ijmqg">
          <span id="iizaq"
            >© 2022 All Rights Reserved. ZADA Solutions Pte Ltd.</span
          >
        </div>
      </div>
    </div>

    
  </body>
</html>


`;
  }

  //geneate HTML from values

  async function generateAndSharePDF() {
    setGeneratingPDF(true);

    let options = {
      html: await generateHTML(data),
      fileName: 'ceritificate',
      directory: 'Documents',
    };

    let file = await RNHTMLtoPDF.convert(options);

    //setPDFurl(file.filePath);

    const shareOptions = {
      title: 'Certificate',
      url:
        Platform.OS === 'android' ? `file://${file.filePath}` : file.filePath,
    };

    try {
      setGeneratingPDF(false);

      const ShareResponse = await Share.open(shareOptions);
    } catch (error) {
      setGeneratingPDF(false);

      console.log('error', error);
    }
  }

  async function showAlert() {
    showAskDialog(
      'Are you sure?',
      'Are you sure you want to delete this certificate?',
      onSuccess,
      () => { },
    );
  }

  async function generateQrCode() {
    try {
      setGenerating(true);
      let credentialId = data.credentialId;

      const result = await generate_credential_qr(credentialId);
      if (result.data.success) {
        let signature = result.data.signature;
        let tenantId = result.data.tenantId;
        let keyVersion = result.data.keyVersion;

        // Making QR based on signature and base 64 encoded data
        let qrData = {
          data: Buffer.from(JSON.stringify(data.values)).toString('base64'),
          signature: signature,
          tenantId: tenantId,
          keyVersion: keyVersion,
          type: 'cred_ver',
        };

        let QR = `${JSON.stringify(qrData)}`;

        // Get all credentials
        let credentials = JSON.parse(await getItem(ConstantsList.CREDENTIALS));

        // Find this credential and update it with QR
        let index = credentials.findIndex(
          (item) => item.credentialId == credentialId,
        );
        credentials[index].qrCode = QR;
        await saveItem(ConstantsList.CREDENTIALS, JSON.stringify(credentials));

        // Open QR After Updating Credentials
        data.qrCode = QR;
      } else {
        _showAlert('ZADA Wallet', error.message);
      }
      setGenerating(false);
    } catch (error) {
      setGenerating(false);
      _showAlert('ZADA Wallet', error.message);
    }
  }

  useEffect(() => {
    const focusEvent = props.navigation.addListener('focus', () => {
      PreventScreenshots.start();
    });
    const blurEvent = props.navigation.addListener('blur', () => {
      PreventScreenshots.stop();
    });

    return () => {
      focusEvent;
      blurEvent;
    };
  }, []);

  return (
    <View style={[themeStyles.mainContainer]}>
      {/* hidden QRCODE */}
      <View style={{ position: "absolute", top: '5%', left: '5%' }}>
        <ViewShot ref={viewShotRef} options={{ fileName: "QRCode", format: "png", quality: 0.9 }}>
          <QRCode
            value={data.qrCode}
            backgroundColor={BACKGROUND_COLOR}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
          />
        </ViewShot>
      </View>
      <View style={styles.innerContainer}>
        {credentialStatus === 'pending' && (
          <OverlayLoader text="Deleting credential..." />
        )}

        {isGenerating && <OverlayLoader text="Generating credential QR..." />}

        {isGeneratingPDF && (
          <OverlayLoader text="Generating credential PDF..." />
        )}

        {data.qrCode !== undefined && (
          <CredQRModal
            isVisible={showQRModal}
            onCloseClick={() => {
              setShowQRModal(false);
            }}
            qrCode={data.qrCode}
          />
        )}

        {data.qrCode != undefined ? (
          <View style={styles.topContainer}>
            <DetailCard
              schemaId={data.schemaId}
              imageUrl={data.imageUrl}
              issue_date={data.values['Issue Time']
                ? get_local_issue_date(data.values['Issue Time'])
                : undefined}
              organizationName={data.organizationName}
              setShowQRModal={setShowQRModal}
            />
          </View>
        ) : (
          <View style={{ margin: 15 }}>
            <Text style={styles._noQr}>
              You do not have QR of your credential.
            </Text>
            <SimpleButton
              onPress={generateQrCode}
              width={Dimensions.get('window').width * 0.32}
              title="Get QR"
              titleColor={WHITE_COLOR}
              buttonColor={GREEN_COLOR}
              style={{
                marginTop: 10,
                alignSelf: 'center',
              }}
            />
          </View>
        )}

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
}

const styles = StyleSheet.create({
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

  _noQr: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
});

export default DetailsScreen;
