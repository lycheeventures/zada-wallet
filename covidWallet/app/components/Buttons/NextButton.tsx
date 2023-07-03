import React from 'react';
import { Dimensions, TextStyle, Animated, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/Colors';

interface INProps {
  title: string;
  color: string;
  onPress: () => void;
  style?: TextStyle;
  disabled?: boolean;
  animateBtnValue?: Animated.Value;
}

const { width, height } = Dimensions.get('screen');

const NextButton = (props: INProps) => {
  const { disabled, title, color, onPress, style, animateBtnValue } = props;

  return (
    <Animated.Text
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor:
            animateBtnValue &&
            animateBtnValue.interpolate({
              inputRange: [0, 100],
              outputRange: [AppColors.DISABLED_COLOR, AppColors.WHITE],
            }),
          position: 'absolute',
          left: width * 0.83,
          top: height * 0.06,
          zIndex: 10,
          padding: 5,
          color: color,
          fontFamily: 'Poppins-Bold',
        },
        style,
      ]}>
      {title}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    position: 'absolute',
    left: width * 0.83,
    top: height * 0.06,
    zIndex: 10,
    padding: 5,
    fontFamily: 'Poppins-Bold',
  },
});
export default NextButton;
