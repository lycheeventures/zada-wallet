import { ToastAndroid, Platform, Alert } from 'react-native';

export function showMessage(title: string, message: any) {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(title, message);
  }
}

export function _showAlert(title: string, message: any) {
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  if (typeof message === 'string' && message.startsWith('<!DOCTYPE')) {
    Alert.alert(title, 'Something went Wrong');
  }

  Alert.alert(title, message);
}

export function showAskDialog(
  title: string,
  message: string,
  onSuccessPress: Function,
  onRejectPress: Function,
  confirmButtonText?: string,
  confirmButtonStyle?: 'default' | 'cancel' | 'destructive',
  cancelButtonText?: string,
  cancelButtonStyle?: 'default' | 'cancel' | 'destructive'
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelButtonText ? cancelButtonText : 'Cancel',
        onPress: () => onRejectPress(),
        style: cancelButtonStyle ? cancelButtonStyle : 'cancel',
      },
      {
        text: confirmButtonText ? confirmButtonText : 'Confirm',
        onPress: () => onSuccessPress(),
        style: confirmButtonStyle ? confirmButtonStyle : 'default',
      },
    ],
    {
      cancelable: true,
      onDismiss: () => onRejectPress(),
    }
  );
}

export function showOKDialog(title: string, subtitle: string, onOkPress: () => {}) {
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
  Alert.alert('No Internet', 'You are not connected with internet. Please connect and try again.');
}
