import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import { CountryCode, Flag } from 'react-native-country-picker-modal';
import { Dropdown } from 'react-native-element-dropdown';
import { AppColors } from '../../../theme/Colors';
import Icon from 'react-native-vector-icons/AntDesign';

interface INProps {
  data: { label: string; value: string }[];
  label: string;
  setValue: (val: string | null) => void;
  placeHolder: string;
  iconSource: ImageSourcePropType;
  isCountry?: boolean;
}

const DropdownComponent = (props: INProps) => {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    props.setValue(value);
  }, [value]);

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: AppColors.WHITE }]}>{props.label}</Text>
      );
    }
    return null;
  };

  const renderList = (item: { label: string; value: string }) => {
    if (props.isCountry) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Flag
            key={item.value}
            flagSize={25}
            countryCode={item.value as CountryCode}
            withFlagButton={true}
          />
          <Text style={{ marginLeft: 5, fontFamily: 'Poppins-Regular', color: AppColors.BLACK }}>
            {item.label}
          </Text>
        </View>
      );
    } else {
      return <Text style={{ fontFamily: 'Poppins-Regular' }}>{item.label}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: AppColors.BACKGROUND }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={props.data}
        renderItem={props.isCountry ? renderList : undefined}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? props.placeHolder : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() =>
          props.iconSource ? <Image style={styles.leftIcon} source={props.iconSource} /> : <></>
        }
        renderRightIcon={() => <Icon style={styles.rightIcon} name="down" />}
      />
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderWidth: 2,
    borderColor: AppColors.WHITE,
    color: AppColors.WHITE,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  leftIcon: {
    backgroundColor: AppColors.WHITE,
    marginRight: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  rightIcon: {
    color: AppColors.WHITE,
  },
  label: {
    position: 'absolute',
    color: AppColors.WHITE,
    fontFamily: 'Poppins-Regular',
    backgroundColor: AppColors.SUBHEADING_BLUE,
    left: 22,
    top: 4,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontFamily: 'Poppins-Regular',
    color: AppColors.WHITE,
    fontSize: 16,
  },
  selectedTextStyle: {
    color: AppColors.WHITE,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});
