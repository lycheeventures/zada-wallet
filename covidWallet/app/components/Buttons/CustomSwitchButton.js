import React from 'react';
import { TouchableOpacity, Animated, View, StyleSheet } from 'react-native';
import { AppColors } from '../../theme/Colors';

const CustomSwitchButton = ({ value, onValueChange, width = 50, height = 30 }) => {
  const knobPosition = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(knobPosition, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handlePress = () => {
    onValueChange(!value);
  };

  const knobSize = height - 4;
  const translateX = knobPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [2, width - knobSize - 2],
  });

  const backgroundColor = knobPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [AppColors.SWITCH_BUTTON_OFF, AppColors.SWITCH_BUTTON_ON],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={[styles.container, { width, height }]}>
      <Animated.View
        style={[
          styles.track,
          {
            width,
            height,
            borderRadius: height / 2,
            backgroundColor,
          },
        ]}>
        <Animated.View
          style={[
            styles.knob,
            {
              width: knobSize,
              height: knobSize,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  track: {
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    top: 2,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});

export default CustomSwitchButton;
