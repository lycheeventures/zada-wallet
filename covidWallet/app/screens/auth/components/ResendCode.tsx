import React, { useState } from 'react';
import { Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AppColors } from '../../../theme/Colors';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../../store';
import { sendOTP } from '../../../store/auth/thunk';
import { selectUser } from '../../../store/auth/selectors';
import { _showAlert } from '../../../helpers';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}
const ResendCode = (props: INProps) => {
  //Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const user = useAppSelector(selectUser);

  // States
  const [phoneMins, setPhoneMins] = useState(1);
  const [phoneSecs, setPhoneSecs] = useState(59);
  const [phoneTimeout, setPhoneTimeout] = useState(true);
  const [loading, setLoading] = useState(false);

  //   Effect for phone code countdown
  React.useEffect(() => {
    let interval = setInterval(() => {
      let tempSec = phoneSecs - 1;
      if (tempSec <= 0 && phoneMins > 0) {
        setPhoneSecs(59);
        setPhoneMins(phoneMins - 1);
      } else if (tempSec <= 0 && phoneMins == 0) {
        setPhoneSecs(0);
        setPhoneMins(0);
        clearInterval(interval);
        setPhoneTimeout(false);
      } else {
        setPhoneSecs(tempSec);
      }
    }, 1000); //each count lasts for a second
    //cleanup the interval on complete
    return () => clearInterval(interval);
  });

  // Function
  const resendCode = async () => {
    if (user.phone) {
      setLoading(true);
      dispatch(sendOTP({ phone: user.phone, secret: user.walletSecret }))
        .unwrap()
        .then((res) => {
          if (res.success) {
            _showAlert('ZADA', 'Code sent successfully!');
            setPhoneMins(1);
            setPhoneSecs(59);
            setPhoneTimeout(true);
            setLoading(false);
          }
        })
        .catch((e) => {
          setLoading(false);
        });
    } else {
      _showAlert('ZADA', 'Invalid phone number!');
      props.navigation.navigate('PhoneNumberScreen');
    }
  };

  return (
    <>
      {!phoneTimeout ? (
        !loading ? (
          <Text>
            {"Didn't get a code?"}{' '}
            <Text onPress={resendCode} style={styles._expireText}>
              Resend OTP
            </Text>
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
        <Text>
          {'Resend OTP in'}{' '}
          <Text style={styles._countdown}>
            {('0' + phoneMins).slice(-2)} : {('0' + phoneSecs).slice(-2)}
          </Text>
        </Text>
      )}
    </>
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
    color: AppColors.PRIMARY,
    textDecorationLine: 'underline',
  },
});
export default ResendCode;
