import React, { useEffect } from 'react';
import { TransitionPresets } from '@react-navigation/stack';
import { Platform, Text, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { AppColors, BACKGROUND_COLOR, BLACK_COLOR } from '../theme/Colors';
import { MainStack, MainStackNavigationProp, TabStackParamList } from './types';

// Screens
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import ContactUs from '../screens/ContactUs';
import AboutUs from '../screens/AboutUs';
import UserGuideScreen from '../screens/UserGuideScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import QRScreen from '../screens/qr/QRScreen';
import NewQRScreen from '../screens/qr/NewQRScreen';
import ConnectionAccept from '../screens/qr/ConnectionAccept';
import CredDetailScreen from '../screens/credential/CredDetailScreen';
import LanguageSelectionScreen from '../screens/settings/LanguageSelectionScreen';
import { navigationRef } from './utils';
import VerificationRequestScreen from '../screens/verification_request_screen/VerificationRequestScreen';
import ConnectionBaseVerificationScreen from '../screens/verification_request_screen/ConnectionBaseVerificationScreen';
import { getFocusedRouteNameFromRoute, useIsFocused } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchActions } from '../store/actions/thunk';
import { fetchCredentials } from '../store/credentials/thunk';
import { fetchAcceptConnectionList } from '../store/connections/thunk';
import { selectNetworkStatus } from '../store/app/selectors';
import { _showAlert } from '../helpers';
import VerifyQRScreen from '../screens/verification_request_screen/VerifyQRScreen';
import AppTooltip from '../components/tooltip/AppTooltip';
import useAppTooltip from '../hooks/useAppTooltip';
import { AppTooltipKeys } from '../helpers/AppTooltipKeys';

const navigationAnimation =
  Platform.OS == 'ios'
    ? TransitionPresets.DefaultTransition
    : TransitionPresets.RevealFromBottomAndroid;

