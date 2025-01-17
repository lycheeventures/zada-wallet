import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Linking, Switch, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { getVersion } from 'react-native-device-info';
import Icon from 'react-native-vector-icons/AntDesign';

import { AppColors, BLACK_COLOR, GRAY_COLOR, WHITE_COLOR } from '../theme/Colors';
import { getItem, saveItem } from '../helpers/Storage';
import { BIOMETRIC_ENABLED, APP_VERSION, PIN_CODE } from '../helpers/ConfigApp';
import { showAskDialog, showMessage, showNetworkMessage, showOKDialog } from '../helpers/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { updateUser } from '../store/auth';
import { changeAppStatus } from '../store/app';
import { clearAllAndLogout, deleteAccountAndClearAll } from '../store/utils';
import { selectAutoAcceptConnection, selectUser } from '../store/auth/selectors';
import { selectAppStatus, selectNetworkStatus } from '../store/app/selectors';
import useDevelopment from '../hooks/useDevelopment';
import OverlayLoader from '../components/OverlayLoader';
import BiometricModal from '../components/Modal/BiometricModal';

export default function SettingsScreen(props) {
  // Constants
  const dispatch = useAppDispatch();

  // Selectors
  const { t } = useTranslation();
  const autoAcceptConnection = useAppSelector(selectAutoAcceptConnection);
  const user = useAppSelector(selectUser);
  const appStatus = useAppSelector(selectAppStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // hooks
  const { longPressCount, pressCount, buttonPressed, developmentMode, setDevelopmentMode } =
    useDevelopment();

  const [isBioEnable, setBioEnable] = useState(false);
  const [isBiometricModalVisible, setBiometricModalVisible] = useState(false);
  const [isAcceptConnectionEnabled, setIsAcceptConnectionEnabled] = useState(autoAcceptConnection);
  const [version, setVersion] = useState(null);

  // Set App Status to idle on load.
  useEffect(() => {
    dispatch(changeAppStatus('idle'));
  }, [dispatch]);

  useEffect(() => {
    const updatevalues = async () => {
      let appVersion = JSON.parse((await getItem(APP_VERSION)) || null);

      let biometric = JSON.parse((await getItem(BIOMETRIC_ENABLED)) || 'false');

      setBioEnable(biometric);
      setVersion(appVersion);
    };
    updatevalues();
  }, []);

  const _toggleBio = (value) => {
    if (value === false) {
      setBiometricModalVisible(false);
      _bioResult(true, value);
      return;
    }
    setBiometricModalVisible(true);
  };

  const _bioResult = async (result, value) => {
    if (result) {
      // Saving preference in asyncstorage.
      await saveItem(BIOMETRIC_ENABLED, JSON.stringify(value));

      // Display message.
      if (value) {
        setBioEnable(true);
        // Display message.
        setTimeout(() => {
          showMessage('ZADA Wallet', 'Biometric enabled!');
        }, 1000);
      } else {
        setBioEnable(false);
        setTimeout(() => {
          showMessage('ZADA Wallet', 'Biometric disabled!');
        }, 1000);
      }
    } else {
      if (result) setBioEnable(false);
    }

    // Setting modal to false.
    setBiometricModalVisible(false);
  };

  const _toggleAcceptConnection = (value) => {
    dispatch(updateUser({ ...user, auto_accept_connection: value }));
    setIsAcceptConnectionEnabled(value);
  };

  const onLogoutPressed = async () => {
    if (networkStatus === 'disconnected') {
      showNetworkMessage();
      return;
    }

    showAskDialog(
      'Are you sure?',
      t('messages.logout'),
      async () => {
        dispatch(changeAppStatus('loading'));
        const pCode = await getItem(PIN_CODE);
        saveItem(PIN_CODE, pCode);
        clearAllAndLogout(dispatch);
      },
      () => { },
      'Ok'
    );
  };

  // when user will click on edit profile screen
  const _onEditProfileClick = () => {
    props.navigation.navigate('ProfileScreen', { initDeleteAccount });
  };

  const initDeleteAccount = () => {
    showOKDialog(
      'ZADA Wallet',
      'Account deletion has been intiated. An Email has been dispatched. Please check your mailbox to continue with this process.',
      () => {
        console.log('ok');
      }
    );

    dispatch(changeAppStatus('loading'));
    deleteAccountAndClearAll(dispatch);
  };

  const _onLanguageClick = () => {
    props.navigation.navigate('LanguageSelectionScreen')
  }

  const onBiometricModalDismiss = () => {
    setBioEnable(false);
    setBiometricModalVisible(false);
  }

  return (
    <View style={styles._mainContainer}>
      {appStatus === 'loading' && <OverlayLoader text="Logging out..." />}
      {isBiometricModalVisible && <BiometricModal oneTimeAuthentication isVisible={isBiometricModalVisible} onDismiss={onBiometricModalDismiss} onSuccess={(e) => _bioResult(e, !isBioEnable)} />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles._list}
        contentContainerStyle={styles._listContainer}>
        <Text style={styles._rowHeading}>{t('SettingsScreen.general')}</Text>
        <View style={styles._row}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.authenticate_with_biometric')}</Text>
          <Switch
            trackColor={{
              false: AppColors.BACKGROUND,
              true: AppColors.BLUE,
            }}
            thumbColor="#ffffff"
            ios_backgroundColor="#ffffff"
            onValueChange={_toggleBio}
            value={isBioEnable}
          />
        </View>

        <View style={styles._row}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.auto_accept_connections')}</Text>
          <Switch
            trackColor={{
              false: AppColors.BACKGROUND,
              true: AppColors.BLUE,
            }}
            thumbColor="#ffffff"
            ios_backgroundColor="#ffffff"
            onValueChange={_toggleAcceptConnection}
            value={isAcceptConnectionEnabled}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => {
            _onEditProfileClick();
          }}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.edit_profile')}</Text>
          <Icon name="right" color={AppColors.BLUE} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => {
            _onLanguageClick();
          }}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.change_language')}</Text>
          <Icon name="right" color={AppColors.BLUE} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => {
            onLogoutPressed();
          }}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.logout')}</Text>
          <Icon name="right" color={AppColors.BLUE} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={buttonPressed}
          onPress={longPressCount !== 3 ? () => { } : buttonPressed}>
          <Text style={[styles._rowHeading, { marginTop: 15 }]}>{t('SettingsScreen.support')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => props.navigation.navigate('ContactUs')}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.contact_us')}</Text>
          <Icon name="right" color={AppColors.BLUE} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => {
            Linking.openURL('https://zada.io/privacy-policy/');
          }}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.license_and_agreements')}</Text>
          <Icon name="right" color={AppColors.BLUE} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => props.navigation.navigate('AboutUs')}>
          <Text style={styles._rowLabel}>{t('SettingsScreen.about_us')}</Text>
          <Icon name="right" color={AppColors.BLUE} size={18} />
        </TouchableOpacity>

        <Text style={styles.devTextStyle}>
          {longPressCount === 3 && !developmentMode
            ? 'Now just tap ' + (4 - pressCount) + ' more times!'
            : ''}
        </Text>
        {developmentMode && (
          <View activeOpacity={0.8} style={styles._row}>
            <Text style={styles._rowLabel}>Development Mode</Text>
            <Switch
              trackColor={{
                false: AppColors.BACKGROUND,
                true: AppColors.BLUE,
              }}
              ios_backgroundColor="#ffffff"
              onValueChange={() => setDevelopmentMode(!developmentMode)}
              value={developmentMode}
            />
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Text
          onPress={() => {
            if (Platform.OS === 'android')
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.zadanetwork.wallet'
              );
            else Linking.openURL('https://apps.apple.com/us/app/zada-wallet/id1578666669');
          }}
          style={styles._appVersion}>{`Version ${version == undefined || version === null ? getVersion().toString() : (version.version || version)
            }`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
  },
  _list: {
    flexGrow: 1,
  },
  _listContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  _row: {
    width: '100%',
    minHeight: Dimensions.get('screen').height * 0.06,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    padding: 10,
    shadowColor: BLACK_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 5,
  },
  _rowHeading: {
    fontSize: 16,
    textTransform: 'uppercase',
    color: GRAY_COLOR,
    marginBottom: 5,
  },
  _rowLabel: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    color: BLACK_COLOR,
  },
  _appVersion: {
    fontSize: 14,
    color: BLACK_COLOR,
    textAlign: 'center',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 10,
  },
  footer: {
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
  },
  devTextStyle: {
    textAlign: 'center',
    marginTop: 24,
  },
});
