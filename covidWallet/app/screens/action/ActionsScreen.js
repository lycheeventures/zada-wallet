import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  View,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import NetInfo from '@react-native-community/netinfo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { SwipeListView } from 'react-native-swipe-list-view';
import FlatCard from '../../components/FlatCard';
import TextComponent from '../../components/TextComponent';
import ActionDialog from '../../components/Dialogs/ActionDialog';
import HeadingComponent from '../../components/HeadingComponent';

import messaging from '@react-native-firebase/messaging';

import { themeStyles } from '../../theme/Styles';
import { BLACK_COLOR, RED_COLOR, SECONDARY_COLOR } from '../../theme/Colors';

import { getItem, saveItem } from '../../helpers/Storage';
import ConstantsList, { CONN_REQ, CRED_OFFER, VER_REQ } from '../../helpers/ConfigApp';

import { AuthenticateUser } from '../../helpers/Authenticate';
import { showMessage, showAskDialog, _showAlert } from '../../helpers/Toast';
import { biometricVerification } from '../../helpers/Biometric';
import { getActionHeader } from '../../helpers/ActionList';

import { accept_credential, delete_credential } from '../../gateways/credentials';
import { accept_connection, delete_connection } from '../../gateways/connections';
import { delete_verification, submit_verification } from '../../gateways/verifications';
import useNotification from '../../hooks/useNotification';
import OverlayLoader from '../../components/OverlayLoader';
import { analytics_log_action_screen } from '../../helpers/analytics';
import PincodeModal from '../../components/Modal/PincodeModal';
import { pincodeRegex } from '../../helpers/validation';
import ConfirmPincodeModal from '../../components/ConfirmPincodeModal';
import PullToRefresh from '../../components/PullToRefresh';
import EmptyList from '../../components/EmptyList';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchActions } from '../../store/actions/thunk';
import { selectConnections } from '../../store/connections/selectors';
import {
  selectActions,
  selectActionsStatus,
  selectCredentialActions,
  selectVerificationActions,
} from '../../store/actions/selectors';
import { changeActionStatus, deleteAction } from '../../store/actions';
import { fetchCredentials } from '../../store/credentials/thunk';
import { fetchConnections } from '../../store/connections/thunk';
import { selectCredentials } from '../../store/credentials/selectors';

const DIMENSIONS = Dimensions.get('screen');

