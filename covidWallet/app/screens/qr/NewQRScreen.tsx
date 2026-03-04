import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { AppColors } from '../../theme/Colors';
import { useTranslation } from 'react-i18next';
import { getType, handleCredVerification } from './utils';
import { CONN_REQ, CONNLESS_VER_REQ } from '../../helpers/ConfigApp';
import { showOKDialog } from '../../helpers/Toast';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'NewQRScreen'>;

const NewQRScreen = () => {
  // localization
  const { t } = useTranslation();

  // navigation
  const navigation = useNavigation<NavigationProp>();

  // camera
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(false);

  // prevent double scan
  const scannedRef = useRef(false);

  /**
   * Camera permission check
   * Runs once, Android-safe
   */
  useEffect(() => {
    const checkPermission = async () => {
      const status = Camera.getCameraPermissionStatus();
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        const newStatus = await Camera.requestCameraPermission();
        setHasPermission(newStatus === 'granted');
      }
    };

    checkPermission();
  }, []);

  /**
   * Reset scan state when screen loses focus
   */
  useEffect(() => {
    if (!isFocused) {
      scannedRef.current = false;
    }
  }, [isFocused]);

  /**
   * QR code scanner
   */
  const codeScanner = useCodeScanner({
    codeTypes: [
      'qr',
      'ean-13',
      'ean-8',
      'code-128',
      'code-39',
      'code-93',
      'upc-a',
      'upc-e',
      'pdf-417',
      'aztec',
      'data-matrix',
      'itf',
    ],
    onCodeScanned: codes => {
      if (scannedRef.current) return;
      if (codes.length === 0) return;

      const scanResult = codes[0]?.value;
      if (!scanResult) return;

      scannedRef.current = true;
      Vibration.vibrate(50);
      checkVerificationCode(scanResult);
    },
  });

  /**
   * Handle scanned QR
   */
  const checkVerificationCode = async (scanResult: string) => {
    const type = getType(scanResult);

    if (type === CONNLESS_VER_REQ) {
      navigation.navigate('VerificationRequestScreen', {
        data: { scanData: scanResult },
      });
    } else if (type === CONN_REQ) {
      try {
        const qrJSON = JSON.parse(scanResult);
        navigation.navigate('ConnectionAccept', { qrJSON });
      } catch (e) {
        unsupportedQRCode();
      }
    } else if (type == 'cv' || type == 'cred_ver') {
      try {
        const credObj = await handleCredVerification(JSON.parse(scanResult));
        if (credObj) {
          navigation.navigate('VerifyQRScreen', {
            credential: credObj.credential,
            values: credObj.sortedValues,
          });
        }
      } catch (e) {
        unsupportedQRCode();
      }
    } else {
      unsupportedQRCode();
    }
  };

  const unsupportedQRCode = () => {
    scannedRef.current = true;
    goBack();
    setTimeout(() => {
      showOKDialog('ZADA', 'Invalid QR Code', () => {
        scannedRef.current = false;
      });
    }, 300);
  };

  const goBack = () => {
    navigation.navigate('MainScreen');
  };

  // if device not ready
  if (!device) {
    return <View style={styles.container} />;
  }

  // if permission denied
  if (!hasPermission) {
    return (
      <View style={styles.container2}>
        <Text style={styles.noCamerAccessLabel}>{t('QRScreen.no_access_camera')}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={goBack}>
          <Text style={styles.closeText}>{t('QRScreen.close')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // open camera
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && hasPermission}
        codeScanner={codeScanner}
        onError={error => {
          console.log('Camera error:', error);
        }}
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>{t('QRScreen.title')}</Text>

        <View style={styles.frame} />

        <TouchableOpacity style={styles.cancelButton} onPress={goBack}>
          <Text style={styles.cancelText}>{t('QRScreen.cancel_scan')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewQRScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noCamerAccessLabel: {
    color: AppColors.TEXT_LABEL_COLOR,
    fontSize: 16,
    padding: 20,
    textAlign: 'center',
  },

  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: AppColors.PRIMARY,
    borderRadius: 10,
  },

  closeText: {
    color: AppColors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
    fontWeight: '600',
  },

  frame: {
    width: 300,
    height: 300,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 10,
  },

  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: AppColors.DANGER,
    borderRadius: 10,
  },

  cancelText: {
    color: AppColors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
