import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/Colors';
import TouchableComponent from './TouchableComponent';
import PrimaryButton from '../PrimaryButton';

interface INProps {
  title: string;
  disabled: boolean;
  onPress: () => void;
  animateBtnValue?: Animated.Value;
  firstColor?: string;
  secondColor?: string;
  firstTextColor?: string;
  secondTextColor?: string;
  shadowColor?: string;
}
const AnimatedButton = (props: INProps) => {
  // Constants
  const {
    title,
    disabled,
    firstColor,
    secondColor,
    firstTextColor,
    secondTextColor,
    shadowColor,
    onPress,
    animateBtnValue,
  } = props;
  let customBackgroundColors = [AppColors.DISABLED_COLOR, AppColors.WHITE];
  let customTextColor = [AppColors.BLACK, AppColors.WHITE];
  let customShadowColor = shadowColor ? shadowColor : '#000';
  if (firstColor && secondColor) {
    customBackgroundColors = [firstColor, secondColor];
  }
  if (firstTextColor || secondTextColor) {
    if (firstTextColor && secondTextColor) {
      customTextColor = [firstTextColor, secondTextColor];
    } else if (firstTextColor) {
      customTextColor = [firstTextColor, AppColors.WHITE];
    } else if (secondTextColor) {
      customTextColor = [AppColors.BLACK, secondTextColor];
    }
  }

  return (
    <>
      <TouchableComponent
        disabled={disabled}
        style={styles._button}
        touchableStyle={styles.touchableStyle}
        onPress={onPress}
        underlayColor={AppColors.BLUE}>
        <Animated.View
          style={[
            styles._button,
            {
              backgroundColor:
                animateBtnValue &&
                animateBtnValue.interpolate({
                  inputRange: [0, 100],
                  outputRange: customBackgroundColors,
                }),
              shadowColor: customShadowColor,
            },
          ]}>
          <Animated.Text
            style={[
              styles._btnTitle,
              {
                color:
                  animateBtnValue &&
                  animateBtnValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: customTextColor,
                  }),
              },
            ]}>
            {title}
          </Animated.Text>
        </Animated.View>
      </TouchableComponent>
    </>
  );
};

const styles = StyleSheet.create({
  _button: {
    height: 50,
    width: 250,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  _btnTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    // color: AppColors.BLACK,
  },
  touchableStyle: {
    overflow: 'hidden',
    borderRadius: 40,
  },
});
export default AnimatedButton;