function ActionsScreen({ navigation }) {
  //Constants
  const dispatch = useAppDispatch();

  // Selectors
  const actions = useAppSelector(selectActions.selectAll);
  const credentials = useAppSelector(selectCredentials.selectAll);
  const connections = useAppSelector(selectConnections.selectAll);
  const credentialActions = useAppSelector(selectCredentialActions);
  const verificationActions = useAppSelector(selectVerificationActions);
  const actionStatus = useAppSelector(selectActionsStatus);

  // States
  const [loaderText, setLoaderText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAction, setAction] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [actionsList, setActionsList] = useState([]);
  const [modalData, setModalData] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [Uid, storeUid] = useState();
  const [secret, storeSecret] = useState('');
  const [networkState, setNetworkState] = useState(false);
  const [deepLink, setDeepLink] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  // For Pincode
  const [isPincodeSet, setIsPincode] = useState(false);
  const [isPicodeChecked, setPincodeChecked] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [confirmPincode, setConfirmPincode] = useState('');
  const [confirmPincodeError, setConfirmPincodeError] = useState('');

  // Confirming pin
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [verifyPincode, setVerifyPincode] = useState('');
  const [verifyPincodeError, setVerifyPincodeError] = useState('');

  // Notification hook
  const { isZadaAuth, authData } = useNotification();

  var requestArray = [];

  // Setting right icon
  const headerOptions = {
    headerRight: () => (
      <MaterialCommunityIcons
        onPress={() => {
          navigation.navigate('QRScreen');
        }}
        style={styles.headerRightIcon}
        size={30}
        name="qrcode"
        padding={30}
      />
    ),
  };

  useLayoutEffect(() => {
    NetInfo.fetch().then((networkState) => {
      setNetworkState(networkState.isConnected);
    });
  }, []);

  useEffect(() => {
    if (!deepLink) getUrl();
  }, [deepLink]);

  useEffect(() => {
    if (isZadaAuth) {
      toggleModal(authData);
    }
  }, [isZadaAuth, authData]);

  useEffect(() => {
    // Setting listener for deeplink
    let deepEvent = undefined;
    if (!deepLink) {
      deepEvent = Linking.addEventListener('url', ({ url }) => {
        getUrl(url);
      });
    }
    return () => deepEvent && deepEvent;
  }, []);

  //Checking Notification Status
  useLayoutEffect(() => {
    const _checkPermission = async () => {
      const authorizationStatus = await messaging().hasPermission();
      if (authorizationStatus !== messaging.AuthorizationStatus.AUTHORIZED) {
        Alert.alert(
          'Zada Wallet',
          'Notifications are disabled. You will not be able to receive alerts for the actions. Pull down to refresh and receive the latest actions.',
          [
            {
              text: 'Okay',
              onPress: () => {},
              style: 'cancel',
            },
          ],
          {
            cancelable: true,
          }
        );
      }
    };
    _checkPermission();
    return;
  }, []);

  // // Update Actionlist if notificationReceived is true.
  // useEffect(() => {
  //   if (notificationReceived) {
  //     dispatch(fetchActions());
  //     // updateActionsList();
  //   }
  // }, [dispatch, notificationReceived]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     updateActionsList();
  //     return;
  //   }, [isAction])
  // );

  useFocusEffect(
    React.useCallback(() => {
      _sendActionScreenAnalytic();
    }, [])
  );

  React.useLayoutEffect(() => {
    navigation.dangerouslyGetParent().setOptions(headerOptions);
  }, [isAction, navigation]);

  const getUrl = async (url) => {
    let initialUrl = '';
    if (url != undefined) {
      initialUrl = url;
    } else {
      initialUrl = await Linking.getInitialURL();
    }
    if (initialUrl === null) {
      setDeepLink(true);
      return;
    } else {
      const parsed = initialUrl.split('/');
      var item = {};
      item['type'] = parsed[3];
      item['metadata'] = parsed[4];
      requestArray.push(item);
      const requestJson = JSON.parse(JSON.stringify(item));
      setDeepLink(true);

      navigation.navigate('QRScreen', {
        request: requestJson,
      });
    }

    if (initialUrl.includes('Details')) {
      Alert.alert(initialUrl);
    }
  };

  const toggleModal = (v) => {
    setSelectedItem(JSON.stringify(v));

    let data = JSON.parse(JSON.stringify(v));

    setModalData(data);
    setModalVisible(true);
  };

  const acceptModal = async (v) => {
    if (!isLoading) {
      if (v.type === CRED_OFFER) {
        setLoaderText(
          'Please wait! we are receiving your certificate this may take around ~10 seconds...'
        );
        handleCredentialRequest();
      } else if (v.type === VER_REQ) {
        setLoaderText(
          'Please wait! we are verifying your certificate this may take around ~10 seconds...'
        );
        handleVerificationRequests(v);
      } else if (v.type === CONN_REQ) {
        setLoaderText(
          'Please wait! we are creating a connection this may take around ~10 seconds...'
        );
        handleConnectionRequest(v);
      }
    }
  };

  // Checks is connection already exists or not using name
  const _isConnectionAlreadyExist = async () => {
    let selectedItemObj = JSON.parse(selectedItem);
    let find = false;

    for (let i = 0; i < connections.length; ++i) {
      if (
        connections[i].name.toLowerCase() ===
        selectedItemObj.organizationName.toLowerCase()
      )
        find = true;
    }

    // Delete connection action
    if (find) {
      dispatch(deleteAction(selectedItemObj.connectionId));
    }

    return find;
  };

  // Handle Connection Request
  const handleConnectionRequest = async () => {
    if (networkState) {
      setIsLoading(true);

      if (!(await _isConnectionAlreadyExist())) {
        // Connection is not exist
        let resp = await AuthenticateUser();

        if (resp.success) {
          let selectedItemObj = JSON.parse(selectedItem);

          let userID = await getItem(ConstantsList.USER_ID);
          let walletSecret = await getItem(ConstantsList.WALLET_SECRET);

          storeUid(userID);
          storeSecret(walletSecret);

          setModalVisible(false);

          try {
            // Accept connection Api call.
            let result = await accept_connection(selectedItemObj.metadata);

            if (result.data.success) {
              // Delete Action from redux
              let conn = actions.find(
                (x) => x.connectionId === selectedItemObj.connectionId
              );

              // Adding Connection
              dispatch(fetchConnections());

              // Deleting Action
              dispatch(deleteAction(conn.connectionId));

              setTimeout(() => {
                _showSuccessAlert('conn');
              }, 500);
            } else {
              showMessage('ZADA Wallet', result.data.error);
              return;
            }
            setIsLoading(false);
          } catch (e) {
            setIsLoading(false);
          }
        } else {
          showMessage('ZADA Wallet', resp.data.message);
          setIsLoading(false);
        }
      } else {
        // Connection is already exists
        setModalVisible(false);
        setIsLoading(false);
        showMessage('ZADA Wallet', 'Connection is already accepted');
      }
    } else {
      showMessage('ZADA Wallet', 'Internet Connection is not available');
    }
  };

  // Handle Certificate Request
  const handleCredentialRequest = async () => {
    let selectedItemObj = JSON.parse(selectedItem);
    try {
      setModalVisible(false);
      setIsLoading(true);

      // Find cred action for deletion.
      let credObj = credentialActions.find(
        (x) => x.credentialId === selectedItemObj.credentialId
      );

      // Check if crendential already exist
      let credArr = credentials.find(
        (x) => x.credentialId === selectedItemObj.credentialId
      );

      if (credArr === undefined) {
        if (credObj) {
          // Accept credentials Api call.
          let result = await accept_credential(selectedItemObj.credentialId);

          if (result.data.success) {
            // Delete Credential from list.
            dispatch(deleteAction(credObj.connectionId + credObj.credentialId));

            // Fetch credentials
            dispatch(fetchCredentials());

            setTimeout(() => {
              _showSuccessAlert('cred');
            }, 500);
          } else {
            showMessage('ZADA Wallet', 'Invalid Credential Offer');
          }
          setIsLoading(false);
        }
      } else {
        setModalVisible(false);
        setIsLoading(false);
        showMessage('ZADA Wallet', 'Credential offer is already accepted');
      }
    } catch (e) {
      showMessage('ZADA Wallet', e);
      setIsLoading(false);
    }
  };

  // Handle Verification Request
  const handleVerificationRequests = async (data) => {
    setDialogData(data);

    let selectedItemObj = JSON.parse(selectedItem);

    let checkbiometric = await biometricVerification();

    if (checkbiometric) {
      setModalVisible(false);
      setIsLoading(true);
      setLoaderText('Deleting...');

      // Find cred action for deletion.
      let credObj = verificationActions.find(
        (x) => x.verificationId === selectedItemObj.verificationId
      );

      // Delete Credential from list.
      dispatch(deleteAction(credObj.connectionId + credObj.verificationId));

      await accept_verification_request(selectedItemObj, data);

      setIsLoading(false);
      setLoaderText(null);
    } else {
      // Check Either pincode set or not
      if (isPincodeSet) {
        setModalVisible(false);
        setTimeout(() => {
          setShowConfirmModal(true);
        }, 100);
      }
    }
    setIsLoading(false);
    setLoaderText(null);
  };

  // put analytic for action screen
  const _sendActionScreenAnalytic = async () => {
    const value = await getItem('action_analytic');
    if (value != null && value != undefined) {
      analytics_log_action_screen();
      await getItem('action_analytic', '1');
    }
  };

  const accept_verification_request = async (selectedItemObj, data) => {
    try {
      let policyName = selectedItemObj.policy.attributes[0].policyName;

      // Submit Verification Api call
      let result = await submit_verification(
        selectedItemObj.verificationId,
        data.credentialId,
        policyName
      );

      if (result.data.success) {
        _showAlert('Zada Wallet', 'Verification request has been submitted successfully');
      } else {
        showMessage('Zada', result.data.error);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  // Reject Modal
  const rejectModal = async (v) => {
    let selectedItemObj = {};
    if (v.connectionId != undefined) {
      selectedItemObj = v;
    } else {
      selectedItemObj = JSON.parse(selectedItem);
    }
    setSelectedItem(JSON.stringify(v));

    setModalVisible(false);
    setIsLoading(true);
    setLoaderText('Deleting...');

    // Connection Action
    if (selectedItemObj.type === ConstantsList.CONN_REQ) {
      try {
        // Delete connection api call.
        await delete_connection(selectedItemObj.connectionId);

        // deleting Connection Request
        dispatch(deleteAction(selectedItemObj.connectionId));
      } catch (e) {
        console.log(e);
      }
    }

    // Credential Action
    if (selectedItemObj.type === ConstantsList.CRED_OFFER) {
      try {
        await delete_credential(selectedItemObj.credentialId);
        dispatch(
          deleteAction(selectedItemObj.connectionId + selectedItemObj.credentialId)
        );
      } catch (e) {
        console.log(e);
      }
    }

    // Verification Action
    if (selectedItemObj.type === ConstantsList.VER_REQ) {
      // Biometric Verification

      let checkbiometric = await biometricVerification();

      if (checkbiometric) {
        try {
          await delete_verification(selectedItemObj.verificationId);
          dispatch(
            deleteAction(selectedItemObj.connectionId + selectedItemObj.verificationId)
          );
        } catch (e) {
          console.log(e);
        }
      } else if (isPincodeSet) {
        setTimeout(() => {
          setShowConfirmModal(true);
        }, 100);
      }
    }
    setIsLoading(false);
    setLoaderText(null);
  };

  // Function that will show alert on acceptance of connection and credential
  const _showSuccessAlert = (action) => {
    let message = '';
    if (action == 'conn') message = 'Your connection is created successfully.';
    else if (action == 'cred') message = 'You have received a certificate successfully.';
    else if (action == 'ver')
      message = 'Your verification request is fulfilled successfully.';

    Alert.alert(
      'Zada Wallet',
      `${message}`,
      [
        {
          text: 'Okay',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const dismissModal = (v) => {
    setModalVisible(false);
    setModalVisible(false);
  };

  const onDeletePressed = (item) => {
    showAskDialog(
      'Are you sure?',
      'Are you sure you want to delete this request?',
      () => rejectModal(item),
      () => {}
    );
  };

  // Checking is Pincode set or not
  const _checkPinCode = async () => {
    try {
      const isPincode = await getItem(ConstantsList.PIN_CODE);
      if (isPincode != null && isPincode != undefined && isPincode.length != 0)
        setIsPincode(true);
      else setIsPincode(false);
    } catch (error) {
      setPincodeChecked(false);
      showMessage('Zada Wallet', error.toString());
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      _checkPinCode();
    }, [])
  );

  const _setPinCode = async () => {
    if (pincode.length == 0) {
      setPincodeError('Pincode is required.');
      return;
    }
    setPincodeError('');

    if (!pincodeRegex.test(pincode)) {
      setPincodeError('Pincode should contain only 6 digits.');
      return;
    }
    setPincodeError('');

    if (confirmPincode.length == 0) {
      setConfirmPincodeError('Confirm pincode is required.');
      return;
    }
    setConfirmPincodeError('');

    if (!pincodeRegex.test(confirmPincode)) {
      setConfirmPincodeError('Confirm pincode should contain only 6 digits.');
      return;
    }
    setConfirmPincodeError('');

    if (pincode != confirmPincode) {
      showMessage(
        'Zada Wallet',
        'Pincode and confirm pincode are not same. Please check them carefully'
      );
    }

    // Saving pincode in async
    try {
      await saveItem(ConstantsList.PIN_CODE, pincode.toString());

      setIsPincode(true);
      showMessage(
        'Zada Wallet',
        'Your pincode is set successfully. Please keep it safe and secure.'
      );
      setPincode('');
      setConfirmPincode('');
    } catch (error) {
      showMessage('Zada Wallet', error.toString());
    }
  };

  const _confirmingPincode = async () => {
    // Length check
    if (verifyPincode.length === 0) {
      setVerifyPincodeError('Pincode is required.');
      return;
    }

    // Regex
    if (!pincodeRegex.test(verifyPincode)) {
      setVerifyPincodeError('Pincode should contain only 6 digits.');
      return;
    }

    setVerifyPincodeError('');

    const code = await getItem(ConstantsList.PIN_CODE);
    if (verifyPincode === code) {
      setShowConfirmModal(false);
      setModalVisible(false);
      setIsLoading(true);

      let selectedItemObj = JSON.parse(selectedItem);
      if (dialogData == null) {
        if (!isLoading) {
          setLoaderText('Deleting...');

          // Deleting Verification
          await delete_verification(selectedItemObj.verificationId);

          _showAlert('Zada Wallet', 'Verification request has been rejected!');

          // Deleting Verification from action list
          dispatch(
            deleteAction(selectedItemObj.connectionId + selectedItemObj.verificationId)
          );
        }
      } else {
        setLoaderText('Submitting...');

        // Accept verification
        await accept_verification_request(selectedItemObj, dialogData);

        // Delete Credential from action list.
        dispatch(
          deleteAction(selectedItemObj.connectionId + selectedItemObj.verificationId)
        );
      }
    } else {
      showMessage(
        'Zada Wallet',
        'You entered incorrect pincode. Please check your pincode and try again'
      );
    }
    setDialogData(null);
    setIsLoading(false);
    setLoaderText(null);
  };

  const refreshHandler = () => {
    dispatch(fetchActions());
  };

  return (
    <View style={themeStyles.mainContainer}>
      {/* <ConfirmPincodeModal
        isVisible={showConfirmModal}
        pincode={verifyPincode}
        pincodeError={verifyPincodeError}
        onPincodeChange={(text) => {
          setVerifyPincode(text);
          if (text.length == 0 || text == undefined) setVerifyPincodeError('');
        }}
        onCloseClick={() => {
          setShowConfirmModal(!showConfirmModal);
        }}
        onContinueClick={_confirmingPincode}
      /> */}

      <PincodeModal
        modalType={'verify'}
        isVisible={showConfirmModal}
        pincode={verifyPincode}
        onPincodeChange={(text) => {
          setVerifyPincode(text);
          if (text.length === 0 || text === undefined) {
            setVerifyPincodeError('');
          }
        }}
        pincodeError={verifyPincodeError}
        onCloseClick={() => {
          setShowConfirmModal(!showConfirmModal);
        }}
        onContinueClick={_confirmingPincode}
      />

      {/* PinCode Modal */}
      {isPicodeChecked && (
        <PincodeModal
          isVisible={!isPincodeSet}
          pincode={pincode}
          onPincodeChange={(text) => {
            setPincode(text);
            if (text.length == 0) setPincodeError('');
          }}
          pincodeError={pincodeError}
          confirmPincode={confirmPincode}
          onConfirmPincodeChange={(text) => {
            setConfirmPincode(text);
            if (text.length == 0) setConfirmPincodeError('');
          }}
          confirmPincodeError={confirmPincodeError}
          onCloseClick={() => {
            setIsPincode(true);
          }}
          onContinueClick={_setPinCode}
        />
      )}

      <PullToRefresh isLoading={isLoading} />

      <HeadingComponent text="Actions" />

      {isLoading ? <OverlayLoader text={loaderText} /> : null}

      {actions.length > 0 ? (
        <View pointerEvents={isLoading ? 'none' : 'auto'}>
          {isModalVisible && (
            <ActionDialog
              isVisible={isModalVisible}
              toggleModal={toggleModal}
              rejectModal={rejectModal}
              data={modalData}
              dismissModal={dismissModal}
              acceptModal={acceptModal}
              modalType="action"
              isIconVisible={true}
            />
          )}
          <SwipeListView
            refreshControl={
              <RefreshControl
                tintColor={'#7e7e7e'}
                refreshing={actionStatus === 'loading'}
                onRefresh={refreshHandler}
              />
            }
            useFlatList
            disableRightSwipe
            data={actions}
            style={{
              flexGrow: 1,
            }}
            contentContainerStyle={{
              width: '100%',
              paddingBottom: 100,
            }}
            keyExtractor={(rowData, index) => {
              return index;
            }}
            // ListEmptyComponent={emptyListComponent}
            renderItem={(rowData, rowMap) => {
              let header = getActionHeader(rowData.item.type);

              let subtitle =
                'Click to view the ' +
                header.toLowerCase() +
                ' from ' +
                rowData.item.organizationName;
              let imgURI = rowData.item.imageUrl;
              return (
                <FlatCard
                  onPress={() => toggleModal(rowData.item)}
                  imageURL={imgURI}
                  heading={header}
                  text={subtitle}
                />
              );
            }}
            renderHiddenItem={({ item, index }) => (
              <View key={index} style={styles.rowBack}>
                <TextComponent text="" />
                <Animated.View>
                  <TouchableOpacity
                    onPress={() => onDeletePressed(item)}
                    activeOpacity={0.8}
                    style={[styles.swipeableViewStyle]}>
                    <MaterialCommunityIcons
                      size={30}
                      name="delete"
                      padding={30}
                      color={RED_COLOR}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}
            leftOpenValue={75}
            rightOpenValue={-75}
          />
        </View>
      ) : (
        <EmptyList
          refreshing={actionStatus === 'loading'}
          onRefresh={refreshHandler}
          text="There are no actions to complete, Please scan a QR code to either get a digital certificate or to prove it."
          image={require('../../assets/images/action.png')}
          onPress={() => {
            navigation.navigate('QRScreen');
          }}
          screen="actions"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRightIcon: {
    padding: 10,
    color: BLACK_COLOR,
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  swipeableViewStyle: {
    width: 60,
    height: 60,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    shadowColor: SECONDARY_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5,
    flexDirection: 'row',
    marginBottom: 8,
  },
});

export default ActionsScreen;
