import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthStackParamList } from '../../../../navigation/types';
import TouchableComponent from '../../../../components/Buttons/TouchableComponent';
import { AppColors } from '../../../../theme/Colors';

const HeaderRightButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableComponent style={styles.headerRightContainerStyle} onPress={onPress}>
    <Text style={styles.headerRightTextStyle}>Next</Text>
  </TouchableComponent>
);

const HeaderLeftButton = ({
  navigation,
  route,
  onPress,
  underlayColor = '#00000010',
}: {
  navigation?: NativeStackNavigationProp<AuthStackParamList>;
  route?: any;
  onPress?: () => void;
  underlayColor?: string;
}) => (
  <TouchableComponent
    underlayColor={underlayColor}
    style={styles.headerLeftContainerStyle}
    onPress={() =>
      onPress
        ? onPress()
        : navigation && route.name === 'VerifyOTPScreen'
        ? navigation.navigate('PhoneNumberScreen')
        : navigation?.goBack()
    }>
    <Text style={styles.headerLeftTextStyle}>Back</Text>
  </TouchableComponent>
);

const styles = StyleSheet.create({
  headerLeftContainerStyle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerLeftTextStyle: {
    fontFamily: 'Poppins-Regular',
    color: AppColors.GRAY,
  },
  headerRightContainerStyle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerRightTextStyle: {
    fontFamily: 'Poppins-Regular',
    color: AppColors.PRIMARY,
  },
});

export { HeaderRightButton, HeaderLeftButton };
