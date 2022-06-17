import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { parse_date_time } from '../helpers/time';
import { capitalizeFirstLetter } from '../helpers/utils';
import { GRAY_COLOR } from '../theme/Colors';

const RenderValues = ({
  values,
  labelColor,
  inputTextColor,
  inputBackground,
  width,
  mainStyle,
  listStyle,
  listContainerStyle,
  inputTextWeight,
  inputTextSize,
}) => {

  values = Object.keys(values)
    .sort()
    .reduce((obj, key) => {
      obj[key] = values[key];
      return obj;
    }, {});

  let size_values = Object.keys(values).length;

  let credentialDetails =
    values != undefined &&
    Object.keys(values).map((key, index) => {
      let value = values[key];
      value = parse_date_time(value);

      return (
        <View
          key={index}
          style={[styles._mainContainer]}>
          <Text style={[styles._labelStyle, {
            color: labelColor,
            fontWeight: inputTextWeight ? inputTextWeight : null,
            fontSize: inputTextSize ? inputTextSize : null,
          }]}>{capitalizeFirstLetter(key)}</Text>

          <View
            style={[
              styles._inputContainer,
            ]}>
            <Text
              style={[
                styles._inputText,
                {
                  color: inputTextColor,
                  fontWeight: inputTextWeight ? inputTextWeight : null,
                  fontSize: inputTextSize ? inputTextSize : null,
                },
              ]}>
              {value}
            </Text>
          </View>
          {
            index != size_values - 1 &&
            <View
              style={{
                height: 1,
                backgroundColor: "#00000020"
              }}
            />

          }
        </View>
      );
    });

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={listStyle}
      contentContainerStyle={listContainerStyle}>
      {credentialDetails}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    marginBottom: 15,
  },
  _labelStyle: {
    color: GRAY_COLOR,
    marginLeft: 16,
    marginBottom: 5,
  },
  _inputContainer: {
    borderRadius: 25,
    marginLeft: 16,
    paddingBottom: 10,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  _inputText: {},
});

export default RenderValues;
