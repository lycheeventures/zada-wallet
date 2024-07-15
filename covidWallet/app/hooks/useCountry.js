import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { useEffect, useState } from 'react';
import HeadingComponent from '../components/HeadingComponent';
import SimpleButton from '../components/Buttons/SimpleButton';
import TextComponent from '../components/TextComponent';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store';
import { selectBaseUrl } from '../store/app/selectors';
import { AppColors } from '../theme/Colors';
import { AuthAPI } from '../gateways';


const useCountry = () => {

  const { t } = useTranslation();

  // Constants
  const warningText = t('errors.countryNotSupported');

  // States
  const [visible, setVisible] = useState(false);

  // Selectors
  const baseUrl = useAppSelector(selectBaseUrl)

  // Functions
  const onClose = () => {
    setVisible(false);
  };

  const isCurrentCountryAllowed = async () => {
    try {
      const response = await AuthAPI.checkIfCountryIsAllowed();
      if (
        response?.data &&
        !response.data.isCountryAllowed
      ) {
        setVisible(true);
      }
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
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver={false}
    >
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
