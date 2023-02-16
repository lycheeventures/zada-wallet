import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ActivityIndicator } from 'react-native';
import { _showAlert } from '../../../helpers';
import { AppColors } from '../../../theme/Colors';

interface INProps {
  sendCode: () => void;
  setCode: (code: string) => void;
}

const CodeInputComponent = (props: INProps) => {
  // Constant
  const { setCode, sendCode } = props;

  // States
  const [phoneMins, setPhoneMins] = useState(0);
  const [phoneSecs, setPhoneSecs] = useState(59);
  const [phoneTimeout, setPhoneTimeout] = useState(false);

  const [phoneCodeLoading, setPhoneCodeLoading] = useState(false);

  React.useEffect(() => {
    sendCode();
  }, []);

  // Effect for phone code countdown
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
        setPhoneTimeout(true);
      } else {
        setPhoneSecs(tempSec);
      }
    }, 1000); //each count lasts for a second
    //cleanup the interval on complete
    return () => clearInterval(interval);
  });

  // Function
  const resendCode = () => {
    setPhoneMins(1);
    setPhoneSecs(59);
    setPhoneTimeout(false);
    sendCode();
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View style={styles.inputView}>
        <TextInput
          style={styles.TextInput}
          placeholder="Phone Confirmation Code"
          placeholderTextColor="grey"
          keyboardType="number-pad"
          onChangeText={(confirmationCode) => {
            setCode(confirmationCode);
          }}
        />
      </View>
      {phoneTimeout ? (
        !phoneCodeLoading ? (
          <Text onPress={resendCode} style={styles._expireText}>
            Send Again
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
    backgroundColor: AppColors.WHITE,
    borderRadius: 10,
    width: '65%',
    height: 45,
    marginLeft: 10,
    marginTop: 8,
  },
  TextInput: {
    height: 50,
    flex: 1,
    padding: 10,
    marginLeft: 5,
  },
  _countdownView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  _countdown: {
    color: AppColors.PRIMARY,
    marginLeft: 25,
    marginTop: 10,
  },
  _expireText: {
    marginTop: 10,
    color: AppColors.PRIMARY,
    marginLeft: 15,
    textDecorationLine: 'underline',
  },
});

export default CodeInputComponent;
