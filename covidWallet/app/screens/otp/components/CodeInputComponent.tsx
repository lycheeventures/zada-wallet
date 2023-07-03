import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ActivityIndicator } from 'react-native';
import { AuthAPI } from '../../../gateways';
import { showNetworkMessage, _showAlert } from '../../../helpers';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../../store';
import { selectNetworkStatus } from '../../../store/app/selectors';
import { AppColors } from '../../../theme/Colors';
import { sendOTP } from '../../../store/auth/thunk';

interface INProps {
  setCode: (code: string) => void;
  phone: string;
}

const CodeInputComponent = (props: INProps) => {
  // Constant
  const { setCode, phone } = props;
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [phoneMins, setPhoneMins] = useState(0);
  const [phoneSecs, setPhoneSecs] = useState(0);
  const [sendButtonText, setSendButtonText] = useState('Send Code');
  const [phoneTimeout, setPhoneTimeout] = useState(true);

  const [phoneCodeLoading, setPhoneCodeLoading] = useState(false);

  // // Effect for phone code countdown
  // React.useEffect(() => {
  //   let interval = setInterval(() => {
  //     let tempSec = phoneSecs - 1;
  //     if (tempSec <= 0 && phoneMins > 0) {
  //       setPhoneSecs(59);
  //       setPhoneMins(phoneMins - 1);
  //     } else if (tempSec <= 0 && phoneMins == 0) {
  //       setPhoneSecs(0);
  //       setPhoneMins(0);
  //       clearInterval(interval);
  //       setPhoneTimeout(true);
  //     } else {
  //       setPhoneSecs(tempSec);
  //     }
  //   }, 1000); //each count lasts for a second
  //   //cleanup the interval on complete
  //   return () => clearInterval(interval);
  // });

  // Function
  const resendCode = async () => {
    setPhoneMins(1);
    setPhoneSecs(59);
    setPhoneTimeout(false);
    await sendCode();
    setSendButtonText('Send Again');
  };

  // Reset Password
  const sendCode = async () => {
    try {
      if (networkStatus === 'connected') {
        dispatch(sendOTP({ phone }));
      } else {
        showNetworkMessage();
      }
    } catch (error: any) {
      setPhoneCodeLoading(false);
    }
  };

  return (
    <View
      style={{
        alignItems: 'center',
      }}>
      <View style={styles.inputView}>
        <TextInput
          autoFocus
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          style={styles.TextInputStyle}
          placeholder="000000"
          maxLength={6}
          placeholderTextColor={AppColors.LIGHT_GRAY}
          keyboardType="number-pad"
          onChangeText={(confirmationCode) => {
            setCode(confirmationCode);
          }}
        />
      </View>

      {phoneTimeout ? (
        !phoneCodeLoading ? (
          <Text onPress={resendCode} style={styles._expireText}>
            {sendButtonText}
          </Text>
        ) : (
          <ActivityIndicator
            color={AppColors.PRIMARY}
            size={'small'}
            style={{
              marginLeft: 30,
            }}
          />
        )
      ) : (
        <Text style={styles._countdown}>
          {('0' + phoneMins).slice(-2)} : {('0' + phoneSecs).slice(-2)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputView: {
    borderRadius: 10,
    width: '40%',
    height: 45,
    marginLeft: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  TextInputStyle: {
    height: 50,
    padding: 10,
    fontSize: 18,
    color: AppColors.BLACK,
  },
  _countdownView: {
    position: 'absolute',
    borderWidth: 2,
    padding: 10,
  },
  _countdown: {
    color: AppColors.PRIMARY,
  },
  _expireText: {
    marginTop: 10,
    color: AppColors.PRIMARY,
    marginLeft: 15,
    textDecorationLine: 'underline',
  },
});

export default CodeInputComponent;
