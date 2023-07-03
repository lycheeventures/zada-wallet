import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RadioButton = ({ option, selectedOption, onSelect }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity key={option} style={styles.radioButton} onPress={() => onSelect(option)}>
        <View style={styles.radioButtonIcon}>
          {selectedOption === option && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioButtonLabel}>{option}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  radioButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'gray',
  },
  radioButtonLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default RadioButton;
