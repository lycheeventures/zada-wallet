import React, {useEffect, useLayoutEffect, useState} from 'react';
import {StyleSheet, View, Image, Text, Dimensions} from 'react-native';
import {
  BLACK_COLOR,
  GRAY_COLOR,
  GREEN_COLOR,
  WHITE_COLOR,
  BACKGROUND_COLOR,
} from '../theme/Colors';
import {themeStyles} from '../theme/Styles';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  delete_credential,
  generate_credential_qr,
} from '../gateways/credentials';
import {showMessage, showAskDialog, _showAlert} from '../helpers/Toast';
import {deleteCredentialByCredId, getItem, saveItem} from '../helpers/Storage';
import OverlayLoader from '../components/OverlayLoader';
import SimpleButton from '../components/Buttons/SimpleButton';
import {analytics_log_show_cred_qr} from '../helpers/analytics';
import {PreventScreenshots} from 'react-native-prevent-screenshots';
import CredQRModal from '../components/CredQRModal';
import RenderValues from '../components/RenderValues';
import ConstantsList from '../helpers/ConfigApp';
import {Buffer} from 'buffer';
import {_handleAxiosError} from '../helpers/AxiosResponse';
import CredValuesModal from '../components/CredValuesModal';

function DetailsScreen(props) {
  // Credential
  const data = props.route.params.data;

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isGenerating, setGenerating] = useState(false);

  // Setting delete Icon
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <MaterialIcons
          onPress={() => (!isLoading ? showAlert() : {})}
          style={styles.headerRightIcon}
          size={25}
          name="delete"
          padding={30}
        />
      ),
    });
  });

  async function onSuccess() {
    try {
      setIsLoading(true);

      // Delete credentials Api
      let result = await delete_credential(data.credentialId);
      if (result.data.success) {
        deleteCredentialByCredId(data.credentialId);
        showMessage('ZADA Wallet', 'Credential is deleted successfully');
        props.navigation.goBack();
      } else {
        showMessage('ZADA Wallet', result.data.message);
      }

      setIsLoading(false);
    } catch (e) {
      _handleAxiosError(e);
      setIsLoading(false);
    }
  }

  async function showAlert() {
    showAskDialog(
      'Are you sure?',
      'Are you sure you want to delete this certificate?',
      onSuccess,
      () => {},
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

  ///after QR test Data

  let unEscapedStr = {
    data: 'eyJEb2N1bWVudCBJZCI6IjEyMzQiLCJHZW5kZXIiOiJNYWxlIiwiSXNzdWUgVGltZSI6IjA0LzA1LzIwMjIgMTI6MjU6MDAiLCJWaXJ1cyBOYW1lIjoiU0FSUy1Db1YtMiAoQ09WSUQtMTkpIiwiRG9zZSI6IjEvMiIsIkJpcnRoIERhdGUiOiIyMDIyLTA0LTA1IiwiVmFjY2luZSBNYW51ZmFjdHVyZXIiOiJCZWlqaW5nIEluc3RpdHV0ZSBvZiBCaW9sb2dpY2FsIFByb2R1Y3RzIENvLiwgTHRkLiAoQklCUCkiLCJWYWNjaW5lIE5hbWUiOiJTaW5vcGhhcm0gKEJJQlApIiwiRG9jdW1lbnQgVHlwZSI6Ik5hdGlvbmFsIFJlZ2lzdHJhdGlvbiBDYXJkIChOUkMpIiwiQWRtaW5pc3RyYXRpbmcgQ2VudGVyIjoiUHVuIEhsYWluZyBIb3NwaXRhbCIsIkNvdW50cnkiOiJNeWFubWFyIiwiVmFjY2luYXRpb24gQ2VydGlmaWNhdGUgSXNzdWVyIjoiUHVuIEhsYWluZyBWYWNjaW5hdGlvbiBDZW50ZXIgKER1bHdpY2ggQ29sbGVnZSAtIEhsYWluZyBUaGFyeWFyKSIsIlN0YWZmIE5hbWUiOiJJc3N1ZXIiLCJOYXRpb25hbGl0eSI6Ik15YW5tYXIiLCJGdWxsIE5hbWUiOiJUZXN0aW5nIn0=',
    signature:
      'eyJzaWduYXR1cmUiOiJFQ3k0MTlMNXExb09lTE1zWFhRdklkc0tJN3lOMy9RdWlQNXFVKzJLVmVad0lXTnFvcWVYWTRWKzJXNXVkVVZMZDV5T2N1RldPZ3lNZ3I3QXYrREN1UmQzR3FWaWlhNTJyTHJtbjg4dzFwalBOYnQydU12djhISXd6VUJ0WVVXTERjUDNKNmFSSjhwaUlNalFBRUJCYS9KU2NpNGd4ZSs0VG9zcnN0S3hmdXc9IiwibWQiOiJzaGEyNTYifQ==',
    tenantId: '318a987a-8408-4f5e-93c0-5644fd4ad029',
    keyVersion: '1',
    type: 'cred_ver',
  };
  //   unEscapedStr = unEscapedStr.replace(/\\/g, '');
  //   unEscapedStr = unEscapedStr.replace(/“/g, '"');

  //let test = JSON.parse(unEscapedStr);
  let credValues = Buffer.from(unEscapedStr.data, 'base64').toString();

  var orderValues = arrangeValues(JSON.parse(credValues));
  function arrangeValues(values) {
    let orderedValues = undefined;
    orderedValues = Object.keys(values)
      .sort()
      .reduce((obj, key) => {
        obj[key] = values[key];
        return obj;
      }, {});
    return orderedValues;
  }
  ///

  return (
    <View style={[themeStyles.mainContainer]}>
      <View style={styles.innerContainer}>
        {isLoading && <OverlayLoader text="Deleting credential..." />}

        {isGenerating && <OverlayLoader text="Generating credential QR..." />}

        {data.qrCode != undefined && (
          // <CredValuesModal
          //   values={orderValues}
          //   isVisible={showQRModal}
          //   heading={'test'}
          //   isScanning={showQRModal}
          //   onCloseClick={() => {
          //     setShowQRModal(false);
          //   }}
          // />

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
            <Image
              source={require('../assets/images/qr-code.png')}
              style={styles.topContainerImage}
            />
            <SimpleButton
              onPress={() => {
                setShowQRModal(true);
                analytics_log_show_cred_qr();
              }}
              title="Show QR"
              titleColor="white"
              buttonColor={GREEN_COLOR}
            />
          </View>
        ) : (
          <View style={{margin: 15}}>
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
            paddingHorizontal: 15,
          }}
          inputBackground={WHITE_COLOR}
          inputTextColor={BLACK_COLOR}
          inputTextWeight={'bold'}
          inputTextSize={16}
          labelColor={GRAY_COLOR}
          values={data.values}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    width: 200,
    height: 200,
    margin: 15,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  innerContainer: {
    padding: 20,
    borderRadius: 10,
    borderColor: BACKGROUND_COLOR,
    borderWidth: 1,
    backgroundColor: WHITE_COLOR,
    height: '100%',
  },
  topContainerImage: {
    width: '100%',
    height: '100%',
    tintColor: '#C1C1C1',
    position: 'absolute',
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
