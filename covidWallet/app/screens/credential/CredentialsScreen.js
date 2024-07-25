import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TabView, SceneMap } from 'react-native-tab-view';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { BACKGROUND_COLOR, PRIMARY_COLOR } from '../../theme/Colors';
import Credentials from './components/Credentials';
import CredentialGroups from './components/CredentialGroups';
import BannerComponent from '../../components/Banner/BannerComponent';
import OverlayLoader from '../../components/OverlayLoader';
import { _showAlert, showMessage } from '../../helpers';
import { useAppDispatch, useAppSelector } from '../../store';
import { CredentialAPI } from '../../gateways';
import { selectUser } from '../../store/auth/selectors';
import { selectCredentials } from '../../store/credentials/selectors';
import { getUserProfile } from '../../store/auth/thunk';
import { selectAppStatus } from '../../store/app/selectors';
import { changeAppStatus } from '../../store/app';


const CredentialsScreen = (props) => {
  // Constants
  const layout = useWindowDimensions();
  const dispatch = useAppDispatch();

  // Selectors
  const { t } = useTranslation();
  const titles = [
    { key: 'certificates', title: t('CredentialsScreen.all_certificates') },
    { key: 'groups', title: t('CredentialsScreen.groups') },
  ]
  const user = useAppSelector(selectUser);
  const credentials = useAppSelector(selectCredentials.selectAll);
  const appStatus = useAppSelector(selectAppStatus);

  const renderScene = SceneMap({
    certificates: () => <Credentials {...props} />,
    groups: () => <CredentialGroups {...props} />,
  });

  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState(titles);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerButtonDisabled, setBannerButtonDisabled] = useState(false);

  useEffect(() => {
    setRoutes(titles);
  }, [t])

  // Claim Zada Wallet ID credential Banner
  useEffect(() => {
    if (user && !user.didExist) {
      dispatch(getUserProfile({ phone: user.phone }))
        .unwrap()
        .then(res => {
          if (!res.user.didExist) {
            setShowBanner(true);
          }
        })
    }
  }, [credentials])

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

  const handleClaimCredentialPress = async () => {
    dispatch(changeAppStatus('loading'));
    setBannerButtonDisabled(true);
    let resp = await CredentialAPI.claimCredential('zada-wallet-id');
    if (resp.data.success) {
      setShowBanner(false);
      _showAlert('Zada Wallet', t('messages.success_claim_credential'));
    } else {
      showMessage('Zada', result.data.error);
    }
    dispatch(changeAppStatus('idle'));
    setBannerButtonDisabled(false);
  }

  return (
    <View style={styles._mainContainer}>
      {appStatus === 'loading' && <OverlayLoader text="Please wait..." />}
      <BannerComponent
        show={showBanner}
        disabled={bannerButtonDisabled}
        message={'Claim Zada Wallet ID Credential'}
        buttonText={'Claim'}
        type="success"
        duration={0}
        onPress={handleClaimCredentialPress} />
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
