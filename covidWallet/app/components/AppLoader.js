import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { THEME_CONFIG } from '../config/theme-config'
import { useTheme } from '../hooks'
import Modal from 'react-native-modal';

const AppLoader = ({ isVisible, text }) => {

    const { colors } = useTheme();

    return (
        <Modal
            animationIn={"zoomIn"}
            animationInTiming={500}
            animationOut={"zoomOut"}
            animationOutTiming={500}
            isVisible={isVisible}
        >
            <View style={[styles._loadingContainer, { backgroundColor: colors.blackColor }]}>
                <ActivityIndicator
                    size='small'
                    color={colors.whiteColor}
                />
                <Text style={[styles._loadingText, { color: colors.whiteColor }]}>{text}</Text>
            </View>
        </Modal>

    )
}

const styles = StyleSheet.create({
    _loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: THEME_CONFIG.WP(70),
        alignSelf: 'center',
        borderRadius: THEME_CONFIG.RADIUS.radius_10,
        padding: THEME_CONFIG.SPACINGS.spacing_15,
    },
    _loadingText: {
        fontSize: THEME_CONFIG.FONT_SIZES.size_12,
        fontFamily: THEME_CONFIG.FONT_FAMILIES.Poppins.Regular,
        marginTop: THEME_CONFIG.SPACINGS.spacing_10,
        textAlign: 'center',
    },
})

export default AppLoader;