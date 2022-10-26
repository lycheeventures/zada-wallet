import { ToastAndroid, Platform, Alert } from 'react-native';

export function showMessage(title, message) {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(title, message);
  }
}

export function _showAlert(title, message) {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  if (typeof message === 'string' && message.startsWith('<!DOCTYPE')) {
    Alert.alert(title, 'Something went Wrong');
  }

  Alert.alert(title, message);
}

export function showAskDialog(title, message, onSuccessPress, onRejectPress) {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        onPress: () => onRejectPress(),
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: () => onSuccessPress(),
        style: 'default',
      },
    ],
    {
      cancelable: true,
      onDismiss: () => onRejectPress(),
    }
  );
}

export function showOKDialog(title, subtitle, onOkPress) {
  Alert.alert(
    title,
    subtitle,
    [
      {
        text: 'OK',
        onPress: onOkPress,
      },
    ],
    { cancelable: false }
  );
}

export function showNetworkMessage() {
  Alert.alert(
    'No Internet',
    'You are not connected with internet. Please connect and try again.'
  );
}
