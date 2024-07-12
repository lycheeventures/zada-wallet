import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { useEffect, useState } from 'react';
import { getCountry } from "react-native-localize";
import HeadingComponent from '../components/HeadingComponent';
import SimpleButton from '../components/Buttons/SimpleButton';
import TextComponent from '../components/TextComponent';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';
import { selectBaseUrl } from '../store/app/selectors';
import { AppColors } from '../theme/Colors';
import { fetchAllowedCountryList } from '../gateways/auth';


const useCountry = () => {

  const { t } = useTranslation();

  // Constants
  const warningText = t('errors.countryNotSupported');

  //states
  const [visible, setVisible] = useState(false);

  //selectors
  const baseUrl = useAppSelector(selectBaseUrl)

  // functions
  const onClose = () => {
    setVisible(false);
  };

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
  }, [baseUrl]);

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
          buttonColor={AppColors.GREEN}
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
    backgroundColor: AppColors.BACKGROUND,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
  }
});

export default useCountry;
