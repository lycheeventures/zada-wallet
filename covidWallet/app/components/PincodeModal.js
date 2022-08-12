import React, { useEffect, useState } from 'react';
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
import { BACKGROUND_COLOR, BLACK_COLOR, WHITE_COLOR } from '../theme/Colors';
import TouchableComponent from './Buttons/TouchableComponent';
import InputPinComponent from './Input/InputPinComponent';

const { width } = Dimensions.get('screen');
// PC= pincode
// CPC = confirm pincode;
const PincodeModal = ({
  isVisible,
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

  // UseEffects
  useEffect(() => {
    if (pincode.length === 6) {
      _handleContinueClick();
    }
  }, [pincode]);

  // Functions
  // Shake Animation
  const startShake = () => {
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
  };

  // Handle continue button
  const _handleContinueClick = () => {
    // Handling pincode
    if (type === 'PC' && pincode.length === 6) {
      setType('CPC');
      startShake();
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
  const backButton = () => (
    <Pressable
      android_ripple={{ borderless: false }}
      onPress={_handleBackPress}
      underlayColor={'#00000000'}
      style={styles.backButtonStyle}>
      <Text style={[styles._btnTitle, { color: BLACK_COLOR, fontWeight: 'bold' }]}>
        Back
      </Text>
    </Pressable>
  );

  const renderView = () => {
    if (type === 'CPC') {
      return (
        <>
          {backButton()}
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
              style={[styles._button, { backgroundColor: '#28282B' }]}>
              <Text style={styles._btnTitle}>Next</Text>
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
            {renderView()}
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
