import * as React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { GREEN_COLOR, WHITE_COLOR } from '../theme/Colors';

function GreenPrimaryButton(props) {
  const styles = StyleSheet.create({
    primaryButton: {
      borderColor: GREEN_COLOR,
      borderWidth: 2,
      borderRadius: 20,
      backgroundColor: GREEN_COLOR,
      paddingTop: 10,
      paddingLeft: 20,
      paddingBottom: 10,
      paddingRight: 20,
      marginTop: 10,
      width: 250,
    },
    text: {
      color: WHITE_COLOR,
      alignSelf: 'center',
      fontFamily: 'Merriweather-Bold',
    },
  });

  return (
    <TouchableOpacity style={styles.primaryButton} onPress={props.nextHandler}>
      {props.loading ? (
        <ActivityIndicator size={'small'} color={WHITE_COLOR} />
      ) : (
        <Text style={styles.text}>{props.text}</Text>
      )}
    </TouchableOpacity>
  );
}

export default GreenPrimaryButton;
