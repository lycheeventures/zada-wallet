import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native';
import { Bar } from '../components';
import { IMAGES } from '../config/images';
import { THEME_CONFIG } from '../config/theme-config';
import { useTheme, useNetwork } from '../hooks';

const Splash = () => {

    const { colors } = useTheme();
    const { isConnected } = useNetwork();

    return (
        <View style={[styles._mainContainer, { backgroundColor: colors.primary }]}>
            <Bar
                backgroundColor={colors.primary}
                type='light'
            />
            <Image
                source={IMAGES.APP_WHITE_LOGO}
                resizeMode='contain'
                style={styles._logoStyle}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    _mainContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    _logoStyle: {
        width: THEME_CONFIG.WP(35),
        height: THEME_CONFIG.WP(15),
    },
})

export default Splash;