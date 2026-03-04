import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { AppColors } from '../../theme/Colors';

const { width } = Dimensions.get('window');

export const AlertType = {
  INFO: 'info',
  DANGER: 'danger',
  SUCCESS: 'success',
} as const;

export type AlertType = (typeof AlertType)[keyof typeof AlertType];

interface CustomAlertProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: AlertType;
}

const AppCustomAlert = ({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'CANCEL',
  type = AlertType.INFO,
}: CustomAlertProps) => {
  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity style={[styles.button]} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>{cancelText.toUpperCase()}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.button]} onPress={onConfirm}>
              <Text
                style={
                  type === AlertType.DANGER ? styles.deleteButtonText : styles.confirmButtonText
                }>
                {confirmText.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.TEXT_TITLE_COLOR,
    marginBottom: 10,
    textAlign: 'left',
  },
  message: {
    fontSize: 16,
    color: AppColors.TEXT_LABEL_COLOR,
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: AppColors.MEDIUM_GRAY,
    opacity: 0.6,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: AppColors.BRIGHT_GREEN,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: AppColors.DANGER,
    fontWeight: 'bold',
  },
});

export default AppCustomAlert;
