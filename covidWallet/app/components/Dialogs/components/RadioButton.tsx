import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TouchableComponent from '../../Buttons/TouchableComponent';

interface IProps {
  option: string;
  selectedOption: string;
  onSelect: (option: string) => void;
}
const RadioButton = (props: IProps) => {
  const { option, selectedOption, onSelect } = props;
  return (
    <View style={styles.container}>
      <TouchableComponent key={option} style={styles.radioButton} onPress={() => onSelect(option)}>
        <View style={styles.radioButtonIcon}>
          {selectedOption === option && <View style={styles.radioButtonSelected} />}
        </View>
        <Text style={styles.radioButtonLabel}>{option}</Text>
      </TouchableComponent>
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
