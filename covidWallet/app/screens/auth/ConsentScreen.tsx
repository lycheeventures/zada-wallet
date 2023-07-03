import React, { useEffect, useState } from 'react';
import { StyleSheet, Linking, Text, View, Image, Animated } from 'react-native';
import { AppColors } from '../../theme/Colors';
import { CheckBox } from 'react-native-elements';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import Feather from 'react-native-vector-icons/Feather';
import TouchableComponent from '../../components/Buttons/TouchableComponent';
import AnimatedButton from '../../components/Buttons/AnimatedButton';
import FadeView from '../../components/FadeView';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}
const ConsentScreen = (props: INProps) => {
  //States
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [animateConfirmButtonValue, setAnimateConfirmButtonValue] = useState(new Animated.Value(0));
  const [confirmBtnDisabled, setConfirmBtnDisabled] = useState(false);

  useEffect(() => {
    if (check1 && check2) {
      Animated.timing(animateConfirmButtonValue, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setConfirmBtnDisabled(false);
    } else {
      Animated.timing(animateConfirmButtonValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setAnimateConfirmButtonValue(new Animated.Value(0));
      setConfirmBtnDisabled(true);
    }
  }, [check1, check2]);

  const _handleConfirmPress = () => {
    props.navigation.navigate('PhoneNumberScreen');
  };

  // Code to handle link press
  const handleOnLinkPress = (item: 'terms' | 'privacy') => {
    let url = '';
    if (item === 'terms') {
      url = 'https://www.google.com';
    } else {
      url = 'https://www.google.com';
    }
    Linking.openURL(url);
  };

  return (
    <FadeView style={{ flex: 1 }}>
      <View style={styles.containerStyle}>
        <View style={styles.imageStyle}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/smartphone.png')}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
        <View style={styles.middleContainerStyle}>
          <Text style={styles.headingStyle}>First, we need your consent</Text>
          <CheckBox
            activeOpacity={0.5}
            title="I agree to the general terms and conditions"
            checkedColor={AppColors.BLACK}
            containerStyle={{ backgroundColor: AppColors.TRANSPARENT }}
            textStyle={{ color: AppColors.BLACK }}
            checked={check1}
            onPress={() => setCheck1(!check1)}
          />
          <TouchableComponent
            underlayColor={AppColors.TRANSPARENT}
            style={styles.subTextStyleContainer}
            onPress={() => handleOnLinkPress('terms')}>
            <>
              <Text style={styles.subTextStyle}>show terms and conditions</Text>
              <Feather name="external-link" size={18} style={{ marginLeft: 8 }} />
            </>
          </TouchableComponent>
          <CheckBox
            activeOpacity={0.5}
            title={'I accept the privacy policy'}
            checkedColor={AppColors.BLACK}
            size={24}
            containerStyle={{
              backgroundColor: AppColors.TRANSPARENT,
            }}
            textStyle={{ color: AppColors.BLACK }}
            checked={check2}
            onPress={() => setCheck2(!check2)}
          />
          <TouchableComponent
            underlayColor={AppColors.TRANSPARENT}
            style={styles.subTextStyleContainer}
            onPress={() => handleOnLinkPress('privacy')}>
            <>
              <Text style={styles.subTextStyle}>show privacy policy</Text>
              <Feather name="external-link" size={18} style={{ marginLeft: 8 }} />
            </>
          </TouchableComponent>
        </View>
        <View style={styles.confirmButtonContainer}>
          <AnimatedButton
            title={"CONTINUE"}
            animateBtnValue={animateConfirmButtonValue}
            onPress={_handleConfirmPress}
            disabled={confirmBtnDisabled}
            firstColor={AppColors.LIGHT_GRAY}
            secondColor={AppColors.PRIMARY}
            firstTextColor={AppColors.GRAY}
          />
        </View>
      </View>
    </FadeView>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flex: 3,
    marginHorizontal: 24,
  },
  middleContainerStyle: {
    flex: 1,
  },
  imageStyle: {
    flex: 1,
    height: 200,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingStyle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginTop: 24,
    marginBottom: 8,
  },
  subTextStyleContainer: {
    flexDirection: 'row',
  },
  subTextStyle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: AppColors.PRIMARY,
    marginLeft: 56,
  },
  confirmButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 100,
  },
});

export default ConsentScreen;
