import React, { useContext, useEffect } from 'react';
// import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';
import { registerDeviceToken } from '../gateways/auth';
import { addCredentialToActionList, addVerificationToActionList } from './ActionList';
import { CRED_OFFER, VER_REQ } from './ConfigApp';
const DROID_CHANNEL_ID = 'zada';

//Usage: showNotification("Test", `Test.`, '0', true, true);
function showLocalNotification(
  title,
  message,
  id,
  vibrate,
  sound,
  ongoing = false,
) {
  PushNotification.localNotification({
    /* Android Only Properties */
    channelId: id,
    autoCancel: true,
    vibrate: vibrate,
    vibration: vibrate ? 300 : undefined,
    priority: 'high',
    visibility: 'public',
    importance: 'high',
    ongoing: ongoing,

    /* iOS only properties */
    //alertAction: 'view',
    userInfo: { id: id }, // required for ios local notification

    /* iOS and Android properties */
    title: title,
    message: message, // (required)
    playSound: sound,
    soundName: sound ? 'default' : undefined,
    // number: number // silly library, iOS requires number, while android string...
  });
}

function accumulateBadgeNumber(count) {
  PushNotification.getApplicationIconBadgeNumber((badgeCount) => {
    PushNotification.setApplicationIconBadgeNumber(badgeCount + count);
  });
}

function clearBadgeNumber() {
  PushNotification.setApplicationIconBadgeNumber(0);
}

function clearAllNotifications() {
  PushNotification.clearAllNotifications();
  clearBadgeNumber();
}

function getAllDeliveredNotifications() {
  PushNotification.getDeliveredNotifications((notifications) => {
  });
}

//Android: Automatically triggered on notification arrival for android
//IOS: Triggered on clicking notification from notification center
async function receiveNotificationEventListener(notification) {
  if (Platform.OS === 'ios') {
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  } else {
    PushNotification.invokeApp(notification);
    //TODO: Process Android notification here
    showLocalNotification(
      notification.data.title,
      notification.data.body,
      DROID_CHANNEL_ID,
      true,
      true
    );
  }
}

async function onRegisterEventListener(token) {
  PushNotification.checkPermissions((permissions) => {
    if (permissions.badge !== true || permissions.alert !== true) {
      //activate notification permision if disabled
    }
  });
  try {
    await registerDeviceToken(Platform.OS, token.token);
  } catch (e) {
    console.log(e)
  }


}

function onActionEventListener(notification) {
  // process the action
}

function onRegistrationErrorEventListener(err) {
  console.error(err.message, err);
}

function initNotifications(localReceiveNotificationEventListener) {
  // NOTIFICATION START

  if (Platform.OS === 'android') {
    PushNotification.getChannels(function (channel_ids) {
    });

    PushNotification.channelExists(DROID_CHANNEL_ID, function (exists) {
      if (!exists) {
        PushNotification.createChannel(
          {
            channelId: DROID_CHANNEL_ID, // (required)
            channelName: "zada-channel", // (required)
            channelDescription: "A channel zada", // (optional) default: undefined.
            playSound: true, // (optional) default: true
            soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
            importance: 4, // (optional) default: 4. Int value of the Android notification importance
            vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
          },
          (created) => { } // (optional) callback returns whether the channel was created, false means it already existed.
        );
      }
    });
  }
  // Must be outside of any component LifeCycle (such as `componentDidMount`).
  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)

    onRegister: onRegisterEventListener,

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: (notification) => localReceiveNotificationEventListener(notification),

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: onActionEventListener,

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: onRegistrationErrorEventListener,

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    //requestPermissions: Platform.OS !== 'ios',
  });
}

module.exports = {
  showLocalNotification: showLocalNotification,
  accumulateBadgeNumber: accumulateBadgeNumber,
  clearBadgeNumber: clearBadgeNumber,
  clearAllNotifications: clearAllNotifications,
  getAllDeliveredNotifications: getAllDeliveredNotifications,
  receiveNotificationEventListener: receiveNotificationEventListener,
  onRegisterEventListener: onRegisterEventListener,
  onActionEventListener: onActionEventListener,
  onRegistrationErrorEventListener: onRegistrationErrorEventListener,
  // iOSforegroundTrigger: iOSforegroundTrigger,
  initNotifications: initNotifications,
  DROID_CHANNEL_ID: DROID_CHANNEL_ID,
};