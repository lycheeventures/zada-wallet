import * as React from 'react';
import { Text, StyleSheet } from 'react-native';
import { THEME_CONFIG } from '../config/theme-config';
import { useTheme } from '../hooks';

const Heading = ({ text, color, style, fontSize }) => {
    const { colors } = useTheme();
    return (
        <Text style={[styles._heading, { color: color ? color : colors.primaryTextColor, fontSize: fontSize ? fontSize : THEME_CONFIG.FONT_SIZES.size_24 }, style]}>{text}</Text>
    );
}

const styles = StyleSheet.create({
    _heading: {
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Merriweather.Bold,
        textAlign: 'center',
    },
});

export default Heading;
