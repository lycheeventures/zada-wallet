import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

function AboutUs() {

  // Selectors
  const { t } = useTranslation();

  return (
    <View style={styles.MainContainer}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{
          flexGrow: 0,
          marginBottom: 16,
        }}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.centerView}>
          <Text style={styles.MainText}>
            {t('AboutUsScreen.text_1')}
          </Text>
          <Text style={styles.MainText}>
            {t('AboutUsScreen.text_2')}
          </Text>
          <Text style={styles.MainText}>
            {t('AboutUsScreen.text_3')}
          </Text>
          <Text style={styles.MainText}>
            {t('AboutUsScreen.text_4')}
          </Text>
          <Text style={styles.MainText}>
            {t('AboutUsScreen.text_5')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerView: {
    marginVertical: 16,
    margin: 16,
    flex: 1,
    marginHorizontal: 32,
  },

  ItemText: {
    color: 'black',
    marginVertical: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
  },

  MainText: {
    color: 'black',
    marginVertical: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AboutUs;