const MainNavigator = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const networkStatus = useAppSelector(selectNetworkStatus);

  const backIcon = Platform.OS === 'ios' ? 'chevron-left' : 'arrow-back';

  function getHeaderTitle(route: any): string {
    const routeName = getFocusedRouteNameFromRoute(route) ?? t('common.actions');

    switch (routeName) {
      case 'Actions':
        return t('common.actions');
      case 'Credentials':
        return t('common.credentials');
      case 'Connections':
        return t('common.connections');
      default:
        return routeName;
    }
  }

  // start app walkthrough
  const { activeStep, onNext, onSkip } = useAppTooltip({
    tooltipKey: AppTooltipKeys.MAIN_SCREEN,
    totalSteps: 3,
  });

  const onRefresh = async (route: any) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? t('common.actions');

    if (networkStatus !== 'connected') {
      _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
      return;
    }

    switch (routeName) {
      case 'Actions':
        return getActions();
      case 'Credentials':
        return getCredentials();
      case 'Connections':
        return getConnections();
      default:
        return;
    }
  };

  const getActions = async () => {
    dispatch(fetchActions() as any);
  };

  const getCredentials = () => {
    dispatch(fetchCredentials() as any);
  };

  const getConnections = () => {
    dispatch(fetchAcceptConnectionList() as any);
  };

  return (
    <MainStack.Navigator screenOptions={{ ...navigationAnimation }} initialRouteName="MainScreen">
      <MainStack.Screen
        name="MainScreen"
        options={({ navigation, route }) => ({
          headerStyle: {
            backgroundColor: AppColors.BACKGROUND,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="shield-check" size={20} color={AppColors.PRIMARY} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: AppColors.BLACK }}>
                {getHeaderTitle(route)}
              </Text>
            </View>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <AppTooltip
              isVisible={activeStep === 1}
              message={t('tooltips.setting')}
              onNext={onNext}
              onSkip={onSkip}
              isLastStep={false}
              placement="bottom"
              spacing={-60}>
              <TouchableOpacity
                onPress={() => {
                  navigationRef.navigate('SettingsScreen');
                }}>
                <MaterialIcons size={28} name="menu" style={styles.headerRightIcon} />
              </TouchableOpacity>
            </AppTooltip>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppTooltip
                isVisible={activeStep === 2}
                message={t('tooltips.refresh')}
                onNext={onNext}
                onSkip={onSkip}
                isLastStep={false}
                placement="bottom"
                spacing={-60}>
                <TouchableOpacity
                  onPress={() => {
                    onRefresh(route);
                  }}>
                  <MaterialIcons name="refresh" size={28} style={styles.headerRightIcon} />
                </TouchableOpacity>
              </AppTooltip>
              <AppTooltip
                isVisible={activeStep === 3}
                message={t('tooltips.qr')}
                onNext={onNext}
                onSkip={onSkip}
                isLastStep={true}
                placement="bottom"
                spacing={-60}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('NewQRScreen');
                  }}>
                  <MaterialIcons name="qr-code-scanner" size={28} style={styles.headerRightIcon} />
                </TouchableOpacity>
              </AppTooltip>
            </View>
          ),
        })}
        component={TabNavigator}
      />
      <MainStack.Screen
        name="SettingsScreen"
        options={({ navigation }) => ({
          headerTitle: 'Settings',
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name={backIcon}
            />
          ),
        })}
        component={SettingsScreen}
      />
      <MainStack.Screen
        name={'ContactUs'}
        options={({ navigation }) => ({
          headerTitle: t('SettingsScreen.contact_us'),
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name={backIcon}
            />
          ),
        })}
        component={ContactUs}
      />
      <MainStack.Screen
        name="AboutUs"
        options={({ navigation }) => ({
          headerTitle: t('SettingsScreen.about_us'),
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name={backIcon}
            />
          ),
        })}
        component={AboutUs}
      />
      <MainStack.Screen
        name="UserGuide"
        options={({ navigation }) => ({
          headerTitle: t('SettingsScreen.user_guide'),
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name={backIcon}
            />
          ),
        })}
        component={UserGuideScreen}
      />
      <MainStack.Screen
        name="ProfileScreen"
        options={({ navigation }) => ({
          headerTitle: t('SettingsScreen.edit_profile'),
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name={backIcon}
            />
          ),
        })}
        component={ProfileScreen}
      />
      <MainStack.Screen
        name="LanguageSelectionScreen"
        options={({ navigation }) => ({
          headerTitle: t('SettingsScreen.change_language'),
          headerLeft: () => (
            <MaterialIcons
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headerRightIcon}
              size={30}
              name={backIcon}
            />
          ),
        })}
        component={LanguageSelectionScreen}
      />
      <MainStack.Screen
        name="CredDetailScreen"
        component={CredDetailScreen}
        options={({ navigation }) => ({
          headerTintColor: 'black',
          headerStyle: {
            backgroundColor: BACKGROUND_COLOR,
          },
          headerShown: false,
        })}
      />
      {/* <MainStack.Screen
        options={{ headerShown: false }}
        name="QRScreen"
        // path="/scanqr/:pathParam1?/:pathParam2?" //npx uri-scheme open https://zadanetwork.com/type=connection_data --android
        component={QRScreen}
      /> */}
      <MainStack.Screen
        name="NewQRScreen"
        options={{ headerShown: false }}
        component={NewQRScreen}
      />
      <MainStack.Screen
        name="ConnectionAccept"
        options={{ headerShown: false }}
        component={ConnectionAccept}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="VerificationRequestScreen"
        component={VerificationRequestScreen}
      />
      <MainStack.Screen
        options={{ headerShown: false }}
        name="ConnectionBaseVerificationScreen"
        component={ConnectionBaseVerificationScreen}
      />
      <MainStack.Screen
        name="VerifyQRScreen"
        options={{ headerShown: false }}
        component={VerifyQRScreen}
      />
    </MainStack.Navigator>
  );
};

const styles = {
  headerRightIcon: {
    padding: 10,
    color: BLACK_COLOR,
  },
};

export default MainNavigator;
