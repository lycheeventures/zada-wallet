import React, { Component, useEffect, useState } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeViewProps {
  children: any;
  style: ViewStyle;
  duration?: number;
}
const FadeView = ({ children, style, duration }: FadeViewProps) => {
  const [opacityValue, setOpacityValue] = useState(new Animated.Value(0));

  useEffect(() => {
    fadeIn();
  }, []);

  const fadeIn = () => {
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: duration ? duration : 1000, // Duration for the fade-in animation
      useNativeDriver: true, // Enable native driver for better performance
    }).start();
  };
  const animatedStyle = { opacity: opacityValue, ...style };
  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default FadeView;
