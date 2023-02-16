import React, { useState } from 'react';
import { Dimensions, Platform, View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { useAppSelector } from '../../store';
import { AppColors } from '../../theme/Colors';
import SimpleButton from '../../components/Buttons/SimpleButton';
import HeadingComponent from '../../components/HeadingComponent';
import CodeInputComponent from './components/CodeInputComponent';
import { selectAuthStatus } from '../../store/auth/selectors';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
  route: any;
}

// KEYBOARD AVOIDING VIEW
const keyboardVerticalOffset = Platform.OS == 'ios' ? 100 : 0;
const keyboardBehaviour = Platform.OS == 'ios' ? 'padding' : null;

const { width } = Dimensions.get('window');

function OTPScreen(props: INProps) {
  // Constants
  const { headingText, sendCode, validateCode } = props.route.params;

  // Selectors
  const authStatus = useAppSelector(selectAuthStatus);

  // States
  const [code, setCode] = useState('');

  // Functions
  const _handleOnContinuePress = () => {
    validateCode(code);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        backgroundColor: AppColors.PRIMARY,
      }}>
      <KeyboardAwareScrollView
        behavior={keyboardBehaviour}
        keyboardVerticalOffset={keyboardVerticalOffset}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View
          style={{
            backgroundColor: AppColors.BACKGROUND,
            alignContent: 'center',
            width: width - 40,
            justifyContent: 'space-around',
            borderRadius: 10,
          }}>
          <>
            <View style={{ marginLeft: 30, marginRight: 30 }}>
              <HeadingComponent text={headingText} />
            </View>
            <Text style={styles.textView}>
              We have sent confirmation code to your phone. Please input it below.
            </Text>
            <View>
              {/* Phone Confirmation Code */}
              <CodeInputComponent setCode={setCode} sendCode={sendCode} />

              <Text style={styles.textView}>
                Please wait until 2 minutes for the code. If you will not receive then you will be
                able to resend it
              </Text>

              <SimpleButton
                loaderColor={AppColors.WHITE}
                isLoading={authStatus === 'pending'}
                width={250}
                onPress={_handleOnContinuePress}
                title="Continue"
                titleColor={AppColors.WHITE}
                buttonColor={AppColors.GREEN}
                style={{
                  alignSelf: 'center',
                  marginVertical: 20,
                }}
              />
            </View>
          </>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  textView: {
    color: AppColors.GRAY,
    fontFamily: 'Poppins-Regular',
    marginLeft: 20,
    fontSize: 12,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 10,
    marginRight: 20,
  },
});
export default OTPScreen;
