import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import { useEffect, useState } from 'react';
import { getCountry } from "react-native-localize";
import { BACKGROUND_COLOR, GREEN_COLOR } from '../theme/Colors';
import HeadingComponent from '../components/HeadingComponent';
import SimpleButton from '../components/Buttons/SimpleButton';
import TextComponent from '../components/TextComponent';


const useCountry = () => {

  // Constants
  const warningText = `Some functionalities might not function properly. Since you are not in the allowed list of countries or you're using a VPN.`;

  //states
  const [visible, setVisible] = useState(false);

  // functions
  const onClose = () => {
    setVisible(false);
  };

  const fetchAllowedCountryList = async () => {
    try {
      const response = await fetch('http://192.168.0.106:8000/api/v1/get_allowed_countries', {
        method: 'GET',
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
        <HeadingComponent text={`Warning!`} />

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
