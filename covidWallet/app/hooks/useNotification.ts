import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Notifications, Registered, RegistrationError } from 'react-native-notifications';
import { AppDispatch, useAppDispatch } from '../store';
import { fetchActions } from '../store/actions/thunk';
import { AuthAPI } from '../gateways';
import { getItem, saveItem } from '../helpers/Storage';
import ConstantList from '../helpers/ConfigApp';
import { fetchConnections } from '../store/connections/thunk';

const useNotification = () => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Registering Notifications.
  useEffect(() => {
    Notifications.registerRemoteNotifications();

    // Register Device Token
    Notifications.events().registerRemoteNotificationsRegistered(async (event: Registered) => {
      if (event.deviceToken) {
        let parsedItem = await getItem(ConstantList.IS_DEVICE_REGISTERED);
        let isReg = parsedItem ? false : parsedItem;
        if (!isReg) {
          AuthAPI.registerDeviceToken(Platform.OS, event.deviceToken);
          await saveItem(ConstantList.IS_DEVICE_REGISTERED, JSON.stringify(true));
        }
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
          dispatch(fetchConnections());
          dispatch(fetchActions());
        }
        completion({ alert: true, sound: true, badge: true });

        Notifications.removeAllDeliveredNotifications();
      }
    );

    // Notification open handler when app is in background
    Notifications.events().registerNotificationOpened((notification: any, completion) => {
      if (notification?.payload) {
        dispatch(fetchConnections());
        dispatch(fetchActions());
      }
      completion();
    });

    // Notification open handler when app is in destroyed IOS and Android
    Notifications.getInitialNotification()
      .then((notification) => {
        if (notification?.payload) {
          dispatch(fetchConnections());
          dispatch(fetchActions());
        }
      })
      .catch((err) => console.error('getInitialNotifiation() failed', err));
  }, []);
};
export default useNotification;