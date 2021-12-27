import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { THEME_CONFIG } from '../config/theme-config';
import { useTheme } from '../hooks';

const InfoText = ({ text, color, style, fontSize }) => {
    const { colors } = useTheme();
    return (
        <Text style={[styles._info, { color: color ? color : colors.secondaryTextColor, fontSize: fontSize ? fontSize : THEME_CONFIG.FONT_SIZES.size_12 }, style]}>{text}</Text>
    );
}

const styles = StyleSheet.create({
    _info: {
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
        textAlign: 'center',
    },
});

export default InfoText

