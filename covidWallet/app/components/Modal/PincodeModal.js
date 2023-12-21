import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Pressable,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { AppColors } from '../../theme/Colors';
import TouchableComponent from '../Buttons/TouchableComponent';
import InputPinComponent from '../Input/InputPinComponent';

const { width } = Dimensions.get('screen');
// PC= pincode
// CPC = confirm pincode;
const PincodeModal = ({
  modalType, // 'verify'
  isVisible, // true | false
  onCloseClick,
  onContinueClick,
  pincode,
  pincodeError,
  onPincodeChange,
  confirmPincode,
  confirmPincodeError,
  onConfirmPincodeChange,
}) => {
  // Constants
  const insets = useSafeAreaInsets();

  // Selectors
  const { t } = useTranslation();

  // States
  const [type, setType] = useState('PC');
  const [animateNextBtnValue, setAnimateNextBtnValue] = useState(new Animated.Value(0));
  const [animateDoneBtnValue, setAnimateDoneBtnValue] = useState(new Animated.Value(0));
  const [animateBackgroundValue, setAnimateBackgroundValue] = useState(new Animated.Value(0));
  const [animateLeftValue, setAnimateLeftValue] = useState(new Animated.Value(0));
  const [animateFade, setAnimateFade] = useState(new Animated.Value(1));
  const [disabled, setDisabled] = useState(true);

  // UseEffects
  useEffect(() => {
    if (pincode.length === 6) {
      Animated.timing(animateNextBtnValue, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setDisabled(false);
    } else {
      Animated.timing(animateNextBtnValue, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setAnimateNextBtnValue(new Animated.Value(0));
      setAnimateBackgroundValue(new Animated.Value(0));
      setDisabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode]);

  // UseEffects
  useEffect(() => {
    if (confirmPincode) {
      if (confirmPincode.length === 6) {
        Animated.timing(animateDoneBtnValue, {
          toValue: 100,
          duration: 300,
          useNativeDriver: false,
        }).start();
        setDisabled(false);
      } else {
        Animated.timing(animateDoneBtnValue, {
          toValue: 100,
          duration: 300,
          useNativeDriver: false,
        }).start();
        setAnimateDoneBtnValue(new Animated.Value(0));
        setDisabled(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPincode]);

  // Handle continue button
  const _handleContinueClick = () => {
    // Handling Verification
    if (modalType === 'verify') {
      onContinueClick();
      return;
    }

    // Handling Pincode Setting
    if (type === 'PC' && pincode.length === 6) {
      setDisabled(true);

      Animated.sequence([
        Animated.sequence([
          Animated.timing(animateFade, {
            toValue: 0,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animateLeftValue, {
            toValue: 500,
            duration: 0,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animateFade, {
            toValue: 1,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animateLeftValue, {
            toValue: 0,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
      setTimeout(() => {
        setType('CPC');
      }, 100);
      return;
    }
    if (confirmPincode.length === 6) {
      setTimeout(() => {
        setType('PC');
        onPincodeChange('');
        onConfirmPincodeChange('');
      }, 1000);
    }

    onContinueClick();
  };

  // Handle back button
  const _handleBackPress = () => {
    Animated.sequence([
      Animated.sequence([
        Animated.timing(animateFade, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animateLeftValue, {
          toValue: -500,
          duration: 0,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.timing(animateFade, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animateLeftValue, {
          toValue: 0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    setTimeout(() => {
      onPincodeChange('');
      onConfirmPincodeChange('');
      setType('PC');
    }, 100);
  };

  // Render
  const renderTopLeftButton = (title, onPress) => (
    <Pressable
      android_ripple={{ borderless: false }}
      onPress={onPress}
      underlayColor={'#00000000'}
      style={styles.backButtonStyle}>
      {Platform.OS === 'ios' ? (
        <Image
          source={require('../../assets/images/back-ios-white.png')}
          style={styles.backImageStyle}
        />
      ) : (
        <Image
          source={require('../../assets/images/back-android-white.png')}
          style={styles.backImageStyle}
        />
      )}
    </Pressable>
  );

  const renderVerifyView = () => {
    return (
      <View style={styles._mainContainer}>
        {renderTopLeftButton('Cancel', () => {
          onCloseClick();
        })}
        <View style={styles.textImageContainer}>
          <Image source={require('../../assets/images/lock.png')} style={styles.lockImageStyle} />
          <Text style={styles._infoText}>VERIFY</Text>
          <Text style={styles._infoSubText}>
            Please enter your 6 digit pincode to verify request
          </Text>
        </View>

        <View>
          <InputPinComponent onPincodeChange={onPincodeChange} pincodeError={pincodeError} />
        </View>
        <TouchableComponent
          disabled={disabled}
          style={styles._button}
          onPress={onContinueClick}
          underlayColor={AppColors.BLUE}>
          <Animated.View
            style={[
              styles._button,
              {
                backgroundColor: animateNextBtnValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: [AppColors.DISABLED_COLOR, AppColors.WHITE],
                }),
              },
            ]}>
            <Text style={styles._btnTitle}>{t('common.continue')}</Text>
          </Animated.View>
        </TouchableComponent>
      </View>
    );
  };

  const renderView = () => {
    return (
      <Animated.View
        style={[styles._mainContainer, { opacity: animateFade, left: animateLeftValue }]}>
        {type === 'CPC' ? (
          <>
            {renderTopLeftButton('Back', _handleBackPress)}
            <View style={styles.textImageContainer}>
              <Image
                source={require('../../assets/images/lock.png')}
                style={styles.lockImageStyle}
              />
              <Text style={styles._infoText}>{t('PincodeScreen.confirm_pin_title')}</Text>
              <Text style={styles._infoSubText}>
              {t('PincodeScreen.confirm_pin_sub_title')}
              </Text>
            </View>
            <View>
              <InputPinComponent
                onPincodeChange={onConfirmPincodeChange}
                pincodeError={confirmPincodeError}
              />
            </View>
            <TouchableComponent
              disabled={disabled}
              style={styles._button}
              onPress={_handleContinueClick}
              underlayColor={AppColors.BLUE}>
              <Animated.View
                style={[
                  styles._button,
                  {
                    backgroundColor: animateDoneBtnValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: [AppColors.DISABLED_COLOR, AppColors.WHITE],
                    }),
                  },
                ]}>
                <Text style={styles._btnTitle}>{t('common.continue')}</Text>
              </Animated.View>
            </TouchableComponent>
          </>
        ) : (
          <>
            <View style={styles.textImageContainer}>
              <Image
                source={require('../../assets/images/lock.png')}
                style={styles.lockImageStyle}
              />
              <Text style={styles._infoText}>{t('PincodeScreen.title')}</Text>
              <Text style={styles._infoSubText}>{t('PincodeScreen.sub_title')}</Text>
            </View>
            <View>
              <InputPinComponent onPincodeChange={onPincodeChange} pincodeError={pincodeError} />
            </View>
            <View style={styles._btnContainer}>
              <TouchableComponent
                disabled={disabled}
                style={styles._button}
                onPress={_handleContinueClick}
                underlayColor={AppColors.BLUE}>
                <Animated.View
                  style={[
                    styles._button,
                    {
                      backgroundColor: animateNextBtnValue.interpolate({
                        inputRange: [0, 100],
                        outputRange: [AppColors.DISABLED_COLOR, AppColors.WHITE],
                      }),
                    },
                  ]}>
                  <Text style={styles._btnTitle}>{t('common.next')}</Text>
                </Animated.View>
              </TouchableComponent>
            </View>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'fadeInLeft'}
      animationOut={'fadeOutRight'}
      animationInTiming={250}
      animationOutTiming={250}
      style={{ margin: 0, backgroundColor: AppColors.PRIMARY }}>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingViewStyle}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <View style={styles._mainContainer}>
            {modalType === 'verify' ? renderVerifyView() : renderView()}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: AppColors.PRIMARY,
  },
  keyboardAvoidingViewStyle: {
    flex: 1,
  },
  textImageContainer: {
    alignItems: 'center',
  },
  lockImageStyle: {
    marginBottom: 8,
    height: 100,
    width: 100,
  },
  _infoText: {
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 18,
    marginTop: 8,
    fontFamily: 'Poppins-Bold',
    color: AppColors.WHITE,
  },
  _infoSubText: {
    paddingHorizontal: 20,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: AppColors.WHITE,
  },
  _btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 25,
  },
  _button: {
    width: 250,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  _btnTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: AppColors.BLACK_COLOR,
  },
  backImageStyle: {
    resizeMode: 'contain',
    height: 18,
    width: 18,
  },
  backButtonStyle: {
    padding: 8,
    paddingLeft: 12,
    paddingRight: 12,
    position: 'absolute',
    top: 8,
    left: 16,
  },
});

export default PincodeModal;
