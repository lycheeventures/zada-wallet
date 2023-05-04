import axios from 'axios';
import * as React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { ZADA_S3_BASE_URL } from '../helpers/ConfigApp';
import { useAppSelector } from '../store';
import { selectNetworkStatus } from '../store/app/selectors';
import { BLACK_COLOR, WHITE_COLOR } from '../theme/Colors';

const CARD_BG = require('../assets/images/card-bg.png');

function CredentialsCard(props) {
  const { updateBackgroundImage, item } = props;
  const networkStatus = useAppSelector(selectNetworkStatus);
  const [backgroundImage, setBackgroundImage] = React.useState(CARD_BG);
  const [loading, setLoading] = React.useState(true);
  const [isUrl, setUrl] = React.useState(false);

  React.useEffect(() => {
    if (item.backgroundImage === undefined) {
      _checkForImageInS3();
    } else {
      setLoading(false);
      setBackgroundImage(item.backgroundImage);
      setUrl(true);
    }
  }, []);

  const _checkForImageInS3 = () => {
    try {
      if (networkStatus === 'disconnected') {
        setLoading(false);
        setBackgroundImage(CARD_BG);
        setUrl(false);
        return;
      }
      setLoading(true);

      let schemeId = props.schemeId.replace(/:/g, '.');

      fetch(`${ZADA_S3_BASE_URL}/${schemeId}.png`)
        .then((res) => {
          if (res.status === 200) {
            updateBackgroundImage(item.credentialId, `${ZADA_S3_BASE_URL}/${schemeId}.png`);
            setBackgroundImage(`${ZADA_S3_BASE_URL}/${schemeId}.png`);
            setUrl(true);
            setLoading(false);
          } else {
            setUrl(false);
            setBackgroundImage(CARD_BG);
            setLoading(false);
          }
        })
        .catch((error) => {
          setUrl(false);
          setLoading(false);
        });
    } catch (error) {
      setUrl(false);
      setBackgroundImage(CARD_BG);
      setLoading(false);
    }
  };

  return (
    <View style={styles._mainContainer}>
      {loading ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="small" color={WHITE_COLOR} />
        </View>
      ) : (
        <>
          <Image
            source={isUrl ? { uri: backgroundImage } : backgroundImage}
            style={styles._frontLayer}
          />

          <View style={styles._detailsView}>
            <Text maxFontSizeMultiplier={1.5} style={styles._cardTitle}>
              {props.card_type}
            </Text>

            <View style={styles._bottomContainer}>
              <Image source={props.card_logo} style={styles._cardLogo} />
              <View style={styles._cardInfoContainer}>
                <View
                  style={{
                    width: '60%',
                  }}>
                  <Text maxFontSizeMultiplier={1.5} style={styles.card_small_text}>
                    Issued by
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.2}
                    style={[styles.card_small_text, { fontWeight: 'bold' }]}>
                    {props.issuer}
                  </Text>
                </View>
                {props.date ? (
                  <View>
                    <Text maxFontSizeMultiplier={1.2} style={styles.card_small_text}>
                      Issued Date
                    </Text>
                    <Text maxFontSizeMultiplier={2} style={[styles.card_small_text, { fontWeight: 'bold', maxWidth: 100 }]}>
                      {props.date}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  _mainContainer: {
    width: '100%',
    height: 170,
    borderRadius: 20,
    backgroundColor: BLACK_COLOR,
  },
  _frontLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.8,
    borderRadius: 15,
  },
  _detailsView: {
    padding: 20,
    width: '100%',
    height: '100%',
  },
  _cardTitle: {
    color: 'white',
    fontSize: 23,
    lineHeight: 22,
    fontWeight: '100',
  },
  _bottomContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  _cardLogo: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  _cardInfoContainer: {
    width: '75%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  card_small_text: {
    color: 'white',
  },
});

export default CredentialsCard;
