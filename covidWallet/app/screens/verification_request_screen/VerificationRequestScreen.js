import React, { useEffect, useState } from 'react';
import EmptyCredentialScreen from './EmptyCredentialScreen';
import CredentialListScreen from './CredentialListScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import { get_all_credentials_connectionless_verification } from '../../gateways/verifications';
import { showOKDialog } from '../../helpers/Toast';
import { ActivityIndicator, View, Linking, StyleSheet } from 'react-native';
import { VerificationAPI } from '../../gateways';
import LoadingDialog from '../../components/Dialogs/LoadingDialog';
import { AppColors } from '../../theme/Colors';
import { useTranslation } from 'react-i18next';
import { convertStringToBase64 } from '../../helpers/utils';

const VerificationRequestScreen = props => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [verificationRequestId, setVerificationRequestId] = useState(null);
  const [redirectCallback, setRedirectCallback] = useState(null);

  // Support both props and route params
  const credentialData = props?.route?.params?.data || props?.data || route?.params?.data;
  const scanData = credentialData?.scanData;

  useEffect(() => {
    initializeScreen();
  }, [scanData]);

  const initializeScreen = async () => {
    try {
      setLoading(true);
      setError(false);
      if (scanData) {
        // Process QR scan verification first
        await processVerificationRequest(scanData);
      } else {
        setData([]);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
    }
  };

  // Process verification request from QR code scan
  const processVerificationRequest = async scanData => {
    try {
      let parsedData = JSON.parse(scanData);

      if (parsedData.data === undefined) {
        parsedData = convertStringToBase64(JSON.stringify(parsedData));
      } else {
        parsedData = parsedData.data;
      }
      const result = await VerificationAPI.send_request_to_agency(parsedData);

      if (result.data.success) {
        const credentials = result.data.verification;
        const verificationId = credentials.metadata?.verificationRequestId;
        const callback = credentials.metadata?.redirectCallback || null;

        // Store in state for use in acceptButtonClick
        setVerificationRequestId(verificationId);
        setRedirectCallback(callback);

        if (verificationId) {
          await fetchVerificationList(verificationId);
        } else {
          setData([]);
          setLoading(false);
        }
      } else {
        setLoading(false);
        showOKDialog(
          t('messages.verification_fail_title'),
          t('messages.verification_fail_message'),
          () => {
            navigation.navigate('MainScreen');
          }
        );
      }
    } catch (error) {
      setLoading(false);
      showOKDialog(
        t('messages.verification_fail_title_1'),
        t('messages.verification_fail_message_1'),
        () => {
          navigation.navigate('MainScreen');
        }
      );
    }
  };

  // Get verification list
  const fetchVerificationList = async verificationId => {
    try {
      if (!verificationId) {
        setData([]);
        setLoading(false);
        return;
      }

      const result = await get_all_credentials_connectionless_verification(verificationId);

      if (result.data.success && result.data.availableCredentials.length > 0) {
        let cred = result.data.availableCredentials;
        let fullyVaccinatedCreds = [];
        cred.forEach(credItem => {
          if (
            credItem.values != undefined &&
            credItem.values.Dose != null &&
            credItem.values.Dose != undefined
          ) {
            if (credItem.values.Dose == '2/2') {
              fullyVaccinatedCreds.push(credItem);
            }
          }
        });

        setData(fullyVaccinatedCreds.length ? fullyVaccinatedCreds : cred);
        setError(false);
      } else {
        setData([]);
        setError(false);
      }
    } catch (error) {
      setError(true);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setData([]);
    setLoading(false);
    setSubmitting(false);
    setError(false);
  };

  const closeButtonClick = () => {
    navigation.navigate('MainScreen');
  };

  const goBackToMainScreen = async () => {
    resetState();
    navigation.navigate('MainScreen');
  };

  const rejectButtonClick = async () => {
    navigation.navigate('MainScreen');
  };

  const acceptButtonClick = async credential => {
    if (!credential) return;
    try {
      setSubmitting(true);
      await VerificationAPI.submit_verification_connectionless(
        verificationRequestId,
        credential.policyName,
        credential.credentialId
      );

      if (redirectCallback != undefined && redirectCallback != '') {
        await Linking.openURL(redirectCallback);
        await new Promise(resolve => setTimeout(resolve, 1000));
        resetState();
        navigation.navigate('MainScreen');
      } else {
        showOKDialog('ZADA', 'Submitted Successfully!', goBackToMainScreen);
      }
    } catch (error) {
      alert(t('errors.something_went_wrong'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={AppColors.PRIMARY} />
      </View>
    );
  }

  return data.length === 0 ? (
    <EmptyCredentialScreen onClose={closeButtonClick} />
  ) : (
    <View style={{ flex: 1 }}>
      <CredentialListScreen
        data={data}
        onAccept={acceptButtonClick}
        onReject={rejectButtonClick}
        onClose={closeButtonClick}
      />
      {submitting && (
        <LoadingDialog
          visible={true}
          label={t('VerificationRequestScreen.submittin_verification')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100 %',
    backgroundColor: AppColors.BACKGROUND,
  },
});

export default VerificationRequestScreen;
