import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { AppColors, BACKGROUND_COLOR, GREEN_COLOR } from '../../../theme/Colors';
import SimpleButton from '../../../components/Buttons/SimpleButton';
import HeadingComponent from '../../../components/HeadingComponent';
import QRCode from 'react-native-qrcode-svg';
import OverlayLoader from '../../../components/OverlayLoader';

const CredQRModal = ({ isVisible, isGenerating, onCloseClick, data }) => {
  let values = { ...data };
  // Convert JSON to string
  values = JSON.stringify(values);

  return (
    <Modal
      isVisible={isVisible}
      useNativeDriver={true}
      onBackdropPress={onCloseClick}
      onBackButtonPress={onCloseClick}>
      <View style={styles._qrContainer}>
        <HeadingComponent text={`Scan to verify`} />

        {isGenerating ? (
          <View style={styles.generatingOverlayLoaderViewStyle}>
            <OverlayLoader
              loaderColor={AppColors.BLACK}
              textColor={AppColors.BLACK}
              text="Generating QR Please wait..."
              backgroundColor={BACKGROUND_COLOR}
            />
          </View>
        ) : (
          <QRCode
            value={values}
            backgroundColor={BACKGROUND_COLOR}
            size={Dimensions.get('window').width * 0.7}
            ecl="L"
          />
        )}

        <SimpleButton
          onPress={onCloseClick}
          title="Close"
          titleColor="white"
          buttonColor={GREEN_COLOR}
          style={{
            marginTop: 20,
          }}
          width={250}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  _qrContainer: {
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  generatingOverlayLoaderViewStyle: {
    height: 200,
  },
});

export default CredQRModal;
