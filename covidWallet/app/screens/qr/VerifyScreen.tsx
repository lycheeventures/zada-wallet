import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { AppColors } from '../../theme/Colors';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'NewQRScreen'>;

const VerifyScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const handleVerify = () => {
    navigation.navigate('MainScreen');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.label}>{t('VerifyScreen.verify_data') || 'Verify Data'}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.buttonText}>{t('VerifyScreen.verify') || 'Verify'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>{t('VerifyScreen.cancel') || 'Cancel'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.BLACK,
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  verifyButton: {
    backgroundColor: AppColors.PRIMARY || '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: AppColors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#E8E8E8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: AppColors.BLACK,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifyScreen;
