import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FAB } from '@rneui/themed';
import { AppColors } from '../../theme/Colors';
import FadeView from '../../components/FadeView';
import { _showAlert, showNetworkMessage } from '../../helpers';
import { AppDispatch, useAppDispatch, useAppSelector } from '../../store';
import { selectNetworkStatus } from '../../store/app/selectors';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { CountryList, LanguageList } from './../utils';
import { selectUser } from '../../store/auth/selectors';
import { updateUser } from '../../store/auth';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import SelectModal from '../../components/Modal/SelectModal';
import { CountryCode } from 'react-native-country-picker-modal';

interface INProps {
  navigation: NativeStackNavigationProp<AuthStackParamList>;
}

const { width } = Dimensions.get('window');

const PreferenceScreen = (props: INProps) => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const networkStatus = useAppSelector(selectNetworkStatus);
  const user = useAppSelector(selectUser);
  const { t, i18n } = useTranslation(); // destructure i18n here

  const [country, setCountry] = useState<{ label: string | null; value: CountryCode | null }>();
  const [language, setLanguage] = useState({ label: 'English', value: 'en' });

  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(language.value);
  }, [language]);

  const handleSubmit = () => {
    // Return if network is unavailable
    if (networkStatus != 'connected') {
      showNetworkMessage();
      return;
    }

    if (!country?.value) {
      _showAlert('ZADA', 'Please select a country.');
      return;
    }
    if (!language?.value) {
      _showAlert('ZADA', 'Please select a language.');
      return;
    }

    dispatch(updateUser({ ...user, language: language.value, country: country.value }));
    props.navigation.navigate('PhoneNumberScreen');
  };

  return (
    <FadeView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <View style={styles.headingTextContainer}>
              <Text style={styles.headingText}>{t('PreferenceScreen.title')}</Text>
              <Text style={styles.subHeadingText}>{t('PreferenceScreen.sub_title')}</Text>
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: width,
              backgroundColor: '#00187190',
              zIndex: 1,
            }}
          />
          <Image
            source={require('../../assets/images/preference-background.jpg')}
            resizeMode="cover"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: -1,
            }}
          />

          <View style={styles.formContainer}>
            <SelectModal
              title={t('PreferenceScreen.select_country')}
              type={'country'}
              isVisible={isCountryModalVisible}
              data={CountryList}
              onSelect={(label: string | null, value: CountryCode | null) => {
                setCountry({ label, value });
                setIsCountryModalVisible(false);
              }}
              onClose={() => setIsCountryModalVisible(false)}
            />
            <SelectModal
              title={t('PreferenceScreen.select_language')}
              isVisible={isLanguageModalVisible}
              data={LanguageList}
              onSelect={(label: string, value: string) => {
                setLanguage({ label, value });
                setIsLanguageModalVisible(false);
              }}
              onClose={() => setIsLanguageModalVisible(false)}
            />
            <View style={{ flex: 0.5, justifyContent: 'space-around' }}>
              <PrimaryButton
                title={country?.label ? country.label : t('PreferenceScreen.select_country')}
                onPress={() => setIsCountryModalVisible(true)}
                disabled={false}
                buttonStyle={{ backgroundColor: AppColors.WHITE, height: 50 }}
                buttonTitleStyle={{ color: AppColors.PRIMARY }}
              />
              <PrimaryButton
                title={language?.label ? language.label : t('PreferenceScreen.select_language')}
                onPress={() => setIsLanguageModalVisible(true)}
                disabled={false}
                buttonStyle={{ backgroundColor: AppColors.WHITE, height: 50 }}
                buttonTitleStyle={{ color: AppColors.PRIMARY }}
              />
            </View>
          </View>
          <FAB
            visible={true}
            icon={{ name: 'arrow-forward', color: AppColors.PRIMARY }}
            color={AppColors.WHITE}
            style={{ alignSelf: 'flex-end', right: 30, bottom: 50, zIndex: 10 }}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </FadeView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  headingTextContainer: {
    position: 'absolute',
    top: 80,
    marginHorizontal: 24,
    zIndex: 2,
  },
  headingText: {
    color: AppColors.WHITE,
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
  },
  subHeadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
    color: AppColors.LIGHT_GRAY,
  },
  logoContainer: {
    flex: 1,
    zIndex: 10,
    // justifyContent: 'center',
    // alignItems: 'flex-start',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    zIndex: 10,
  },
  inputView: {
    backgroundColor: AppColors.WHITE,
    borderRadius: 4,
    width: width * 0.7,
    borderBottomWidth: 1,
    borderColor: AppColors.GRAY,
    marginLeft: 10,
    height: 45,
    marginTop: 8,
    paddingLeft: 16,
  },
  loginButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#777',
  }
});

export default PreferenceScreen;
