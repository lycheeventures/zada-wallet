import React from 'react'
import { StyleSheet, Image, View, Dimensions } from 'react-native'
import Modal from 'react-native-modal';
import { BACKGROUND_COLOR, GREEN_COLOR } from '../theme/Colors';
import SimpleButton from './Buttons/SimpleButton';
import HeadingComponent from './HeadingComponent';

const CredQRModal = ({ isVisible, onCloseClick, qrCode }) => {
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onCloseClick}
            onBackButtonPress={onCloseClick}
        >
            <View style={styles._qrContainer}>
                <HeadingComponent
                    text={`Scan to verify`}
                />
                <Image
                    source={{ uri: qrCode }}
                    resizeMode='contain'
                    style={{
                        width: Dimensions.get('screen').width * 0.6,
                        height: Dimensions.get('screen').width * 0.6,
                    }}
                />
                <SimpleButton
                    onPress={onCloseClick}
                    title='Close'
                    titleColor='white'
                    buttonColor={GREEN_COLOR}
                    style={{
                        marginTop: 20,
                    }}
                    width={250}
                />
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    _qrContainer: {
        backgroundColor: BACKGROUND_COLOR,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
});

export default CredQRModal;