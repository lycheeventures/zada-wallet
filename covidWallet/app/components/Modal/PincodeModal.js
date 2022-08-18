import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  BACKGROUND_COLOR,
  BLACK_COLOR,
  GREEN_COLOR,
  WHITE_COLOR,
} from '../../theme/Colors';
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
  // States
  const [type, setType] = useState('PC');
  const [animatedValue] = useState(new Animated.Value(0));
  const [buttonBackgroundValue, setButtonBackgroundValue] = useState(
    new Animated.Value(0)
  );
  const [mark, setMark] = useState(false);

  // UseEffects
  useEffect(() => {
    if (pincode.length === 6) {
      setTimeout(() => {
        _handleContinueClick();
        setMark(false);
        setButtonBackgroundValue(new Animated.Value(0));
      }, 1000);

      setMark(true);
    }
  }, [pincode]);

  useEffect(() => {
    if (mark) {
      Animated.timing(buttonBackgroundValue, {
        toValue: 100,
        duration: 500,
      }).start();
    }
  }, [mark, buttonBackgroundValue]);

  useEffect(() => {
    if (pincodeError !== '' || confirmPincodeError !== '') {
      startShake();
    }
  }, [pincodeError, confirmPincodeError, startShake]);

  // Functions
  // Shake Animation
  const startShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedValue]);

  // Handle continue button
  const _handleContinueClick = () => {
    // Handling Verification
    if (modalType === 'verify') {
      onContinueClick();
      return;
    }

    // Handling Pincode Setting
    if (type === 'PC' && pincode.length === 6) {
      setType('CPC');
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
    onPincodeChange('');
    onConfirmPincodeChange('');
    setType('PC');
  };

  // Render
  const renderTopLeftButton = (title, func) => (
    <Pressable
      android_ripple={{ borderless: false }}
      onPress={func}
      underlayColor={'#00000000'}
      style={styles.backButtonStyle}>
      <Text style={[styles._btnTitle, { color: BLACK_COLOR, fontWeight: 'bold' }]}>
        {title}
      </Text>
    </Pressable>
  );

  const renderVerifyView = () => {
    return (
      <>
        {renderTopLeftButton('Cancel', () => {
          onCloseClick();
        })}
        <Text style={styles._infoText}>
          Please enter your 6 digit pincode to verify request
        </Text>
        <Animated.View
          style={[
            styles.pincodeViewStyle,
            { transform: [{ translateX: animatedValue }] },
          ]}>
          <InputPinComponent
            onPincodeChange={onPincodeChange}
            pincodeError={pincodeError}
          />
        </Animated.View>
        <View style={styles._btnContainer}>
          <TouchableComponent
            onPress={onContinueClick}
            underlayColor={BLACK_COLOR}
            style={[styles._button, { backgroundColor: '#28282B' }]}>
            <Text style={styles._btnTitle}>CONTINUE</Text>
          </TouchableComponent>
        </View>
      </>
    );
  };

  const renderView = () => {
    if (type === 'CPC') {
      return (
        <>
          {renderTopLeftButton('Back', _handleBackPress)}
          <Text style={styles._infoText}>Please confirm PIN Again.</Text>
          <Animated.View
            style={[
              styles.pincodeViewStyle,
              { transform: [{ translateX: animatedValue }] },
            ]}>
            <InputPinComponent
              onPincodeChange={onConfirmPincodeChange}
              pincodeError={confirmPincodeError}
            />
          </Animated.View>
          <View style={styles._btnContainer}>
            <TouchableComponent
              onPress={_handleContinueClick}
              underlayColor={BLACK_COLOR}
              style={[styles._button, { backgroundColor: '#28282B' }]}>
              <Text style={styles._btnTitle}>CONTINUE</Text>
            </TouchableComponent>
          </View>
        </>
      );
    } else {
      return (
        <>
          <Text style={styles._infoText}>Enter a new six-digit PIN.</Text>
          <Animated.View
            style={[
              styles.pincodeViewStyle,
              { transform: [{ translateX: animatedValue }] },
            ]}>
            <InputPinComponent
              onPincodeChange={onPincodeChange}
              pincodeError={pincodeError}
            />
          </Animated.View>
          <View style={styles._btnContainer}>
            <TouchableComponent
              onPress={_handleContinueClick}
              underlayColor={BLACK_COLOR}
              // style={[
              //   ,
              //   { backgroundColor: mark ? GREEN_COLOR : '#28282B' },
              // ]}
            >
              <Animated.View
                style={[
                  styles._button,
                  {
                    backgroundColor: buttonBackgroundValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['#28282B', GREEN_COLOR],
                    }),
                  },
                ]}>
                <Text style={styles._btnTitle}>Next</Text>
              </Animated.View>
            </TouchableComponent>
          </View>
        </>
      );
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'fadeInLeft'}
      animationOut={'fadeOutRight'}
      animationInTiming={500}
      animationOutTiming={500}
      style={{ margin: 0 }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingViewStyle}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flex: 1 }}
          behavior={Platform.OS == 'ios' ? 'padding' : 'height'}>
          <View style={[styles._mainContainer, { backgroundColor: BACKGROUND_COLOR }]}>
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
  },
  keyboardAvoidingViewStyle: {
    flex: 1,
  },
  _infoText: {
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 18,
    marginTop: '20%',
    fontFamily: 'Poppins-Regular',
    color: BLACK_COLOR,
  },
  pincodeViewStyle: {
    marginTop: 24,
  },
  _btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  _button: {
    width: width - 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 4,
  },
  _btnTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: WHITE_COLOR,
  },
  backButtonStyle: {
    padding: 8,
    paddingLeft: 12,
    paddingRight: 12,
    position: 'absolute',
    top: 35,
    left: 16,
  },
});

export default PincodeModal;
