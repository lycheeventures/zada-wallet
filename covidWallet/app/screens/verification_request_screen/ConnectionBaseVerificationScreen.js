import React, { useEffect, useState } from 'react';
import EmptyCredentialScreen from './EmptyCredentialScreen';
import CredentialListScreen from './CredentialListScreen';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  get_all_credentials_for_verification,
  submit_verification,
  delete_verification,
} from '../../gateways/verifications';
import { deleteAction } from '../../store/actions';
import { showOKDialog, _showAlert, showMessage } from '../../helpers/Toast';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/Colors';
import CommonErrorView from '../../components/Error/CommonErrorView';
import { useTranslation } from 'react-i18next';
import BiometricModal from '../../components/Modal/BiometricModal';
import { useAppDispatch } from '../../store';

const ConnectionBaseVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBioMetric, setShowBioMetric] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [buttonType, setButtonType] = useState(null);

  const verificationRequest = route.params;
  const verificationId = verificationRequest?.verificationId ?? null;
  const connectionId = verificationRequest?.connectionId ?? null;

  // Get verification list
  const fetchVerificationList = async () => {
    try {
      setLoading(true);
      setError(false);
      if (!verificationId) {
        setData([]);
        setLoading(false);
        return;
      }
      const result = await get_all_credentials_for_verification(verificationId);

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
  }, [verificationId]);

  const closeButtonClick = () => {
    navigation.navigate('MainScreen');
  };

  const goBackToMainScreen = async () => {
    navigation.navigate('MainScreen');
  };

  const rejectButtonClick = async () => {
    setButtonType('REJECT');
    setTimeout(() => {
      setShowBioMetric(true);
    }, 500);
  };

  const acceptHandler = async credential => {
    if (!credential) return;
    setButtonType('ACCEPT');
    setSelectedCredential(credential);
    setTimeout(() => {
      setShowBioMetric(true);
    }, 500);
  };

  const onBiometricSuccess = async () => {
    setShowBioMetric(false);
    if (buttonType === 'REJECT') {
      try {
        await delete_verification(verificationId);
        goBackToMainScreen();
        // Delete Verficication request from action list.
        dispatch(deleteAction(connectionId + verificationId));
      } catch (err) {
        console.log({ err });
        _showAlert('Error: ', 'Something unexpected happened, please try again.');
      }
    } else if (buttonType === 'ACCEPT') {
      if (!selectedCredential) return;
      try {
        let result = await submit_verification(
          verificationId,
          selectedCredential.credentialId,
          selectedCredential.policyName
        );

        if (result.data.success) {
          showOKDialog(
            'Zada Wallet',
            t('messages.success_verification_request_submit'),
            goBackToMainScreen
          );
        } else {
          showMessage('Zada', result.data.error);
        }
        // Delete Verficication request from action list.
        dispatch(deleteAction(connectionId + verificationId));
      } catch (err) {
        console.log({ err });
        _showAlert('Error: ', 'Something unexpected happened, please try again.');
      }
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
        onAccept={acceptHandler}
        onReject={rejectButtonClick}
        onClose={closeButtonClick}
        imageUrl={verificationRequest?.imageUrl}
      />
      {showBioMetric && (
        <BiometricModal
          oneTimeAuthentication={true}
          isVisible={showBioMetric}
          onDismiss={() => setShowBioMetric(false)}
          onSuccess={onBiometricSuccess}
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

export default ConnectionBaseVerificationScreen;
