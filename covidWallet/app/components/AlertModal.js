import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";
import { ICONS } from "../config/icons";
import { THEME_CONFIG } from "../config/theme-config";
import { useTheme } from "../hooks";
import { SimpleButton } from "./";

export const ALERT_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    NETWORK: 'network',
}

const AlertModal = ({ isVisible, type, info, closeCallback, buttonTitle, onButtonPress }) => {
    const { colors } = useTheme();

    const _getImage = () => {
        switch (type) {
            case ALERT_TYPES.SUCCESS:
                return ICONS.SUCCESS_ICON;
            case ALERT_TYPES.ERROR:
                return ICONS.ERROR_ICON;
            case ALERT_TYPES.NETWORK:
                return ICONS.NO_INTERNET_ERROR;
            default:
                return ICONS.SUCCESS_ICON;
        }
    };

    const _getTitle = () => {
        switch (type) {
            case ALERT_TYPES.SUCCESS:
                return "Successful";
            case ALERT_TYPES.ERROR:
                return "Error";
            case ALERT_TYPES.NETWORK:
                return "No Internet";
            default:
                return "Successful";
        }
    };

    return (
        <Modal
            animationIn={"zoomIn"}
            animationInTiming={500}
            animationOut={"zoomOut"}
            animationOutTiming={500}
            isVisible={isVisible}
            onBackButtonPress={() => {
                closeCallback();
            }}
            onBackdropPress={() => {
                closeCallback();
            }}
        >
            <View
                style={[styles._mainContainer, { backgroundColor: colors.primaryBackground }]}
            >
                <Image
                    source={_getImage()}
                    resizeMode="contain"
                    style={{
                        width: THEME_CONFIG.WP(15),
                        height: THEME_CONFIG.WP(15),
                    }}
                />

                <Text style={[styles._heading, { color: colors.primaryTextColor }]}>
                    {_getTitle()}
                </Text>

                <Text style={[styles._info, { color: colors.secondaryTextColor }]}>
                    {info}
                </Text>
                <SimpleButton
                    width={'100%'}
                    onPress={() => {
                        onButtonPress();
                    }}
                    title={buttonTitle}
                    titleColor={colors.whiteColor}
                    buttonColor={colors.secondary}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    _mainContainer: {
        width: "100%",
        alignItems: "center",
        borderRadius: THEME_CONFIG.RADIUS.radius_10,
        padding: THEME_CONFIG.SPACINGS.spacing_15,
    },
    _heading: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_16,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Medium,
        textAlign: "center",
        marginTop: THEME_CONFIG.SPACINGS.spacing_10,
        marginBottom: THEME_CONFIG.SPACINGS.spacing_5,
    },
    _image: {
        width: THEME_CONFIG.WP(15),
        height: THEME_CONFIG.WP(15),
    },
    _info: {
        marginBottom: THEME_CONFIG.SPACINGS.spacing_15,
        textAlign: "center",
        fontSize: THEME_CONFIG.FONT_SIZES.size_12,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
    },
});

export default AlertModal;