import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { AppColors } from '../../theme/Colors';

interface IProps {
  show: boolean;
  message: string;
  buttonText: string;
  disabled: boolean;
  type: string;
  duration: number;
  onPress: () => void;
}
const BannerComponent = (props: IProps) => {
  // Constants
  const translateY = useRef(new Animated.Value(-100)).current;

  // Selectors
  const { show, message, buttonText, disabled, type, duration, onPress } = props;

  // States
  const [bannerColor, setBannerColor] = React.useState('');

  useEffect(() => {
    if (duration > 0) {
      setTimeout(() => {
        animateBanner('out');
      }, duration);
    }
    displayBanner();
  }, [show]);

  // Handle Banner animation In and Out
  const animateBanner = (type: 'in' | 'out') => {
    if (type === 'in') {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Handle Banner display
  const displayBanner = async () => {
    if (show) {
      // Set color based on banner type
      switch (type) {
        case 'info':
          setBannerColor(AppColors.GRAY);
          break;
        case 'error':
          setBannerColor(AppColors.DANGER);
          break;
        default:
          setBannerColor(AppColors.GREEN);
      }
      animateBanner('in');
    } else {
      animateBanner('out');
    }
  };

  return (
    <>
      {show && (
        <SafeAreaView>
          <Animated.View
            style={[
              styles.container,
              {
                transform: [{ translateY }],
                backgroundColor: bannerColor,
              },
            ]}>
            <Text style={styles.text}>{message}</Text>
            {buttonText && (
              <TouchableOpacity disabled={disabled} style={styles.button} onPress={onPress}>
                <Text style={styles.text}>{buttonText}</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  text: {
    color: AppColors.WHITE,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    borderWidth: 1,
    borderColor: AppColors.WHITE,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  buttonText: {
    color: AppColors.WHITE,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});

export default BannerComponent;
