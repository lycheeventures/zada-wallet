import React from 'react';
import { Image, StyleSheet } from 'react-native';
import Recaptcha, { RecaptchaHandles } from 'react-native-recaptcha-that-works';
import TouchableComponent from '../../../components/Buttons/TouchableComponent';
import ConstantsList from '../../../helpers/ConfigApp';

interface IProps {
  onVerify: () => {};
  recaptchaRef: React.RefObject<RecaptchaHandles>;
}
const GoogleRecaptcha = (props: IProps) => {
  // Constants
  const { onVerify, recaptchaRef } = props;

  return (
    <Recaptcha
      ref={recaptchaRef}
      siteKey={ConstantsList.GOOGLE_RECAPTCHA_KEY}
      baseUrl={ConstantsList.RECAPTCHA_BASE_URL}
      onVerify={onVerify}
      headerComponent={
        <TouchableComponent
          style={styles.crossViewStyle}
          onPress={() => recaptchaRef && recaptchaRef.current?.close()}>
          <Image
            resizeMode="contain"
            source={require('../../../assets/images/close.png')}
            style={styles.crossImageStyle}
          />
        </TouchableComponent>
      }
    />
  );
};

const styles = StyleSheet.create({
  crossViewStyle: {
    backgroundColor: '#000000',
    position: 'absolute',
    padding: 2,
    right: 16,
    top: 70,
    borderRadius: 20,
    zIndex: 100,
  },
  crossImageStyle: { width: 30, height: 30 },
});

export default GoogleRecaptcha;
