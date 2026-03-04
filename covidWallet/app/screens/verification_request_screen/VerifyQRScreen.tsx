import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import CredValuesModal from '../qr/components/CredValuesModal';
import SuccessModal from '../qr/components/SuccessModal';
import FailureModal from '../qr/components/FailureModal';
import { VerificationAPI } from '../../gateways';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList as MainParamList } from '../../navigation/types';
import CustomProgressBar from '../qr/components/CustomProgressBar';

type Props = NativeStackScreenProps<MainParamList, 'VerifyQRScreen'>;

const VerifyQRScreen = ({ route, navigation }: Props) => {
  const { credential, values } = route.params;

  const [showCredValues, setShowCredValues] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const onVerifyPress = async () => {
    try {
      setShowCredValues(false);
      setIsVerifying(true);
      setShowError(false);
      setShowSuccess(false);

      const result = await VerificationAPI.submit_cold_verification(
        credential.data,
        credential.signature,
        credential.tenantId,
        credential.keyVersion
      );

      if (result.data.success) {
        setShowSuccess(true);
      } else {
        setErrMsg('Failed to validate credential');
        setShowError(true);
      }
    } catch (e) {
      setErrMsg('Unable to verify credential');
      setShowError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const goToMainScreen = () => {
    setShowCredValues(false);
    setShowError(false);
    setShowSuccess(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainScreen' }],
    });
  };

  return (
    <View style={styles.container}>
      <CredValuesModal
        values={values}
        isVisible={showCredValues}
        heading={'Credential Information'}
        isScanning={false}
        onCloseClick={() => goToMainScreen()}
        onVerifyPress={onVerifyPress}
      />

      <SuccessModal
        isVisible={showSuccess}
        heading="Success"
        info="Credential is verified successfully"
        onOkayPress={() => {
          setShowSuccess(false);
          goToMainScreen();
        }}
        onCloseClick={() => {
          setShowSuccess(false);
          goToMainScreen();
        }}
      />

      <FailureModal
        isVisible={showError}
        heading="Invalid Credential"
        info={errMsg}
        onOkayPress={() => {
          setShowError(false);
          goToMainScreen();
        }}
        onCloseClick={() => {
          setShowError(false);
          goToMainScreen();
        }}
      />

      {isVerifying && (
        <View style={styles.progressViewStyle}>
          <CustomProgressBar isVisible={true} text={'Verifying ...'} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressViewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default VerifyQRScreen;
