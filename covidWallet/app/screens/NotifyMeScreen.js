import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIMARY_COLOR } from '../theme/Colors';
import ImageBoxComponent from '../components/ImageBoxComponent';
import TextComponent from '../components/TextComponent';
import GreenPrimaryButton from '../components/GreenPrimaryButton';
import messaging from '@react-native-firebase/messaging';
import { useAppDispatch, useAppSelector } from '../store';
import { updateIsAuthorized, updateToken, updateUser } from '../store/auth';
import { selectToken, selectUser } from '../store/auth/selectors';
import { AuthenticateUser } from './auth/utils';
import { changeAppStatus, updateAppSetupComplete } from '../store/app';
import { saveItemInLocalStorage } from '../helpers/Storage';

const img = require('../assets/images/notifications.png');

function NotifyMeScreen(props) {
  // Constants
  const dispatch = useAppDispatch();

  // Selectors
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectUser);

  // States
  const [loading, setLoading] = useState(false);

  async function enableNotifications() {
    setLoading(true);

    // ask for notification permission
    const authorizationStatus = await messaging().hasPermission();
    if (authorizationStatus == messaging.AuthorizationStatus.AUTHORIZED) {
      const authorizationStatus = await messaging().requestPermission({
        sound: true,
        badge: true,
        alert: true,
      });
      if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        console.log('Notification Permission => Authorized');
      } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        console.log('Notification Permission => Provisional');
      } else {
        console.log('Notification Permission => Disabled');
      }
    } else {
      const authorizationStatus = await messaging().requestPermission({
        sound: true,
        badge: true,
        alert: true,
      });
      if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
        console.log('Notification Permission => Authorized');
      } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        console.log('Notification Permission => Provisional');
      } else {
        console.log('Notification Permission => Disabled');
      }
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
    dispatch(updateToken(freshToken));
    saveItemInLocalStorage('isAppSetupComplete', true);
    dispatch(updateIsAuthorized(true));
    dispatch(updateAppSetupComplete(true));
    dispatch(changeAppStatus('idle'));
  }

  return (
    <View style={styles.viewStyle}>
      <View style={styles.textViewStyle}>
        <Text style={styles.TextContainerHead}>Get notified</Text>
        <TextComponent
          onboarding={true}
          text="We use push notifications to deliver messages for important events,
          such as when you recieve a new digital certificate."
        />
      </View>
      <View style={styles.imageViewStyle}>
        <ImageBoxComponent source={img} />
      </View>
      <View style={styles.buttonViewStyle}>
        <GreenPrimaryButton
          loading={loading}
          text="ENABLE NOTIFICATIONS"
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
    fontSize: 32,
    flexDirection: 'column',
  },
});

export default NotifyMeScreen;
