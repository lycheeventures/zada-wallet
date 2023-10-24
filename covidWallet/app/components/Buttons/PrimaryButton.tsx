import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { AppColors } from '../../theme/Colors';
import TouchableComponent from './TouchableComponent';
import { Button, IconProps } from 'react-native-elements';

interface INProps {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTitleStyle?: StyleProp<TextStyle>;
  icon?: IconProps;
  textColor?: string;
}
const PrimaryButton = (props: INProps) => {
  // Constants
  const { title, onPress, buttonStyle, buttonTitleStyle, icon, disabled } = props;
  return (
    <Button
      style={[styles._button, buttonStyle]}
      titleProps={{ numberOfLines: 1 }}
      title={title}
      disabled={disabled}
      titleStyle={[styles._btnTitle, buttonTitleStyle]}
      icon={icon ? icon : undefined}
      activeOpacity={0.7}
      buttonStyle={[styles._button, buttonStyle]}
      onPress={onPress}
    />
  );
};

const styles = StyleSheet.create({
  _button: {
    width: 250,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: AppColors.PRIMARY,
  },
  _btnTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: AppColors.WHITE,
  },
});
export default PrimaryButton;
