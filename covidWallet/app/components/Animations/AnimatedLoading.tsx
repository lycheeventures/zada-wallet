import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Spinner, { SpinnerType } from 'react-native-spinkit';

interface INProps {
  color: string;
  type: SpinnerType;
  style?: ViewStyle;
}

const AnimatedLoading = (props: INProps) => {
  return (
    <View style={[styles.container, { ...props.style }]}>
      <Spinner isVisible={true} type={props.type} color={props.color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
});

export default AnimatedLoading;
