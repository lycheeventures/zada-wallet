import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Animated } from 'react-native';
import { RED_COLOR } from '../../theme/Colors';

interface INProps {
  onPincodeChange: (text: string) => {};
  pincodeError: string;
}

const CODE_LENGTH = 6;

const InputPinComponent = (props: INProps) => {
  // Constants
  const codeDigitsArray = new Array(CODE_LENGTH).fill(0);
  const { pincodeError, onPincodeChange } = props;

  // States
  const [code, setCode] = useState('');
  const [containerIsFocused, setContainerIsFocused] = useState(false);

  // Refs
  const ref = useRef<TextInput>(null);

  // Functions
  const handleOnPress = () => {
    setContainerIsFocused(true);
    ref?.current?.focus();
  };

  const handleOnBlur = () => {
    setContainerIsFocused(false);
  };
  const handleCodeChange = (text: string) => {
    setCode(text);
    onPincodeChange(text);
  };

  const toDigitInput = (_value: number, idx: number) => {
    const emptyInputChar = ' ';
    const digit = code[idx] || emptyInputChar;

    const isCurrentDigit = idx === code.length;
    const isLastDigit = idx === CODE_LENGTH - 1;
    const isCodeFull = code.length === CODE_LENGTH;

    const isFocused = isCurrentDigit || (isLastDigit && isCodeFull);

    const containerStyle =
      containerIsFocused && isFocused
        ? { ...style.inputContainer, ...style.inputContainerFocused }
        : style.inputContainer;

    return (
      <View key={idx} style={[containerStyle, { marginLeft: idx == 3 ? 30 : 14 }]}>
        <Text style={style.inputText}>{digit === ' ' ? '*' : digit}</Text>
      </View>
    );
  };

  return (
    <View style={style.container}>
      <Pressable style={style.inputsContainer} onPress={handleOnPress}>
        {codeDigitsArray.map(toDigitInput)}
      </Pressable>
      <TextInput
        ref={ref}
        value={code}
        onChangeText={handleCodeChange}
        onSubmitEditing={handleOnBlur}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        style={style.hiddenCodeInput}
      />
      {pincodeError.length > 0 && (
        <View style={{ height: 20, justifyContent: 'center' }}>
          <Text style={style.errorStyle}>{pincodeError}</Text>
        </View>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    // flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 4,
    borderColor: '#cccccc',
  },
  inputContainer: {
    alignItems: 'center',
    width: 30,
    height: 50,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: '#0f5181',
  },
  inputText: {
    fontSize: 16,
    // color: 'black',
  },
  hiddenCodeInput: {
    position: 'absolute',
    height: 0,
    width: 0,
    opacity: 0,
  },
  errorStyle: {
    color: RED_COLOR,
    fontSize: 10,
    paddingLeft: 24,
    paddingRight: 16,
  },
});
export default InputPinComponent;
