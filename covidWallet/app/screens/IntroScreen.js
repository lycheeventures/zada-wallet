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
    title:
      'Introducing the ZADA Wallet and the ZADA Network, here to make your digital life more secure and convenient!',
    text: 'You have now taken the first step to being in control of your personal data and identities \n \n Here are a few slides to introduce the ZADA Wallet and help you get started with connections and your first credentials!',
  },
  {
    image: img2,
    title: 'Creating a connection',
    text: 'Connect with organisations to receive and share credentials. \n \n You can only receive credentials from organisations that you have a connection with to ensure the data being shared is secure.',
  },
  {
    image: img3,
    title: 'Credential Offers',
    text: 'You will be notified of new credentials sent to you. All offers will listed under Actions where you need to click and Accept them so they are stored in your ZADA wallet.',
  },
  {
    image: img4,
    title: 'Verification Request',
    text: "When an organisation want you to share your data they will send a Verification request. You will be notified and find all Verification Requests under Actions. Click on one and you will decide what credential you want to share and what data. Press accept to share the data. \n \n That's all for now. Start exploring the ZADA Ecosystem and its network of organisations with whom you can exchange credentials.",
  },
];

function IntroScreen({ navigation }) {
  const nextHandler = () => {
    navigation.navigate('WelcomeScreen');
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.welcomeText}> Welcome! </Text> */}
      <View style={styles.containerSwiper}>
        <Swiper style={styles.wrapper} showsButtons={false} showsPagination={true}>
          {Slides.map((item, index) => {
            let imageStyle = styles.swiperImage;
            if (index === 1) {
              imageStyle = { ...imageStyle, height: 120, width: 250 };
            }
            if (index === 2) {
              imageStyle = { ...imageStyle, height: 240, width: 300 };
            }
            return (
              <View style={styles.slide1}>
                <Image resizeMode="cover" style={imageStyle} source={item.image} />
                <Text style={styles.swiperTitle}>{item.title}</Text>
                <Text style={styles.swiperText}>{item.text}</Text>
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

  swiperImage: {
    width: 200,
    height: 150,
    backgroundColor: 'white',
  },
  swiperTitle: {
    marginHorizontal: 16,
    textAlign: 'center',
    color: BLACK_COLOR,
    fontSize: 16,
    fontFamily: 'Poppins-bold',
  },
  swiperText: {
    marginTop: 8,
    marginHorizontal: 40,
    textAlign: 'center',
    color: BLACK_COLOR,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
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
