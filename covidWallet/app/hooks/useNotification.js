import { useEffect, useState } from 'react';
import {
  initNotifications,
  receiveNotificationEventListener,
} from '../helpers/Notifications';
import messaging from '@react-native-firebase/messaging';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import {
  addCredentialToActionList,
  addVerificationToActionList,
} from '../helpers/ActionList';
import { Platform } from 'react-native';
import { CONN_REQ, CRED_OFFER, VER_REQ } from '../helpers/ConfigApp';
import { useAppDispatch } from '../store';
import { fetchActions } from '../store/actions/thunk';

const useNotification = () => {
  // Constants
  const dispatch = useAppDispatch();

  // States
  const [isZadaAuth, setZadaAuth] = useState(false);
  const [authData, setAuthData] = useState(null);

  useEffect(() => {
    initNotifications(localReceiveNotificationEventListener);
    messaging().setBackgroundMessageHandler((notification) => {
      localReceiveNotificationEventListener(notification);
    });
    if (Platform.OS === 'ios') {
      setInterval(() => {
        iOSforegroundNotificationCheck();
      }, 5000);
    }
  }, []);

  function iOSforegroundNotificationCheck() {
    PushNotification.getDeliveredNotifications((notifications) => {
      if (notifications.length !== 0) {
        iOSTriggerForeground();
      }
    });
  }

  async function localReceiveNotificationEventListener(notification) {
    receiveNotificationEventListener(notification);
    // let notiObj = {
    //   data: {
    //     body: 'You have received a credential offer',
    //     metadata: 'a899222c-cb60-4427-a412-5f453a434e13',
    //     title: 'ZADA',
    //     type: 'credential_offer',
    //   },
    //   foreground: true,
    //   id: '281873063',
    //   userInteraction: false,
    // };

    dispatch(fetchActions());
  }

  const iOSTriggerForeground = async () => {
    PushNotification.getDeliveredNotifications(async (notifications) => {
      if (notifications.length !== 0) {
        //TODO: Process IOS notification here
        //MAKE SURE YOU DONT PROCESS IT TWICE AS receiveNotificationEventListener might also process it
        //Use identifier to make sure you dont process twice
        let notificationsProcessed = [];
        for (let i = 0; i < notifications.length; i++) {
          switch (notifications[i].userInfo.type) {
            case CRED_OFFER:
              await addCredentialToActionList(notifications[i].userInfo.metadata);
              break;
            case VER_REQ:
              const verData = await addVerificationToActionList();
              if (verData.isZadaAuth) {
                setAuthData(verData.data);
                setZadaAuth(true);
              } else {
                setAuthData(null);
                setZadaAuth(false);
              }

              break;
            default:
              console.log('notification type not found!');
          }
          notificationsProcessed.push(notifications[i].identifier);
        }
        PushNotificationIOS.removeDeliveredNotifications(notificationsProcessed);
        dispatch(fetchActions());
      }
    });
  };

  return { isZadaAuth, authData, setZadaAuth, setAuthData };
};
export default useNotification;
