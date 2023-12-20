import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Keyboard,
  InteractionManager,
} from 'react-native';
import { AppColors, RED_COLOR } from '../../theme/Colors';

interface INProps {
  onPincodeChange: (text: string) => void;
  pincodeError: string;
  OTP?: boolean;
  emptyComponent?: () => React.JSX.Element;
  filledComponent?: (digit: string) => React.JSX.Element;
}

const CODE_LENGTH = 6;

const InputPinComponent = (props: INProps) => {
  // Constants
  const codeDigitsArray = new Array(CODE_LENGTH).fill(0);
  const { pincodeError, onPincodeChange, OTP, emptyComponent, filledComponent } = props;

  // States
  const [code, setCode] = useState('');
  const [containerIsFocused, setContainerIsFocused] = useState(false);
  const [textIsFocused, setTextIsFocused] = useState(false);

  // Refs
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      Keyboard.dismiss();
    });

    handleOnPress();
    return () => {
      hideSubscription.remove();
    };
  }, []);

  // Functions
  const handleOnPress = () => {
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
          setTextIsFocused(true);
          setContainerIsFocused(true);
        }
      }, 600)
    });
  };

  const handleOnBlur = () => {
    InteractionManager.runAfterInteractions(() => {
      if (ref.current) {
        setContainerIsFocused(false);
        ref?.current?.blur();
      }
    });
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

    if (emptyComponent && filledComponent) {
      return (
        <View key={idx} style={[containerStyle, { marginLeft: 14 }]}>
          {digit === ' ' ? emptyComponent() : filledComponent(digit)}
        </View>
      );
    } else {
      return (
        <View key={idx} style={[containerStyle, { marginLeft: 14 }]}>
          {digit === ' ' ? (
            <View
              style={{
                height: 10,
                width: 10,
                borderRadius: 5,
                backgroundColor: AppColors.WHITE,
              }}
            />
          ) : (
            <Text style={style.inputText}>{digit}</Text>
          )}
        </View>
      );
    }
  };

  return (
    <View style={style.container}>
      <Pressable style={style.inputsContainer} onPress={handleOnPress}>
        {codeDigitsArray.map(toDigitInput)}
      </Pressable>
      <TextInput
        autoFocus={textIsFocused}
        textContentType="oneTimeCode"
        ref={ref}
        value={code}
        onChangeText={handleCodeChange}
        onBlur={handleOnBlur}
        keyboardType="number-pad"
        returnKeyType="done"
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
    // borderWidth:1,
    // zIndex:100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    borderWidth: 0.2,
    borderColor: '#ffffff30',
    alignItems: 'center',
    width: 30,
    height: 50,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: AppColors.WHITE,
  },
  inputText: {
    fontSize: 24,
    color: AppColors.WHITE,
    textAlign: 'center',
    height: 30,
    width: 30,
    borderRadius: 15,
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
