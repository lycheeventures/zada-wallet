import * as React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BLACK_COLOR, GREEN_COLOR, WHITE_COLOR } from '../theme/Colors';

const img1 = require('../assets/images/walkthrough1.png');
const img2 = require('../assets/images/walkthrough2.png');
const img3 = require('../assets/images/walkthrough3.png');
const img4 = require('../assets/images/walkthrough4.png');

import Swiper from 'react-native-swiper';

const Slides = [
  {
    image: img1,
    title: 'Introducing the ZADA Wallet',
    text: 'You have now taken the first step to being in control of your personal data and identities.',
    text2: 'Swipe or press Get Started',
  },
  {
    image: img2,
    title: 'Creating a connection',
    text: 'Connect with organisations you trust to receive and share credentials securely.',
  },
  {
    image: img3,
    title: 'Credential Offers',
    text: 'All New Credential offers will be listed under Actions.\n\nYou need to click and Accept before a credential is stored in your ZADA wallet.',
  },
  {
    image: img4,
    title: 'Verification Request',
    text: "When an organisation want you to share data they will send a Verification request.Review the request and Accept or Decline. You are in control! \n\n That's all for now. Go ahead and explore the ZADA Ecosystem!",
  },
];

function IntroScreen({ navigation }) {
  const nextHandler = () => {
    navigation.navigate('WelcomeScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerSwiper}>
        <Swiper
          style={styles.wrapper}
          showsButtons={true}
          showsPagination={true}
          scrollEnabled={false}>
          {Slides.map((item, index) => {
            let imageStyle = styles.swiperImage;
            return (
              <View style={styles.slide1} key={'id' + index}>
                <View style={styles.imageViewStyle}>
                  <Image resizeMode="cover" style={imageStyle} source={item.image} />
                </View>
                <View style={styles.textViewStyle}>
                  <Text style={styles.swiperTitle}>{item.title}</Text>
                  <Text style={styles.swiperText}>{item.text}</Text>
                  <Text style={styles.swiperText2}>{item.text2}</Text>
                </View>
              </View>
            );
          })}
        </Swiper>
      </View>

      <View style={styles.buttonView}>
        <TouchableOpacity style={styles.primaryButton} onPress={nextHandler}>
          <Text style={styles.text}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    borderColor: GREEN_COLOR,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: GREEN_COLOR,
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingRight: 20,
    width: 250,
  },
  welcomeText: {
    color: 'black',
    fontSize: 25,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE_COLOR,
  },

  imageViewStyle: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  textViewStyle: {
    flex: 1,
  },

  swiperImage: {
    width: 280,
    height: 250,
    backgroundColor: 'white',
  },
  swiperTitle: {
    marginHorizontal: 16,
    textAlign: 'center',
    color: BLACK_COLOR,
    fontSize: 16,
    fontFamily: 'Poppins-bold',
    fontWeight: 'bold',
  },
  swiperText: {
    marginTop: 8,
    marginHorizontal: 40,
    textAlign: 'center',
    color: BLACK_COLOR,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  swiperText2: {
    marginTop: 8,
    marginHorizontal: 16,
    textAlign: 'center',
    color: BLACK_COLOR,
    fontSize: 14,
    fontFamily: 'Poppins-bold',
    fontWeight: 'bold',
  },
  text: {
    color: WHITE_COLOR,
    alignSelf: 'center',
    fontFamily: 'Merriweather-Bold',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE_COLOR,
  },

  containerSwiper: {
    height: '70%',
    // borderWidth: 2,
  },

  buttonView: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default IntroScreen;
