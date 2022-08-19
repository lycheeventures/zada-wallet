import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Notifications, Registered, RegistrationError } from 'react-native-notifications';
import { useAppDispatch } from '../store';
import { fetchActions } from '../store/actions/thunk';
import { AuthAPI } from '../gateways';

const useNotification = () => {
  // Constants
  const dispatch = useAppDispatch();

  // Registering Notifications.
  useEffect(() => {
    Notifications.registerRemoteNotifications();

    // Register Device Token
    Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
      if (event.deviceToken) {
        AuthAPI.registerDeviceToken(Platform.OS, event.deviceToken);
      }
    });

    // Failed
    Notifications.events().registerRemoteNotificationsRegistrationFailed(
      (event: RegistrationError) => {
        console.error(event);
      }
    );

    // Foreground handling IOS and Android
    Notifications.events().registerNotificationReceivedForeground(
      (notification: any, completion) => {
        if (notification?.payload) {
          dispatch(fetchActions());
        }
        completion({ alert: true, sound: true, badge: true });

        Notifications.removeAllDeliveredNotifications();
      }
    );

    // Notification open handler when app is in background
    Notifications.events().registerNotificationOpened((notification: any, completion) => {
      if (notification?.payload) {
        dispatch(fetchActions());
      }
      completion();
    });

    // Notification open handler when app is in destroyed IOS and Android
    Notifications.getInitialNotification()
      .then((notification) => {
        if (notification?.payload) {
          dispatch(fetchActions());
        }
      })
      .catch((err) => console.error('getInitialNotifiation() failed', err));
  }, []);
};
export default useNotification;
