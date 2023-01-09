import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';
import { GREEN_COLOR } from '../../../../theme/Colors';

interface INProps {
  onPress: () => void;
  screen: 'register' | 'login';
}

const RegisterButton = (props: INProps) => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <Image
        style={[
          styles.imageStyle,
          { tintColor: props.screen == 'register' ? GREEN_COLOR : 'grey' },
        ]}
        source={require('../../../../assets/images/register.png')}
      />
      <Text style={styles.textStyle}>Register Account</Text>
      <View
        style={{
          borderBottomColor: props.screen == 'register' ? GREEN_COLOR : 'grey',
          borderBottomWidth: 4,
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    height: 50,
    width: '50%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  textStyle: {
    width: 150,
    height: 30,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    color: 'grey',
  },
});
export default RegisterButton;
