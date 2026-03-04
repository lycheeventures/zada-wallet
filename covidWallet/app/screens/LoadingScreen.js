import * as React from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { PRIMARY_COLOR, AppColors } from '../theme/Colors';
import ChangingText from '../components/Animations/ChangingText';

function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/splash_logo.png')} style={styles.image} />
      <ChangingText messageIndex={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
});

export default LoadingScreen;
