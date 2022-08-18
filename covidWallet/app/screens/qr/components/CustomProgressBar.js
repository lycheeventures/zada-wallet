import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { GREEN_COLOR } from '../../../theme/Colors';

function CustomProgressBar(props) {
  return (
    <Modal onRequestClose={() => null} visible={props.isVisible}>
      <View style={styles.viewStyle}>
        <ActivityIndicator color={GREEN_COLOR} size="large" />
        <Text style={styles.textStyle}>{props.text}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewStyle: {
    borderRadius: 10,
    backgroundColor: 'white',
    padding: 25,
    flexDirection: 'row',
  },
  textStyle: {
    paddingLeft: 20,
    alignSelf: 'center',
    alignContent: 'center',
    textAlign: 'center',
    fontSize: 15,
    fontFamily: 'Merriweather-Bold',
  },
});
export default CustomProgressBar;
