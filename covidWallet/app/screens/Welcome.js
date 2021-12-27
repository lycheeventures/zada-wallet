import * as React from 'react';
import {
    View,
    Text,
    Linking,
    StyleSheet
} from 'react-native';

import { useAlert, useTheme } from '../hooks';
import { THEME_CONFIG } from '../config/theme-config';
import { Bar, CustomText } from '../components';
import SimpleButton from '../components/SimpleButton';
import { TEXT_TYPES } from '../components/CustomText';

const Welcome = ({ navigation }) => {

    const { _showErrorAlert } = useAlert();
    const { colors } = useTheme();

    const nextHandler = () => {
        navigation.navigate('RegistrationScreen');
    };

    const _openLink = async () => {
        try {
            Linking.openURL('https://zada.io/privacy-policy/');
        } catch (error) {
            _showErrorAlert('Unable to open link', 'Okay')
        }
    }

    return (
        <View style={[styles._mainContainer, { backgroundColor: colors.primary }]}>
            <Bar
                backgroundColor={colors.primary}
                type={'light'}
            />
            <View style={[styles._contentContainer, { backgroundColor: colors.primaryBackground }]}>
                <CustomText
                    type={TEXT_TYPES.HEADING}
                    textAlign='center'
                    text={`ZADA is your\nDigital ID Wallet!`}
                />
                <CustomText
                    text={`Securely prove who you are and only share the information you want.`}
                    type={TEXT_TYPES.INFO}
                    textAlign='center'
                    style={{
                        marginTop: THEME_CONFIG.SPACINGS.spacing_10
                    }}
                />
                <CustomText
                    text={`All certificates and IDs safely stored on your phone, where only you can access them.`}
                    type={TEXT_TYPES.INFO}
                    textAlign='center'
                    style={{
                        marginVertical: THEME_CONFIG.SPACINGS.spacing_10
                    }}
                />
                <CustomText
                    text={`We protect your privacy and data.`}
                    type={TEXT_TYPES.SUB_HEADING}
                    textAlign='center'
                    style={{
                        marginTop: THEME_CONFIG.SPACINGS.spacing_20,
                    }}
                />

                <Text style={[styles._linkText, { color: colors.secondaryTextColor }]}>
                    {`By continuing below you confirm that you have read and agree to `}
                    <Text onPress={_openLink} style={{ color: colors.primary }}>{`ZADA General Terms and Conditions `}</Text>
                    <Text onPress={_openLink} style={{ color: colors.primary }}>{`Privacy Policy`}</Text>
                </Text>

                <SimpleButton
                    onPress={() => {

                    }}
                    title={'Continue'}
                    titleColor={colors.whiteColor}
                    buttonColor={colors.secondary}
                    style={{
                        marginTop: THEME_CONFIG.SPACINGS.spacing_15,
                    }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    _mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: THEME_CONFIG.SPACINGS.spacing_15,
    },
    _contentContainer: {
        width: '100%',
        padding: THEME_CONFIG.SPACINGS.spacing_15,
        borderRadius: THEME_CONFIG.RADIUS.radius_10,
    },
    _linkText: {
        textAlign: 'center',
        fontSize: THEME_CONFIG.FONT_SIZES.size_11,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
        marginTop: THEME_CONFIG.SPACINGS.spacing_5,
    },
})

export default Welcome;
