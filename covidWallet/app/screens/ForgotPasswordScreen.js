import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Platform,
    Dimensions,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
const { width } = Dimensions.get('window');
import PhoneInput from "react-native-phone-number-input";
import HeadingComponent from '../components/HeadingComponent';
import { BACKGROUND_COLOR, GREEN_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '../theme/Colors';
import SimpleButton from '../components/Buttons/SimpleButton';
import { showNetworkMessage, _showAlert } from '../helpers/Toast';
import BackButton from '../components/Buttons/BackButton';
import { _sendPasswordResetAPI } from '../gateways/auth';
import { analytics_log_reset_password } from '../helpers/analytics';
import { _handleAxiosError } from '../helpers/AxiosResponse';
import { useAppSelector } from '../store';
import { selectNetworkStatus } from '../store/app/selectors';

const ForgotPasswordScreen = ({ navigation }) => {

    const networkStatus = useAppSelector(selectNetworkStatus);
    const [phone, setPhone] = useState('');
    const phoneInput = useRef(null);
    const [isLoading, setLoading] = useState(false);

    // Send reset password link to inputted phone
    const _onSendClick = async () => {
        try {
            if (networkStatus === 'connected') {
                // Check if phone number is valid
                const checkValid = phoneInput.current?.isValidNumber(phone);
                if (!checkValid) {
                    _showAlert('Zada Wallet', 'Please enter a valid phone number.')
                    return
                }

                setLoading(true);

                const result = await _sendPasswordResetAPI(phone);
                if (result.data.success) {

                    analytics_log_reset_password();

                    navigation.goBack();
                    _showAlert('Zada Wallet', 'A password reset link has been sent to your number');
                }
                else {
                    _showAlert('Zada Wallet', result.data.error);
                }

                setLoading(false);
            }
            else {
                setLoading(false);
                showNetworkMessage();
            }
        } catch (error) {
            setLoading(false);
            _handleAxiosError(error);
        }
    }

    // KEYBOARD AVOIDING VIEW
    const keyboardVerticalOffset = Platform.OS == 'ios' ? 100 : 0;
    const keyboardBehaviour = Platform.OS == 'ios' ? 'padding' : null

    return (
        <View
            style={{
                flex: 1,
                alignItems: 'center',
                backgroundColor: PRIMARY_COLOR,
            }} Î
        >
            <BackButton
                onPress={() => {
                    console.log('yes');
                    navigation.goBack();
                }}
                color={WHITE_COLOR}
            />
            <KeyboardAwareScrollView
                behavior={keyboardBehaviour}
                keyboardVerticalOffset={keyboardVerticalOffset}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            >

                <View
                    style={{
                        backgroundColor: BACKGROUND_COLOR,
                        alignContent: 'center',
                        width: width - 40,
                        justifyContent: 'space-around',
                        borderRadius: 10,
                    }}>
                    {/* Heading */}
                    <View style={{ marginLeft: 50, marginRight: 50 }}>
                        <HeadingComponent text="Reset Password!" />
                    </View>

                    {/* Phone Input */}
                    <PhoneInput
                        ref={phoneInput}
                        defaultValue={phone}
                        defaultCode="MM"
                        layout="second"
                        containerStyle={styles._phoneInputContainer}
                        textInputStyle={styles._phoneTextStyle}
                        countryPickerButtonStyle={styles._countryPickerBtn}
                        textContainerStyle={styles._phoneTextContainer}
                        codeTextStyle={styles._codeTextStyle}
                        onChangeFormattedText={(text) => {
                            setPhone(text);
                        }}
                        disableArrowIcon
                        withShadow
                    />

                    {/* Send Button */}
                    <SimpleButton
                        isLoading={isLoading}
                        loaderColor={WHITE_COLOR}
                        onPress={_onSendClick}
                        width={250}
                        title='SEND RESET LINK'
                        titleColor={WHITE_COLOR}
                        buttonColor={GREEN_COLOR}
                        style={{
                            alignSelf: 'center',
                            marginTop: 30,
                            marginBottom: 25,
                        }}
                    />

                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    _mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: PRIMARY_COLOR
    },
    _phoneInputContainer: {
        flexDirection: "row",
        backgroundColor: WHITE_COLOR,
        borderRadius: 10,
        height: 45,
        marginTop: 8,
        alignSelf: "center",
        width: '88%',
        marginLeft: 4,
    },
    _phoneTextContainer: {
        fontSize: 16,
        padding: 0,
        borderRadius: 10,
        backgroundColor: WHITE_COLOR
    },
    _phoneTextStyle: {
        fontSize: 14,
        height: 45
    },
    _countryPickerBtn: {
        width: 65,
        borderRightColor: "#000040",
        borderRightWidth: 0.5
    },
    _codeTextStyle: {
        fontSize: 14,
        textAlign: "center",
        textAlignVertical: "center",
        padding: 0,
        margin: 0
    },
})

export default ForgotPasswordScreen;
