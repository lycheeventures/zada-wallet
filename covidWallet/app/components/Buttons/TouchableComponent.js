import React from 'react';
import { View, Platform, TouchableHighlight, Pressable, StyleSheet } from 'react-native';

const TouchableComponent = (props) => {
  const shadow = props.addShadow ? { ...styles.shadow } : undefined;
  if (Platform.OS === 'ios') {
    return (
      <TouchableHighlight
        underlayColor={'#00000010'}
        {...props}
        style={{ ...shadow, ...props.style }}>
        {props.children}
      </TouchableHighlight>
    );
  } else {
    return (
      <View style={{ borderRadius: 16, ...shadow, ...props.touchableStyle }}>
        <Pressable android_ripple={{ borderless: false }} {...props}>
          {props.children}
        </Pressable>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
export default TouchableComponent;
