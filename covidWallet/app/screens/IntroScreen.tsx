import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Alert,
} from 'react-native';
import Carousel, { Pagination } from 'react-native-snap-carousel-v4';
import { AppColors } from '../theme/Colors';

interface INProps {
  navigation: any;
}
type ItemType = { image: number; title: string; text: string; text2?: string };
interface ISlideProps {
  item: ItemType;
  index: number;
  dataIndex: number;
}

const img1 = require('../assets/images/walkthrough1.png');
const img2 = require('../assets/images/walkthrough2.png');
const img3 = require('../assets/images/walkthrough3.png');
const img4 = require('../assets/images/walkthrough4.png');

const sliderWidth = Dimensions.get('window').width;
const itemWidth = Dimensions.get('window').width;
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

const IntroScreen = (props: INProps) => {
  // States
  const [activeSlide, setActiveSlide] = useState(0);
  const [deepLink, setDeepLink] = useState(false);

  // Refs
  const carouselRef = useRef(null);

  useEffect(() => {
    // Setting listener for deeplink
    let deepEvent: any = undefined;
    if (!deepLink) {
      deepEvent = Linking.addEventListener('url', ({ url }) => {
        getUrl(url);
      });
    }
    return () => deepEvent && Linking.removeAllListeners('url');
  }, []);

  const getUrl = async (url: string) => {
    let initialUrl = '';
    if (url != undefined) {
      initialUrl = url;
    } else {
      let initialUrl = await Linking.getInitialURL();
    }
    if (initialUrl === null) {
      setDeepLink(true);
      return;
    } else {
      const parsed = initialUrl.split('/');
      var item = {
        type: '',
        metadata: '',
      };
      item['type'] = parsed[2];
      item['metadata'] = parsed[3];
      setDeepLink(true);

      if (item['type'] === 'recovery') {
        props.navigation.navigate('ResetPasswordScreen', { metadata: item['metadata'] });
      }
    }

    if (initialUrl.includes('Details')) {
      Alert.alert(initialUrl);
    }
  };

  const nextHandler = () => {
    props.navigation.navigate('WelcomeScreen');
  };

  const getPagination = () => {
    return (
      <Pagination
        dotsLength={4}
        activeDotIndex={activeSlide}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: AppColors.PRIMARY,
        }}
        inactiveDotStyle={
          {
            // Define styles for inactive dots here
          }
        }
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    );
  };

  const renderItem = (props: ISlideProps) => {
    const { item, index } = props;
    return (
      <View style={styles.slide1} key={'id' + index}>
        <View style={styles.imageViewStyle}>
          <Image
            resizeMode="contain"
            style={index === 0 ? styles.swiperImage1 : styles.swiperImage}
            source={item.image}
          />
        </View>
        <View style={styles.textViewStyle}>
          <Text style={styles.swiperTitle}>{item.title}</Text>
          <Text style={styles.swiperText}>{item.text}</Text>
          <Text style={styles.swiperText2}>{item.text2}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerSwiper}>
        <Carousel
          ref={carouselRef}
          data={Slides}
          layout={'default'}
          useScrollView
          disableIntervalMomentum={true}
          renderItem={renderItem}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          onSnapToItem={(index) => setActiveSlide(index)}
        />
      </View>
      {getPagination()}
      <View style={styles.buttonView}>
        <TouchableOpacity style={styles.primaryButton} onPress={nextHandler}>
          <Text style={styles.text}>GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.WHITE,
  },
  containerSwiper: {
    height: '70%',
  },
  primaryButton: {
    borderColor: AppColors.GREEN_COLOR,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: AppColors.GREEN_COLOR,
    paddingTop: 10,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingRight: 20,
    width: 250,
  },
  text: {
    color: AppColors.WHITE,
    alignSelf: 'center',
    fontFamily: 'Merriweather-Bold',
  },
  buttonView: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.WHITE,
  },
  imageViewStyle: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  swiperImage1: {
    width: 280,
    height: 220,
    backgroundColor: 'white',
  },
  swiperImage: {
    width: 280,
    height: 240,
    backgroundColor: 'white',
  },
  textViewStyle: {
    flex: 0.9,
  },
  swiperTitle: {
    marginHorizontal: 16,
    textAlign: 'center',
    color: AppColors.BLACK,
    fontSize: 16,
    fontFamily: 'Poppins-bold',
    fontWeight: 'bold',
  },
  swiperText: {
    marginTop: 8,
    marginHorizontal: 24,
    textAlign: 'center',
    color: AppColors.BLACK,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  swiperText2: {
    marginTop: 16,
    marginHorizontal: 16,
    textAlign: 'center',
    color: AppColors.BLACK,
    fontSize: 14,
    fontFamily: 'Poppins-bold',
    fontWeight: 'bold',
  },
});
export default IntroScreen;
