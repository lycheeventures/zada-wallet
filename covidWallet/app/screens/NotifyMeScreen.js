import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PRIMARY_COLOR } from '../theme/Colors';
import ImageBoxComponent from '../components/ImageBoxComponent';
import TextComponent from '../components/TextComponent';
import GreenPrimaryButton from '../components/GreenPrimaryButton';
import messaging from '@react-native-firebase/messaging';
import { useAppDispatch, useAppSelector } from '../store';
import { updateIsAuthorized, updateUser } from '../store/auth';
import { selectTempVar, selectToken, selectUser } from '../store/auth/selectors';
import { fetchToken } from '../store/auth/thunk';

const img = require('../assets/images/notifications.png');

function NotifyMeScreen() {
  const dispatch = useAppDispatch();
  // Selectors
  const tempUser = useAppSelector(selectTempVar);
  const token = useAppSelector(selectToken);

  // States
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clicked) {
      dispatch(updateIsAuthorized(true));
    }
  }, [clicked, token, dispatch]);

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

    await dispatch(updateUser({ ...tempUser, isNew: false }));
    await dispatch(fetchToken({ secret: undefined }));
    setLoading(false);
    setClicked(true);
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
