import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ActivityIndicator, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { AppColors } from '../../../theme/Colors';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../../store';
import { sendOTP } from '../../../store/auth/thunk';
import { selectUser } from '../../../store/auth/selectors';
import { _showAlert } from '../../../helpers';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { OTP_CHANNEL } from '../../../store/auth/OtpChannel';
import { ZohoSalesIQOpenChat } from '../../../components/Chat/utils';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}

const ResendCode = (props: INProps) => {
  const dispatch = useAppDispatch<AppDispatch>();
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  const [phoneMins, setPhoneMins] = useState(1);
  const [phoneSecs, setPhoneSecs] = useState(59);
  const [phoneTimeout, setPhoneTimeout] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval = setInterval(() => {
      setPhoneSecs(prev => {
        if (prev <= 1) {
          if (phoneMins > 0) {
            setPhoneMins(m => m - 1);
            return 59;
          } else {
            setPhoneTimeout(false);
            clearInterval(interval);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneMins]);

  const resendCode = async (channel: string) => {
    if (user.phone) {
      setLoading(true);
      dispatch(sendOTP({ phone: user.phone, secret: user.walletSecret, channel }))
        .unwrap()
        .then(res => {
          if (res.success) {
            _showAlert('ZADA', `Code sent successfully via ${channel.toUpperCase()}!`);
            setPhoneMins(1);
            setPhoneSecs(59);
            setPhoneTimeout(true);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      _showAlert('ZADA', 'Invalid phone number!');
      props.navigation.navigate('PhoneNumberScreen');
    }
  };

  return (
    <View style={styles.container}>
      {!phoneTimeout ? (
        !loading ? (
          <>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.smsButton]}
                onPress={() => resendCode(OTP_CHANNEL.SMS)}>
                <Icon
                  name="message-text-outline"
                  size={18}
                  color={AppColors.WHITE}
                  style={styles.icon}
                />
                <Text style={styles.buttonText}> {t('VerifyOTPScreen.sms')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.whatsappButton]}
                onPress={() => resendCode(OTP_CHANNEL.WHATSAPP)}>
                <Icon name="whatsapp" size={18} color={AppColors.WHITE} style={styles.icon} />
                <Text style={styles.buttonText}> {t('VerifyOTPScreen.wahtsapp')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{t('VerifyOTPScreen.didnt_receive_code')} </Text>
              <TouchableOpacity
                onPress={() => {
                  ZohoSalesIQOpenChat();
                }}>
                <Text style={styles.contactLink}>{t('SettingsScreen.contact_us')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <ActivityIndicator color={AppColors.PRIMARY} size="small" style={{ marginLeft: 30 }} />
        )
      ) : (
        <Text style={{ padding: 20 }}>
          {t('VerifyOTPScreen.resend_otp')} in{' '}
          <Text style={styles._countdown}>
            {('0' + phoneMins).slice(-2)} : {('0' + phoneSecs).slice(-2)}
          </Text>
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  questionText: {
    fontSize: 16,
    color: AppColors.BLACK,
  },
  contactLink: {
    fontSize: 16,
    color: AppColors.PRIMARY,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  smsButton: {
    backgroundColor: AppColors.PRIMARY,
  },
  whatsappButton: {
    backgroundColor: AppColors.BRIGHT_GREEN,
  },
  icon: {
    marginRight: 6,
  },
  buttonText: {
    color: AppColors.WHITE,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  _countdown: {
    color: AppColors.PRIMARY,
  },
});

export default ResendCode;
