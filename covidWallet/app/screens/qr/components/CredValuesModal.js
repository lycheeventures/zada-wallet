import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import {
  BACKGROUND_COLOR,
  BLACK_COLOR,
  GRAY_COLOR,
  GREEN_COLOR,
  WHITE_COLOR,
} from '../../../theme/Colors';
import SimpleButton from '../../../components/Buttons/SimpleButton';
import HeadingComponent from '../../../components/HeadingComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import LottieView from 'lottie-react-native';
import { parse_date_time } from '../../../helpers/time';
const CredValuesModal = ({
  isVisible,
  heading,
  values,
  onVerifyPress,
  onCloseClick,
  isScanning,
}) => {
  // Render title.
  function renderTitleInput(title, index) {
    let value = values[title];
    return (
      <View key={index} style={styles.titleViewStyle}>
        <Text style={styles.titleTextStyle}>{title}</Text>
        <View style={styles.titleDateStyle}>
          <Text style={{ color: BLACK_COLOR }}>{parse_date_time(value)}</Text>
        </View>
      </View>
    );
  }

  return (
    <Modal
      animationIn="slideInLeft"
      animationOut="slideOutRight"
      isVisible={isVisible}
      onBackButtonPress={onCloseClick}
      onBackdropPress={onCloseClick}>
      <View style={styles._mainContainer}>
        <HeadingComponent text={heading} />
        {isScanning ? (
          <LottieView
            source={require('../../../assets/animation/cred_scanning_2.json')}
            autoPlay
            loop
            style={styles.lottieStyle}
          />
        ) : (
          <KeyboardAwareScrollView
            style={styles.keyboardViewStyle}
            contentContainerStyle={styles.keyboardContainerStyle}>
            {values != undefined &&
              Object.keys(values).map((e, i) => {
                return renderTitleInput(e, i);
              })}
          </KeyboardAwareScrollView>
        )}

        {isScanning ? (
          <SimpleButton
            title="CLOSE"
            titleColor="white"
            buttonColor={GRAY_COLOR}
            onPress={onCloseClick}
            width={250}
            style={styles.closeButtonStyle}
          />
        ) : (
          <SimpleButton
            title="VERIFY"
            titleColor="white"
            buttonColor={GREEN_COLOR}
            onPress={onVerifyPress}
            width={250}
            style={styles.verifyButtonStyle}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    borderRadius: 10,
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  titleViewStyle: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  titleTextStyle: {
    color: BLACK_COLOR,
    marginLeft: 8,
    marginBottom: 8,
  },
  titleDateStyle: {
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: WHITE_COLOR,
    color: BLACK_COLOR,
    height: 40,
    marginBottom: 4,
    borderRadius: 16,
    justifyContent: 'center',
  },
  lottieStyle: {
    width: 200,
    height: 200,
  },
  keyboardViewStyle: {
    width: '100%',
    maxHeight: 250,
  },
  keyboardContainerStyle: {
    paddingBottom: '10%',
  },
  closeButtonStyle: {
    marginTop: 20,
    borderWidth: 0,
  },
  verifyButtonStyle: {
    marginTop: 20,
  },
});

export default CredValuesModal;
