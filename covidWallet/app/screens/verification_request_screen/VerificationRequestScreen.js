import React, { useEffect, useState } from 'react';
import EmptyCredentialScreen from './EmptyCredentialScreen';
import CredentialListScreen from './CredentialListScreen';
import { useNavigation } from '@react-navigation/native';
import { get_all_credentials_connectionless_verification } from '../../gateways/verifications';
import { showOKDialog } from '../../helpers/Toast';
import { ActivityIndicator, View, Linking, StyleSheet } from 'react-native';
import { VerificationAPI } from '../../gateways';
import LoadingDialog from '../../components/Dialogs/LoadingDialog';
import { AppColors } from '../../theme/Colors';
import CommonErrorView from '../../components/Error/CommonErrorView';
import { useTranslation } from 'react-i18next';

const VerificationRequestScreen = props => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const verificationRequestId = props?.data?.metadata?.verificationRequestId ?? null;
  const redirectCallback = props?.data?.metadata?.redirectCallback || null;

  // Get verification list
  const fetchVerificationList = async () => {
    try {
      setLoading(true);
      setError(false);
      if (!verificationRequestId) {
        setData([]);
        setLoading(false);
        return;
      }

      const result = await get_all_credentials_connectionless_verification(verificationRequestId);

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

        if (fullyVaccinatedCreds.length) {
          setData(fullyVaccinatedCreds);
        } else {
          setData(cred);
        }
      } else {
        setData([]);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationList();
  }, [verificationRequestId]);

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

  if (error) {
    return <CommonErrorView onRetry={fetchVerificationList} />;
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
