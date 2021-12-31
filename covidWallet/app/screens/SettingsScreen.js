import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Linking, Alert, Switch } from 'react-native';
import { TextTypeView, BooleanTypeView } from '../components/ShowTypesView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRIMARY_COLOR } from '../theme/Colors';
import { getItem, saveItem } from '../helpers/Storage';
import { BIOMETRIC_ENABLED } from '../helpers/ConfigApp';
import useBiometric from '../hooks/useBiometric';
import { showMessage, _showAlert } from '../helpers/Toast';
import { AuthContext } from '../context/AuthContext';
import ConstantsList from '../helpers/ConfigApp';
import { get_kyc_status } from '../gateways/kyc';
import OverlayLoader from '../components/OverlayLoader';
import { useFocusEffect } from '@react-navigation/native';

var notVerifiedData = {
  GENERAL: {
    // Agent: {
    //   value: 'Phone',
    //   type: 'Text',
    //   key: '11',
    // },
    // Network: {
    //   value: 'Sovrin Network',
    //   type: 'Radio',
    //   key: '12',
    //   options: ['Soverin', 'non-soverin'],
    // },
    Biometric: {
      value: false,
      type: 'Boolean'
    },
    'Edit Profile': {
      value: 'None',
      type: 'Text',
      key: '36',
    },
    'Logout': {
      value: 'None',
      type: 'Text',
      key: '34',
    },
    key: '1',
  },
  SUPPORT: {
    'Contact us': {
      value: 'None',
      type: 'Link',
      key: '31',
      to: 'mailto:support@zada.com',
    },
    'License and agreements': {
      value: 'None',
      type: 'Link',
      key: '32',
      to: 'https://zada.io/privacy-policy/',
    },
    'About us': {
      value: 'None',
      type: 'Text',
      key: '33',
      to: 'https://zada.io/',
    },
    key: '3',
  },
  'ZADA ID': {
    key: '4',
    'Get ZADA ID': {
      value: 'None',
      type: 'Text',
      key: '40',
    }
  }
};
var isVerifiedData = {
  GENERAL: {
    // Agent: {
    //   value: 'Phone',
    //   type: 'Text',
    //   key: '11',
    // },
    // Network: {
    //   value: 'Sovrin Network',
    //   type: 'Radio',
    //   key: '12',
    //   options: ['Soverin', 'non-soverin'],
    // },
    Biometric: {
      value: false,
      type: 'Boolean'
    },
    'Edit Profile': {
      value: 'None',
      type: 'Text',
      key: '36',
    },
    'Logout': {
      value: 'None',
      type: 'Text',
      key: '34',
    },
    key: '1',
  },
  SUPPORT: {
    'Contact us': {
      value: 'None',
      type: 'Link',
      key: '31',
      to: 'mailto:support@zada.com',
    },
    'License and agreements': {
      value: 'None',
      type: 'Link',
      key: '32',
      to: 'https://zada.io/privacy-policy/',
    },
    'About us': {
      value: 'None',
      type: 'Text',
      key: '33',
      to: 'https://zada.io/',
    },
    key: '3',
  }
};

