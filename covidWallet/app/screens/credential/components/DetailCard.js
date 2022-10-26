import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { analytics_log_show_cred_qr } from '../../../helpers/analytics';
import { useAppDispatch } from '../../../store';
import { updateCredential } from '../../../store/credentials';
import TouchableComponent from '../../../components/Buttons/TouchableComponent';
import CardBackground from '../../../components/CardBackground';

const { width } = Dimensions.get('screen');
const DetailCard = ({ item, issue_date, organizationName, setShowQRModal }) => {
  // Constants
  const dispatch = useAppDispatch();

  // Functions
  const handleQRPress = () => {
    analytics_log_show_cred_qr();
    setShowQRModal(true);
  };

  // Issuer LOGO
  const issuerImage = () => {
    return (
      <View style={styles.issuerImageContainer}>
        <Image resizeMode="contain" source={{ uri: item.imageUrl }} style={styles.imageStyle} />
      </View>
    );
  };

  const updateBackgroundImage = (credentialId, background_url) => {
    dispatch(updateCredential({ id: credentialId, changes: { backgroundImage: background_url } }));
  };

  return (
    <TouchableComponent style={{ overflow: 'hidden' }} onPress={handleQRPress}>
      <CardBackground
        item={item}
        schemeId={item.schemaId}
        updateBackgroundImage={updateBackgroundImage}>
        <View style={styles.issueDateViewStyle}>
          {issue_date && (
            <>
              <Text style={styles.issueDateLabelStyle}>Issue Date</Text>
              <Text style={styles.issueTextStyle}>{issue_date}</Text>
            </>
          )}
        </View>
        <View style={styles.issueTextContainerStyle}>
          <Text style={styles.typeTextStyle}>{item?.type}</Text>
        </View>
        <View style={styles._bottomContainer}>
          <View style={styles._bottomInsideContainer}>
            {issuerImage()}
            <View style={styles._cardInfoContainer}>
              {organizationName && (
                <View>
                  <Text style={styles.card_small_text}>Issued by</Text>
                  <Text numberOfLines={2} style={[styles.card_small_text, { fontWeight: 'bold' }]}>
                    {organizationName}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View>
            <View style={styles.touchableStyle}>
              <View style={styles.touchableContainerStyle}>
                <Image
                  source={require('../../../assets/images/qr-code.png')}
                  style={styles.topContainerImage}
                />
              </View>
            </View>
          </View>
        </View>
      </CardBackground>
    </TouchableComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  issueTextContainerStyle: {
    minHeight: 24,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#ffffff20',
  },
  issueDateViewStyle: {
    minHeight: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  issueDateLabelStyle: {
    marginLeft: 16,
    marginTop: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  issueTextStyle: {
    alignSelf: 'flex-end',
    color: '#ffffff90',
    marginRight: 16,
    marginTop: 8,
  },
  typeTextStyle: {
    color: 'white',
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  _bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 16,
    paddingLeft: 16,
    paddingRight: 8,
  },
  _bottomInsideContainer: {
    flexDirection: 'row',
  },
  _cardLogo: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  _cardInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  card_small_text: {
    color: 'white',
    width: width - 190,
  },
  issuerImageContainer: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContainerImage: {
    height: 30,
    width: 30,
    tintColor: '#000000',
  },
  touchableStyle: {
    height: 45,
    width: 45,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  touchableContainerStyle: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clickMeTextStyle: {
    fontSize: 10,
  },
});

export default DetailCard;
