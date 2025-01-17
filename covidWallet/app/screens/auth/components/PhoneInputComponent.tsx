import React from 'react';
import PhoneInput from 'react-native-phone-number-input';
import { AppColors } from '../../../theme/Colors';
import { CountryCode } from 'react-native-country-picker-modal';

interface INProps {
  defaultCountry: CountryCode;
  inputRef: React.RefObject<PhoneInput>;
  setPhoneError: Function;
  phone: string;
  setPhone: Function;
  autofocus?: boolean;
}

const PhoneInputComponent = (props: INProps) => {
  const { defaultCountry, autofocus, inputRef, setPhoneError, phone, setPhone } = props;

  const onChangeText = (text: string) => {
    setPhone(text);

    if (text.length < 1) {
      setPhoneError('Please enter phone number.');
      return;
    }

    if (!inputRef.current?.isValidNumber(text)) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }
    let callingCodelength = inputRef.current?.getCallingCode()?.length || 0;
    if (text.charAt(callingCodelength + 1) === '0') {
      setPhoneError('Phone number should not start with zero');
      return;
    }

    // Setting empty If phone is valid
    setPhoneError('');
  };

  return (
    <PhoneInput
      ref={inputRef}
      autoFocus={autofocus}
      defaultValue={phone}
      defaultCode={defaultCountry}
      layout="second"
      containerStyle={{
        flexDirection: 'row',
        backgroundColor: AppColors.WHITE,
        borderRadius: 10,
        height: 45,
        marginTop: 8,
        alignSelf: 'center',
        width: '88%',
        marginLeft: 4,
      }}
      textInputStyle={{ fontSize: 14, height: 45 }}
      countryPickerButtonStyle={{
        width: 65,
        borderRightColor: '#ddd',
        borderRightWidth: 0.5,
      }}
      textContainerStyle={{
        padding: 0,
        borderRadius: 10,
        backgroundColor: AppColors.WHITE,
      }}
      codeTextStyle={{
        fontSize: 14,
        textAlign: 'center',
        textAlignVertical: 'center',
        padding: 0,
        margin: 0,
      }}
      onChangeFormattedText={onChangeText}
      disableArrowIcon
      withShadow
    />
  );
};

export default PhoneInputComponent;
