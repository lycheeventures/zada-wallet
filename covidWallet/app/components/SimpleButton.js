import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

import { THEME_CONFIG } from '../config/theme-config';
import { useTheme } from '../hooks';

const SimpleButton = ({ title, titleColor, buttonColor, width, style, onPress, loading, loaderColor, disabled }) => {

    const { colors } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={disabled == true || loading ? true : false}
            onPress={() => {
                onPress ? onPress() : null
            }}
            style={[styles._mainContainer, { width, backgroundColor: buttonColor ?? colors.secondary }, style]}
        >
            {
                loading ? (
                    <ActivityIndicator
                        size='small'
                        color={loaderColor ?? colors.whiteColor}
                    />
                ) : (
                    <Text style={[styles._title, { color: titleColor ?? colors.whiteColor }]}>{title}</Text>
                )
            }
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    _mainContainer: {
        height: 45,
        borderRadius: THEME_CONFIG.RADIUS.radius_10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    _title: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_14,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
    },
})

export default SimpleButton;
