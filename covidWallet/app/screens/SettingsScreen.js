import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Linking, Switch, Dimensions, Platform } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { getVersion } from 'react-native-device-info';
import Icon from 'react-native-vector-icons/AntDesign';

import { BLACK_COLOR, GRAY_COLOR, GREEN_COLOR, PRIMARY_COLOR, WHITE_COLOR } from '../theme/Colors';
import { getItem, saveItem } from '../helpers/Storage';
import { BIOMETRIC_ENABLED, APP_VERSION, PIN_CODE } from '../helpers/ConfigApp';
import { showAskDialog, showMessage, showNetworkMessage, showOKDialog } from '../helpers/Toast';
import { useAppDispatch, useAppSelector } from '../store';
import { updateUser } from '../store/auth';
import { changeAppStatus } from '../store/app';
import { clearAll, deleteAccountAndClearAll } from '../store/utils';
import { selectAutoAcceptConnection, selectUser } from '../store/auth/selectors';
import { selectAppStatus, selectNetworkStatus } from '../store/app/selectors';
import useDevelopment from '../hooks/useDevelopment';
import OverlayLoader from '../components/OverlayLoader';

export default function SettingsScreen(props) {
  // Constants
  const dispatch = useAppDispatch();

  // Selectors
  const autoAcceptConnection = useAppSelector(selectAutoAcceptConnection);
  const user = useAppSelector(selectUser);
  const appStatus = useAppSelector(selectAppStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // hooks
  const { longPressCount, pressCount, buttonPressed, developmentMode, setDevelopmentMode } =
    useDevelopment();

  const [isBioEnable, setBioEnable] = useState(false);
  const [isAcceptConnectionEnabled, setIsAcceptConnectionEnabled] = useState(autoAcceptConnection);
  const [version, setVersion] = useState(null);

  // Set App Status to idle on load.
  useEffect(() => {
    dispatch(changeAppStatus('idle'));
  }, [dispatch]);

  useEffect(() => {
    const updatevalues = async () => {
      let appVersion = JSON.parse((await getItem(APP_VERSION)) || null);

      let biometric = JSON.parse((await getItem(BIOMETRIC_ENABLED)) || 'false');

      // let auto_accept_connection = JSON.parse((await getItem(AUTO_ACCEPT_CONNECTION)) || 'false');

      setBioEnable(biometric);
      // setIsAcceptConnectionEnabled(auto_accept_connection);
      setVersion(appVersion);
    };
    updatevalues();
  }, []);

  const _toggleBio = (value) => {
    props.route.params.oneTimeAuthentication((e) => _bioResult(e, value));
  };

  const _bioResult = async (result, value) => {
    if (result) {
      // Saving preference in asyncstorage.
      await saveItem(BIOMETRIC_ENABLED, JSON.stringify(value));

      // Display message.
      if (value) {
        setBioEnable(true);
        // Display message.
        setTimeout(() => {
          showMessage('ZADA Wallet', 'Biometric enabled!');
        }, 1000);
      } else {
        setBioEnable(false);
        setTimeout(() => {
          showMessage('ZADA Wallet', 'Biometric disabled!');
        }, 1000);
      }
    } else {
      if (result) setBioEnable(false);
    }
  };

  const _toggleAcceptConnection = (value) => {
    dispatch(updateUser({ ...user, auto_accept_connection: value }));
    setIsAcceptConnectionEnabled(value);
  };

  const onLogoutPressed = async () => {
    if (networkStatus === 'disconnected') {
      showNetworkMessage();
      return;
    }

    showAskDialog(
      'Are you sure?',
      'Are you sure you want to log out?',
      async () => {
        dispatch(changeAppStatus('loading'));
        const pCode = await getItem(PIN_CODE);
        saveItem(PIN_CODE, pCode);
        clearAll(dispatch);
      },
      () => {},
      'Ok'
    );
  };

  // when user will click on edit profile screen
  const _onEditProfileClick = () => {
    props.navigation.navigate('ProfileScreen', { initDeleteAccount });
  };

  const initDeleteAccount = () => {
    showOKDialog(
      'ZADA Wallet',
      'Account deletion has been intiated. An Email has been dispatched. Please check your mailbox to continue with this process.',
      () => {
        console.log('ok');
      }
    );

    dispatch(changeAppStatus('loading'));
    deleteAccountAndClearAll(dispatch);
  };

  return (
    <View style={styles._mainContainer}>
      {appStatus === 'loading' && <OverlayLoader text="Logging out..." />}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles._list}
        contentContainerStyle={styles._listContainer}>
        <Text style={styles._rowHeading}>General</Text>
        <View style={styles._row}>
          <Text style={styles._rowLabel}>Authenticate with Biometric</Text>
          <Switch
            trackColor={{
              false: '#81b0ff',
              true: '#3ab6ae',
            }}
            ios_backgroundColor="#ffffff"
            onValueChange={_toggleBio}
            value={isBioEnable}
          />
        </View>

        <View style={styles._row}>
          <Text style={styles._rowLabel}>Auto Accept Connections</Text>
          <Switch
            trackColor={{
              false: '#81b0ff',
              true: '#3ab6ae',
            }}
            ios_backgroundColor="#ffffff"
            onValueChange={_toggleAcceptConnection}
            value={isAcceptConnectionEnabled}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => {
            _onEditProfileClick();
          }}>
          <Text style={styles._rowLabel}>Edit Profile</Text>
          <Icon name="right" color={GREEN_COLOR} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => {
            onLogoutPressed();
          }}>
          <Text style={styles._rowLabel}>Logout</Text>
          <Icon name="right" color={GREEN_COLOR} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={buttonPressed}
          onPress={longPressCount !== 3 ? () => {} : buttonPressed}>
          <Text style={[styles._rowHeading, { marginTop: 15 }]}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => props.navigation.navigate('ContactUs')}>
          <Text style={styles._rowLabel}>Contact Us</Text>
          <Icon name="right" color={GREEN_COLOR} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => {
            Linking.openURL('https://zada.io/privacy-policy/');
          }}>
          <Text style={styles._rowLabel}>License and agreements</Text>
          <Icon name="right" color={GREEN_COLOR} size={18} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles._row}
          onPress={() => props.navigation.navigate('AboutUs')}>
          <Text style={styles._rowLabel}>About Us</Text>
          <Icon name="right" color={GREEN_COLOR} size={18} />
        </TouchableOpacity>

        <Text style={styles.devTextStyle}>
          {longPressCount === 3 && !developmentMode
            ? 'Now just tap ' + (4 - pressCount) + ' more times!'
            : ''}
        </Text>
        {developmentMode && (
          <View activeOpacity={0.8} style={styles._row}>
            <Text style={styles._rowLabel}>Development Mode</Text>
            <Switch
              trackColor={{
                false: '#81b0ff',
                true: '#3ab6ae',
              }}
              ios_backgroundColor="#ffffff"
              onValueChange={() => setDevelopmentMode(!developmentMode)}
              value={developmentMode}
            />
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Text
          onPress={() => {
            if (Platform.OS === 'android')
              Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.zadanetwork.wallet'
              );
            else Linking.openURL('https://apps.apple.com/us/app/zada-wallet/id1578666669');
          }}
          style={styles._appVersion}>{`Version ${
          version == undefined || version === null ? getVersion().toString() : version.version
        }`}</Text>
        <Text style={styles.footerText}>
          In Collaboration with&nbsp;
          <Text
            style={{ color: PRIMARY_COLOR }}
            onPress={() => {
              Linking.openURL('https://trust.net.pk/');
            }}>
            TrustNet Pakistan
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
  },
  _list: {
    flexGrow: 1,
  },
  _listContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  _row: {
    width: '100%',
    height: Dimensions.get('screen').height * 0.06,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    padding: 10,
    shadowColor: BLACK_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 5,
  },
  _rowHeading: {
    fontSize: 16,
    textTransform: 'uppercase',
    color: GRAY_COLOR,
    marginBottom: 5,
  },
  _rowLabel: {
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    color: BLACK_COLOR,
  },
  _appVersion: {
    fontSize: 14,
    color: BLACK_COLOR,
    textAlign: 'center',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
  },
  footer: {
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: 'black',
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 5,
    fontSize: 14,
    marginHorizontal: 10,
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  devTextStyle: {
    textAlign: 'center',
    marginTop: 24,
  },
});
