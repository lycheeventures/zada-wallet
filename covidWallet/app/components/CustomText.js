import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { THEME_CONFIG } from '../config/theme-config';
import { useTheme } from '../hooks';

export const TEXT_TYPES = {
    HEADING: 'heading',
    SUB_HEADING: 'sub_heading',
    INFO: 'info',
    SMALL: 'small',
    XS: 'xs',

}

const CustomText = ({ type, text, textColor, textAlign, style }) => {
    const { colors } = useTheme();

    const _getStyle = () => {
        switch (type) {
            case TEXT_TYPES.HEADING:
                return styles._heading;
            case TEXT_TYPES.SUB_HEADING:
                return styles._subheading;
            case TEXT_TYPES.INFO:
                return styles._info;
            case TEXT_TYPES.SMALL:
                return styles._small;
            case TEXT_TYPES.XS:
                return styles._extraSmall;
            default:
                return styles._heading;
        }
    }

    return (
        <Text
            style={[
                _getStyle(),
                {
                    color: textColor ?? colors.primaryTextColor,
                    textAlign
                },
                style
            ]}>
            {text}
        </Text>
    );
}

const styles = StyleSheet.create({
    _heading: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_24,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Merriweather.Bold,
    },
    _subheading: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_12,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Merriweather.Bold,
    },
    _info: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_12,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
    },
    _small: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_11,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
    },
    _extraSmall: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_11,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
    },
});

export default CustomText;
