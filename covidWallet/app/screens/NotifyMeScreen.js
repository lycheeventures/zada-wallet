import React, { useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PRIMARY_COLOR } from '../theme/Colors';
import ImageBoxComponent from '../components/ImageBoxComponent';
import TextComponent from '../components/TextComponent';
import GreenPrimaryButton from '../components/GreenPrimaryButton';
import messaging from '@react-native-firebase/messaging';
import { useAppDispatch, useAppSelector } from '../store';
import { updateIsAuthorized, updateToken, updateUser } from '../store/auth';
import { selectToken, selectUser } from '../store/auth/selectors';
import { AuthenticateUser } from './utils';
import { changeAppStatus, updateAppSetupComplete } from '../store/app';
import { saveItemInLocalStorage } from '../helpers/Storage';
import { getUserProfile } from '../store/auth/thunk';
import { fetchConnectionList } from '../store/connections/thunk';

const img = require('../assets/images/notifications.png');

function NotifyMeScreen(props) {
  // Constants
  const dispatch = useAppDispatch();

  // Selectors
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  // States
  const [loading, setLoading] = useState(false);

  async function requestIOSNotificationPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      return true;
    }

    return false;
  }

  async function requestAndroidNotificationPermission() {
    try {
      const status = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (status === false) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message:
              'ZADA Wallet needs notification permission to ' +
              'recieve credentials.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        }

        return false;
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async function enableNotifications() {
    setLoading(true);

    let granted = false;

    // ask for notification permission
    if (Platform.OS === 'ios') {
      granted = await requestIOSNotificationPermission();
    } else {
      granted = await requestAndroidNotificationPermission();
    }

    let data = {
      isNew: false,
      id: user.userId,
      walletSecret: user.secret,
      phone: user.phone,
      type: user.type ? user.type : undefined,
      auto_accept_connection: true,
      status: user.status ? user.status : undefined,
    };

    dispatch(updateUser({ ...data }));
    let freshToken = await AuthenticateUser(token);
    dispatch(updateAppSetupComplete(true));
    dispatch(updateToken(freshToken));
    saveItemInLocalStorage('isAppSetupComplete', true);
    await dispatch(getUserProfile()).unwrap();
    dispatch(fetchConnectionList(user.country));
    dispatch(updateIsAuthorized(true));
    dispatch(changeAppStatus('idle'));
  }

  return (
    <View style={styles.viewStyle}>
      <View style={styles.textViewStyle}>
        <Text style={styles.TextContainerHead}> {t('NotifyMeScreen.title')}</Text>
        <TextComponent
          onboarding={true}
          text={t('NotifyMeScreen.sub_title')}
        />
      </View>
      <View style={styles.imageViewStyle}>
        <ImageBoxComponent source={img} />
      </View>
      <View style={styles.buttonViewStyle}>
        <GreenPrimaryButton
          loading={loading}
          text={t('NotifyMeScreen.enable_btn')}
          nextHandler={enableNotifications}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  viewStyle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  textViewStyle: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  imageViewStyle: { flex: 2, alignItems: 'center', justifyContent: 'center' },
  buttonViewStyle: { flex: 3, alignItems: 'center', justifyContent: 'center' },
  TextContainerEnd: {
    alignItems: 'center',
    justifyContent: 'center',
    color: PRIMARY_COLOR,
    paddingTop: 10,
  },
  TextContainerHead: {
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 28,
    flexDirection: 'column',
  },
});

export default NotifyMeScreen;
