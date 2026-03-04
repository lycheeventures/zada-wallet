import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectConnections } from '../../store/connections/selectors';
import { selectAutoAcceptConnection } from '../../store/auth/selectors';
import { acceptConnection } from '../../store/connections/thunk';
import { addAction } from '../../store/actions';
import { showOKDialog } from '../../helpers/Toast';
import { getConnectionDetails } from './utils';
import CustomProgressBar from './components/CustomProgressBar';
import { AppColors } from '../../theme/Colors';

interface ConnectionAcceptScreenRouteParams {
  qrJSON: any;
}

const ConnectionAccept = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute();
  const dispatch = useAppDispatch();

  // Selectors
  const connections = useAppSelector(selectConnections.selectAll);
  const auto_accept_connection = useAppSelector(selectAutoAcceptConnection);

  const [isLoading, setIsLoading] = useState(true);
  const [dialogShown, setDialogShown] = useState(false);

  const params = route.params as ConnectionAcceptScreenRouteParams;

  useEffect(() => {
    verifyConnection();
  }, []);

  const verifyConnection = async () => {
    try {
      const qrJSON = params?.qrJSON;

      if (!qrJSON) {
        showConnectionError();
        return;
      }

      // Get connection details
      const data = await getConnectionDetails(qrJSON.metadata, qrJSON);

      // Check if connection already exists
      const connectionExists = connections.find(x => x.name === data.organizationName);
      if (connectionExists) {
        showConnectionAlreadyExists(data.organizationName);
        return;
      }

      // Check auto-acceptance setting
      if (!auto_accept_connection) {
        // Add to pending actions and go back
        dispatch(addAction(qrJSON));
        goBack();
        return;
      }

      // Auto-accept the connection
      setIsLoading(true);
      dispatch(acceptConnection(qrJSON.metadata) as any);

      // Show success dialog
      setTimeout(() => {
        setIsLoading(false);
        showConnectionSuccess();
      }, 500);
    } catch (error: any) {
      setIsLoading(false);
      showConnectionError();
    }
  };

  const showConnectionSuccess = () => {
    if (!dialogShown) {
      setDialogShown(true);
      showOKDialog('ZADA', t('messages.success_connection'), () => {
        goBack();
      });
    }
  };

  const showConnectionAlreadyExists = (organizationName: String) => {
    if (!dialogShown) {
      setIsLoading(false);
      setDialogShown(true);
      const message = t('messages.connection_already_exists_message', { organizationName });
      showOKDialog(t('messages.connection_already_exists_title'), message, () => {
        goBack();
      });
    }
  };

  const showConnectionError = () => {
    if (!dialogShown) {
      setIsLoading(false);
      setDialogShown(true);
      showOKDialog(
        t('messages.connection_fail_title'),
        t('messages.connection_fail_message'),
        () => {
          goBack();
        }
      );
    }
  };

  const goBack = () => {
    navigation.navigate('MainScreen');
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.progressViewStyle}>
          <CustomProgressBar isVisible={true} text={t('messages.please_wait')} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.BLACK,
  },
  progressViewStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.TRANSPARENT2,
  },
});

export default ConnectionAccept;
