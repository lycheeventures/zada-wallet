import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { useEffect, useState } from 'react';
import { getCountry } from "react-native-localize";
import { BACKGROUND_COLOR, GREEN_COLOR } from '../theme/Colors';
import HeadingComponent from '../components/HeadingComponent';
import SimpleButton from '../components/Buttons/SimpleButton';
import TextComponent from '../components/TextComponent';
import { useTranslation } from 'react-i18next';


const useCountry = () => {

  const { t } = useTranslation();

  // Constants
  const warningText = t('errors.countryNotSupported');

  //states
  const [visible, setVisible] = useState(false);

  // functions
  const onClose = () => {
    setVisible(false);
  };

  const fetchAllowedCountryList = async () => {
    try {
      const response = await fetch('https://c9fb-139-135-59-98.ngrok-free.app/api/v1/get_allowed_countries', {
        method: 'GET',
        headers: {
          Country: getCountry()
        }
      })
      const allowedCountries = await response.json();
      return allowedCountries;
    } catch (error) {
      throw error;
    }
  }

  const isCurrentCountryAllowed = async () => {
    try {
      const currentCountry = getCountry();
      const response = await fetchAllowedCountryList();
      const isAllowed = response?.allowedCountries.includes(currentCountry);
      setVisible(!isAllowed);
    } catch (error) {
      setVisible(true);
      console.log({ error });
    }

  }

  // UseEffect   
  useEffect(() => {
    isCurrentCountryAllowed();
  }, []);

  return (
    <Modal
      isVisible={visible}
      useNativeDriver={true}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}>
      <View style={styles.container}>
        <HeadingComponent text={t('errors.warning') + '!'} />

        <TextComponent text={warningText} />

        <SimpleButton
          onPress={onClose}
          title="Close"
          titleColor="white"
          buttonColor={GREEN_COLOR}
          style={{
            marginTop: 20,
          }}
          width={250}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_COLOR,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  generatingOverlayLoaderViewStyle: {
    height: 200,
  },
});

export default useCountry;
