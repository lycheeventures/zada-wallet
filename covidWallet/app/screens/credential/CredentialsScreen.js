import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BACKGROUND_COLOR, PRIMARY_COLOR } from '../../theme/Colors';
import { TabView, SceneMap } from 'react-native-tab-view';
import Credentials from './components/Credentials';
import { TouchableOpacity } from 'react-native-gesture-handler';
import CredentialGroups from './components/CredentialGroups';


const CredentialsScreen = (props) => {
  // Constants
  const layout = useWindowDimensions();

  // Selectors
  const { t } = useTranslation();
  const titles = [
    { key: 'certificates', title: t('CredentialsScreen.all_certificates') },
    { key: 'groups', title: t('CredentialsScreen.groups') },
  ]

  const renderScene = SceneMap({
    certificates: () => <Credentials {...props} />,
    groups: () => <CredentialGroups {...props} />,
  });

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState(titles);

  useEffect(() => {
    setRoutes(titles);
  }, [t])

  const CustomTabbAr = (props) => {
    return (
      <View style={styles._mainTabbarView}>
        {props.navigationState.routes.map((route, i) => {
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles._tabbar,
                {
                  borderBottomColor: PRIMARY_COLOR,
                  borderBottomWidth: index == i ? 2 : 0,
                },
              ]}
              onPress={() => setIndex(i)}>
              <Text maxFontSizeMultiplier={1.3} style={[styles._tabText]}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles._mainContainer}>
      <TabView
        renderTabBar={(props) => <CustomTabbAr {...props} />}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  _mainTabbarView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 10,
    alignSelf: 'center',
  },
  _tabbar: {
    width: Dimensions.get('window').width * 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    borderRadius: 10,
  },
  _tabText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});

export default CredentialsScreen;
