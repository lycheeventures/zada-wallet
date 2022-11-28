import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { GREEN_COLOR } from '../../../../theme/Colors';

interface INProps {
  onPress: () => void;
  screen: 'register' | 'login';
}

const LoginButton = (props: INProps) => {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <Image
        style={[styles.imageStyle, { tintColor: props.screen == 'login' ? GREEN_COLOR : 'grey' }]}
        source={require('../../../../assets/images/user.png')}
      />
      <Text style={styles.textStyle}>Login</Text>
      <View
        style={{
          borderBottomColor: props.screen == 'login' ? GREEN_COLOR : 'grey',
          borderBottomWidth: 4,
        }}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  textStyle: {
    width: 150,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Poppins-Regular',
    height: 30,
    color: 'grey',
  },
});

export default LoginButton;
