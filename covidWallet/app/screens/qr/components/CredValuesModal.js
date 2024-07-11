import React from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';
import Modal from 'react-native-modal';
import { AppColors } from '../../../theme/Colors';
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

  const onLinkPress = (url) => {
    Linking.openURL(url);
  }

  // Render title.
  function renderTitleInput(title, index) {
    let value = values[title];
    value = parse_date_time(value)
    let isLink = value.startsWith("http") || value.startsWith("https") ? true : false;

    return (
      <View key={index} style={styles.titleViewStyle}>
        <Text style={styles.titleTextStyle}>{title}</Text>
        <View style={styles.titleDateStyle}>
          <Text
            disabled={!isLink}
            onPress={() => onLinkPress(value)}
            style={{ color: isLink ? AppColors.BLUE : AppColors.BLACK }}
          >
            {isLink ? "Click Here" : value}
          </Text>
        </View>
      </View >
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
            buttonColor={AppColors.GRAY}
            onPress={onCloseClick}
            width={250}
            style={styles.closeButtonStyle}
          />
        ) : (
          <SimpleButton
            title="VERIFY"
            titleColor="white"
            buttonColor={AppColors.GREEN}
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
    backgroundColor: AppColors.BACKGROUND,
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
    color: AppColors.BLACK,
    marginLeft: 8,
    marginBottom: 8,
  },
  titleDateStyle: {
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: AppColors.WHITE,
    color: AppColors.BLACK,
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
