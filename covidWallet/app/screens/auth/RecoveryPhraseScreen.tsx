import React, { useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { generateRandomSecret } from '../../helpers/crypto';
import FadeView from '../../components/FadeView';
import { AppColors } from '../../theme/Colors';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import TouchableComponent from '../../components/Buttons/TouchableComponent';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { sendOTP } from '../../store/auth/thunk';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectUser } from '../../store/auth/selectors';
import { updateUser } from '../../store/auth';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}

const secret = generateRandomSecret(12);
const RecoveryPhraseScreen = (props: INProps) => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Store
  const user = useAppSelector(selectUser);

  // States
  const [copied, setCopied] = React.useState(false);

  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerBackground: () => (
        <FadeView style={{ backgroundColor: AppColors.PRIMARY }} duration={500}>
          <View
            style={{
              height: '100%',
            }}
          />
        </FadeView>
      ),
      headerTitleStyle: { color: AppColors.WHITE, fontFamily: 'Poppins-Regular' },
    });
  }, []);

  useEffect(() => {
    dispatch(updateUser({ ...user, walletSecret: secret }));
  }, []);

  const _handleConfirmPress = () => {
    if (user.phone && user.walletSecret) {
      dispatch(sendOTP({ phone: user.phone, secret: user.walletSecret }));
      props.navigation.navigate('VerifyOTPScreen');
    }
  };
  return (
    <FadeView style={{ flex: 1, backgroundColor: AppColors.PRIMARY }} duration={500}>
      <View style={styles.recoveryPhraseHeadingContainer}>
        <Image
          source={require('../../assets/images/recovery.gif')}
          style={{
            width: 200,
            height: 200,
          }}
        />
      </View>
      <TouchableComponent
        style={styles.recoveryPhraseContainer}
        onPress={() => {
          // Copy to clipboard
          Clipboard.setString(secret);
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 3000);
        }}>
        <>
          <Text style={styles.recoveryText}>{secret}</Text>
          <FontAwesome5 name="copy" size={16} color={AppColors.GRAY} />
        </>
      </TouchableComponent>
      <FadeView style={styles.listItems}>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            margin: 16,
            alignItems: 'center',
            // backgroundColor: AppColors.WHITE,
          }}>
          <View style={styles.textContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="key" color={AppColors.WHITE} size={20} />
            </View>
            <Text style={styles.text}>The secret phrase is the master key to your account.</Text>
          </View>
          <View style={styles.textContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="exclamation" color={AppColors.WHITE} size={20} />
            </View>
            <Text style={styles.text}>You can use this phrase to recover your account.</Text>
          </View>
          <View style={styles.textContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="copy" color={AppColors.WHITE} size={20} />
            </View>
            <Text style={styles.text}>Please copy and keep it in a safe place.</Text>
          </View>
        </View>
      </FadeView>

      <View style={styles.btnContainer}>
        <PrimaryButton
          title={'Confirm'}
          onPress={_handleConfirmPress}
          disabled={false}
          buttonStyle={{ backgroundColor: AppColors.WHITE }}
          buttonTitleStyle={{ color: AppColors.PRIMARY }}
        />
      </View>
    </FadeView>
  );
};

const styles = StyleSheet.create({
  recoveryPhraseHeadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryPhraseContainer: {
    flexDirection: 'row',
    height: 70,
    width: 300,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: '10%',
    backgroundColor: AppColors.SUBHEADING_BLUE,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  recoveryText: {
    color: AppColors.WHITE,
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
  },
  copiedTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    width: 200,
  },
  copiedText: {
    color: AppColors.WHITE,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
  },
  text: {
    fontFamily: 'Poppins-Regular',
    color: AppColors.WHITE,
    marginLeft: 20,
  },
  phoneHeadingStyle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: AppColors.WHITE,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  listItems: {
    flex: 1,
    marginTop: 8,
  },
  iconContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecoveryPhraseScreen;
