import * as React from 'react';
import { View, Text, Linking, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TouchableComponent from '../components/Buttons/TouchableComponent';
import { AppColors } from '../theme/Colors';
import { ZohoSalesIQOpenChat } from '../components/Chat/utils';

function ContactUs() {
  const { t } = useTranslation();
  return (
    <View style={styles.MainContainer}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{
          flexGrow: 0,
        }}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.centerView}>
          <Text style={styles.MainText}>
            {t('ContactUsScreen.title')}
          </Text>
        </View>

        <View>
          <View style={styles.flexRow}>
            <TouchableComponent
              onPress={() => {
                Linking.openURL('tel://+959765606651');
              }}
              addShadow={true}>
              <View style={styles.callViewStyle}>
                <MaterialIcons name="phone" size={35} color={AppColors.WHITE} />
                <Text style={[styles.ItemText, { color: AppColors.WHITE }]}>Call Us</Text>
              </View>
            </TouchableComponent>

            <TouchableComponent
              onPress={() => {
                Linking.openURL('mailto:help@zada.io');
              }}
              addShadow={true}>
              <View style={styles.callViewStyle}>
                <MaterialIcons name="mail" size={35} color={AppColors.WHITE} />
                <Text style={[styles.ItemText, { color: AppColors.WHITE }]}>Email</Text>
              </View>
            </TouchableComponent>
          </View>
          <View style={styles.flexRow}>
            <TouchableComponent
              onPress={() => {
                Linking.openURL('http://m.me/zadamyanmar');
              }}
              addShadow={true}>
              <View style={styles.callViewStyle}>
                <MaterialCommunityIcons
                  name="facebook-messenger"
                  size={35}
                  color={AppColors.WHITE}
                />
                <Text style={[styles.ItemText, { color: AppColors.WHITE }]}>Facebook</Text>
              </View>
            </TouchableComponent>

            <TouchableComponent
              onPress={() => {
                ZohoSalesIQOpenChat();
              }}
              addShadow={true}>
              <View style={styles.callViewStyle}>
                <MaterialCommunityIcons name="chat-processing" size={35} color={AppColors.WHITE} />
                <Text style={[styles.ItemText, { color: AppColors.WHITE }]}>Chat Now!</Text>
              </View>
            </TouchableComponent>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 32,
    justifyContent: 'space-around',
  },
  contentContainer: {
    justifyContent: 'center',
  },
  callViewStyle: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.BLUE,
    borderRadius: 4,
  },
  centerView: {
    marginVertical: 25,
    marginLeft: 15,
    marginRight: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 0,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBubbleViewStyle: {
    flex: 1,
    marginBottom: 50,
    marginRight: 18,
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
});
export default ContactUs;
