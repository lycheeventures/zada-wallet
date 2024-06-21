import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { AppColors, RED_COLOR } from '../../theme/Colors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

interface IProps {
  isVisible?: boolean;
  onDismiss?: () => void;
  onPincodeChange: (text: string) => void;
  pincode: string;
  pincodeError: string;
  onConfirmPincodeChange: (text: string) => void;
  confirmPincode: string;
  confirmPincodeError: string;
  savePincode: () => void;
}

const PincodeScreen = ({
  pincode,
  onPincodeChange,
  onDismiss,
  isVisible,
  pincodeError,
  confirmPincode,
  onConfirmPincodeChange,
  savePincode,
  confirmPincodeError
}: IProps) => {

  // states
  const [isVerify, setIsVerify] = useState(false);
  const animateLeftValue = useState(new Animated.Value(0))[0];
  const animateOpacity = useState(new Animated.Value(1))[0];

  const { t } = useTranslation();

  useEffect(() => {
    if (pincode.length === 6 && !pincodeError) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(animateLeftValue, {
            toValue: -500, // Move out of the screen to the left
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animateOpacity, {
            toValue: 0, // Fade out
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]),
      ]).start(() => {
        setIsVerify(true);

        // Reset animation values
        animateLeftValue.setValue(500); // Move out of the screen to the right
        animateOpacity.setValue(0); // Fully transparent

        // Animate back to visible
        Animated.parallel([
          Animated.timing(animateLeftValue, {
            toValue: 0, // Move into the screen from the right
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(animateOpacity, {
            toValue: 1, // Fade in
            duration: 250,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
        ]).start();
      });
    }
  }, [pincode]);


  useEffect(() => {
    // reset pin if there is any error
    if (pincodeError) {
      onPincodeChange("");
    }
    if (confirmPincodeError) {
      onConfirmPincodeChange("")
    }
  }, [pincodeError, confirmPincodeError]);

  useEffect(() => {
    // when confirm pincode is correct, save the pin code
    if (confirmPincode.length === 6 && !confirmPincodeError) {
      savePincode();
    }
  }, [confirmPincode]);

  const handleKeyPress = (key: string) => {
    if (key === 'biometric') return;
    if (key === 'delete') {
      onPincodeChange(pincode.slice(0, -1));
    } else if (pincode.length < 6) {
      onPincodeChange(pincode + key);
    }
  };

  const handleConfirmModalKeyPress = (key: string) => {
    if (key === 'biometric') return;
    if (key === 'delete') {
      onConfirmPincodeChange(confirmPincode.slice(0, -1));
    } else if (confirmPincode.length < 6) {
      onConfirmPincodeChange(confirmPincode + key);
    }
  };

  const PinInput = ({ pin }: { pin: string }) => {
    return (
      <View style={styles.pinContainer}>
        {Array(6)
          .fill('')
          .map((_, index) => (
            <View key={index} style={styles.pinInput}>
              <Text style={styles.pinText}>{pin[index] ? '•' : ''}</Text>
            </View>
          ))}
      </View>
    );
  };

  const handleBackFromConfirmPinScreen = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(animateLeftValue, {
          toValue: 500, // Move out of the screen to the right
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animateOpacity, {
          toValue: 0, // Fade out
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      onPincodeChange("");
      onConfirmPincodeChange("");
      setIsVerify(false);
      // Reset animations after the state change
      animateLeftValue.setValue(-500); // Move out of the screen to the left
      animateOpacity.setValue(0); // Fully transparent

      // Animate back to visible
      Animated.parallel([
        Animated.timing(animateLeftValue, {
          toValue: 0, // Move into the screen from the left
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animateOpacity, {
          toValue: 1, // Fade in
          duration: 250,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }


  const NumericKeyboard = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'biometric', '0', 'delete'];

    return (
      <View style={styles.keyboardContainer}>
        {keys.map(key => (
          <TouchableOpacity
            key={key}
            style={styles.key}
            onPress={() => (isVerify ? handleConfirmModalKeyPress(key) : handleKeyPress(key))}>
            <Text style={styles.keyText}>
              {key === 'biometric' ? (
                <MaterialCommunityIcons name="fingerprint" size={0} />
              ) : key === 'delete' ? (
                '⌫'
              ) : (
                key
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const PincodeModal = () => {
    return (
      <Animated.View style={[styles.container, { left: animateLeftValue, opacity: animateOpacity }]}>
        <Image
          source={require('../../assets/images/lock.png')}
        />
        <Text style={styles.title}>{t('PincodeScreen.title')}</Text>
        <Text style={styles.subTitle}>{t('PincodeScreen.sub_title')}</Text>
        <PinInput pin={pincode} />
        {pincodeError && (
          <View style={{ height: 20, justifyContent: 'center' }}>
            <Text style={styles.errorStyle}>{pincodeError}</Text>
          </View>
        )}
        <NumericKeyboard />
      </Animated.View>
    )
  }

  const VerifyPincodeModal = () => {
    return (
      <Animated.View style={[styles.container, { left: animateLeftValue, opacity: animateOpacity }]}>
        <TouchableOpacity
          style={styles.backIconStyle}
          onPress={handleBackFromConfirmPinScreen}>
          <MaterialCommunityIcons name="arrow-left" size={30} color="#FFF" />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/lock.png')}
        />
        <Text style={styles.title}>{t('PincodeScreen.confirm_pin_title')}</Text>
        <Text style={styles.subTitle}>{t('PincodeScreen.confirm_pin_sub_title')}</Text>
        <PinInput pin={confirmPincode} />
        <NumericKeyboard />
      </Animated.View>
    )
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onDismiss={onDismiss}>
      <View style={{
        backgroundColor: AppColors.PRIMARY,
        flex: 1
      }}>
        {isVerify ?
          <VerifyPincodeModal />
          : <PincodeModal />
        }
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: AppColors.PRIMARY,
  },
  backIconStyle: {
    position: 'absolute',
    top: 20,
    left: 30,
    padding: 10,
  },
  logo: {
    width: 100,
    height: 50,
    marginTop: 100,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlignVertical: 'center',
    color: '#FFF',
  },
  subTitle: {
    flex: 1,
    paddingHorizontal: 20,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: AppColors.WHITE,
  },
  pinContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pinInput: {
    width: 20,
    height: 50,
    borderBottomWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pinText: {
    fontSize: 24,
    color: '#FFF',
  },
  forgotPin: {
    color: '#FFF',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  keyboardContainer: {
    width: '80%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: '25%',
    padding: 20,
    margin: 5,
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    color: '#FFF',
  },
  errorStyle: {
    color: RED_COLOR,
    fontSize: 10,
    paddingLeft: 24,
    paddingRight: 16,
  },
});

export default PincodeScreen;