export default function SettingsScreen(props) {

  const [settingsData, setSettingsData] = useState(notVerifiedData);
  const { logout } = React.useContext(AuthContext);
  const [isVerified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const updatevalues = async () => {
      let biometric = JSON.parse(await getItem(BIOMETRIC_ENABLED) || 'false');
      const tempSettings = { ...settingsData };
      tempSettings.GENERAL.Biometric.value = biometric;
      setSettingsData({ ...tempSettings });
    }

    updatevalues();
  }, [])

  const toggleSwitch = async (parent, child) => {
    // If child == 'Biometric'
    if (child == 'Biometric') {
      props.route.params.oneTimeAuthentication((e) => biometricResult(e, parent, child))
      return
    }

    // Updating UI
    const tempSettings = { ...settingsData };
    tempSettings[parent][child].value = !tempSettings[parent][child].value;
    setSettingsData({ ...tempSettings });
  };

  const biometricResult = async (result, parent, child) => {
    if (result) {
      // Updating UI
      const tempSettings = { ...settingsData };
      tempSettings[parent][child].value = !tempSettings[parent][child].value;
      setSettingsData({ ...tempSettings });

      // Saving preference in asyncstorage.
      await saveItem(BIOMETRIC_ENABLED, JSON.stringify(tempSettings[parent][child].value))

      // Display message.
      if (tempSettings[parent][child].value) {
        // Display message.
        showMessage(
          'ZADA Wallet',
          'Biometric enabled!',
        );
      } else {
        showMessage(
          'ZADA Wallet',
          'Biometric disabled!',
        );
      }

    } else {
      console.log('biometric false')
    }
  }

  const onLogoutPressed = async () => {
    const pCode = await getItem(ConstantsList.PIN_CODE);
    AsyncStorage.clear();
    saveItem(ConstantsList.PIN_CODE, pCode);
    logout();
  }

  // when user will click on edit profile screen
  const _onEditProfileClick = () => {
    props.navigation.navigate('ProfileScreen', { isVerified });
  }

  // on Scan Document click
  const _onScanDocumentClick = async () => {
    props.navigation.navigate('ScanningDocScreen', { screen: 'settings' });
  }

  useFocusEffect(
    React.useCallback(() => {
      const _getKycStatus = async () => {
        try {
          setLoading(true);

          const kyc_status = await getItem(ConstantsList.KYC_STATUS);

          if (kyc_status == undefined || kyc_status == null || kyc_status.length == 0 || kyc_status == 'false') {
            const userId = await getItem(ConstantsList.USER_ID);
            const result = await get_kyc_status(userId);
            if (result.data.success) {
              setVerified(true);
              setSettingsData(isVerifiedData);
              await saveItem(ConstantsList.KYC_STATUS, 'true');
            }
          }
          else {
            setVerified(true);
            setSettingsData(isVerifiedData);
          }
          setLoading(false);
        } catch (error) {
          setLoading(false);
        }
      }
      //_getKycStatus();
    }, [])
  );

  return (
    <View style={styles.container}>
      {
        !loading ? (
          <>
            <FlatList
              data={Object.keys(settingsData)}
              keyExtractor={(item, index) => settingsData[item].key}
              renderItem={({ item }) => {
                const parent = item;
                const parentData = settingsData[parent];
                return (
                  <View>
                    <Text style={styles.parentItem}>{parent}</Text>
                    <FlatList
                      data={Object.keys(parentData)}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => {
                        const childData = settingsData[parent][item];
                        if (item !== 'key' && item !== '') {
                          if (childData.value !== 'None') {
                            if (childData.type === 'Text') {
                              return (
                                <TextTypeView
                                  startValue={item + ':  ' + childData.value}
                                  endValue="Edit"
                                  endIcon=""
                                />
                              );
                            }
                            else if (childData.type === 'Radio') {
                              return (
                                <TextTypeView
                                  startValue={item + ':  ' + childData.value}
                                  endIcon="right"
                                />
                              );
                            } else if (childData.type === 'Boolean') {
                              return (
                                <BooleanTypeView
                                  parentValue={parent}
                                  startValue={item}
                                  endValue={childData.value}
                                  toChangeValue={childData.value}
                                  valueHandler={toggleSwitch}
                                />
                              );
                            } else {
                              return (
                                <TextTypeView
                                  startValue={item + ':  ' + childData.value}
                                  endIcon="right"
                                />
                              );
                            }
                          } else {
                            if (childData.to === 'reset') {
                              return (
                                <TextTypeView
                                  startValue={item}
                                  endValue="Edit"
                                  endIcon="right"
                                  onHandlePress={() => {
                                    Alert.alert(
                                      'Vaccify',
                                      'Are you sure you want to reset your app wallet?',
                                      [
                                        {
                                          text: 'Yes', onPress: () => {
                                            AsyncStorage.removeItem('wallet_secret');
                                            AsyncStorage.removeItem('wallet_name');
                                            AsyncStorage.removeItem('connection_credential');
                                            AsyncStorage.removeItem('connection_proof');
                                            AsyncStorage.removeItem('connections');
                                            AsyncStorage.removeItem('credentials');
                                            AsyncStorage.removeItem('isfirstTime').then((value) => {
                                              Alert.alert(
                                                'Vaccify',
                                                'Wallet Reset Successful, Please close the app!',
                                                [
                                                  { text: 'OK', onPress: () => { } }
                                                ],
                                                { cancelable: false }
                                              )
                                            })
                                          }
                                        },
                                        { text: 'No', onPress: () => { } }
                                      ],
                                      { cancelable: true }

                                    );
                                  }}
                                />
                              );
                            } else {

                              if (item != 'Logout' && item != "Edit Profile" && item != "Get ZADA ID") {
                                return (
                                  <TextTypeView
                                    startValue={item}
                                    endValue="Edit"
                                    endIcon="right"
                                    onHandlePress={() => {
                                      childData.to && Linking.openURL(childData.to);
                                    }}
                                  />
                                );
                              }
                              else {
                                return (
                                  <TextTypeView
                                    startValue={item}
                                    endValue="Edit"
                                    endIcon="right"
                                    onHandlePress={() => {
                                      item == 'Logout' ? onLogoutPressed() : item == 'Get ZADA ID' ? _onScanDocumentClick() : _onEditProfileClick()
                                    }}
                                  />
                                );
                              }
                            }
                          }
                        }
                      }}
                    />
                  </View>
                );
              }}
            />
            <View style={styles.footer}>
              <Text style={styles.footerText} >In Collaboration with&nbsp;
                <Text
                  style={{ color: PRIMARY_COLOR, }}
                  onPress={() => { Linking.openURL('https://trust.net.pk/') }}
                >
                  TrustNet Pakistan
                </Text>

              </Text>
            </View>
          </>
        ) : (
          <OverlayLoader
            text='Fetching Settings...'
          />
        )
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#f7f7f7',
  },
  parentItem: {
    flex: 1,
    margin: 5,
    marginTop: 20,
    backgroundColor: '#f7f7f7',
    fontSize: 15,
    color: '#6f6f6f',
  },
  childItem: {
    flex: 1,
    padding: 8,
    margin: 1,
    backgroundColor: '#ffffff',
    fontSize: 20,
    color: '#0f0f0f',
    borderRadius: 10,
  },
  headingContainer: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  backButton: {
    color: 'black',
    margin: 15,
    alignSelf: 'flex-start',
    marginRight: 60,
    padding: 10,
  },
  footer: {
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: 'black',
    padding: 10,
    fontSize: 14,
    margin: 10,
    fontFamily: 'Poppins-Regular',

  }
});
