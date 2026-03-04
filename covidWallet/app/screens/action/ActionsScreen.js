import React, { useEffect, useCallback, useLayoutEffect, useState, useRef } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { SwipeListView } from 'react-native-swipe-list-view';
import FlatCard from '../../components/FlatCard';
import TextComponent from '../../components/TextComponent';
import ActionDialog from '../../components/Dialogs/ActionDialog';

import messaging from '@react-native-firebase/messaging';

import { themeStyles } from '../../theme/Styles';
import { BLACK_COLOR, RED_COLOR, SECONDARY_COLOR } from '../../theme/Colors';

import { getItem, saveItem } from '../../helpers/Storage';
import ConstantsList, {
  CONN_REQ,
  CRED_OFFER,
  VER_REQ,
  CONNLESS_VER_REQ,
} from '../../helpers/ConfigApp';

import { showMessage, showAskDialog, _showAlert } from '../../helpers/Toast';
import { getActionHeader } from '../../helpers/ActionList';

import { accept_credential, delete_credential } from '../../gateways/credentials';
import { accept_connection, delete_connection } from '../../gateways/connections';
import { delete_verification, submit_verification } from '../../gateways/verifications';
import useNotification from '../../hooks/useNotification';
import OverlayLoader from '../../components/OverlayLoader';
import { analytics_log_action_screen } from '../../helpers/analytics';
import PincodeModal from '../../components/Modal/PincodeModal';
import BiometricModal from '../../components/Modal/BiometricModal';
import { pincodeRegex } from '../../helpers/validation';
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
import { deleteAction } from '../../store/actions';
import { fetchAcceptConnectionList } from '../../store/connections/thunk';
import { selectCredentials } from '../../store/credentials/selectors';
import { selectNetworkStatus } from '../../store/app/selectors';
import { fetchCredentials } from '../../store/credentials/thunk';
import AppCustomAlert, { AlertType } from '../../components/Alert/AppCustomAlert';
import { IActionObject } from '../../store/actions/interface';

function ActionsScreen({ navigation }) {
  //Constants
  const dispatch = useAppDispatch();
  const { width, height } = Dimensions.get('window');

  // Selectors
  const { t } = useTranslation();
  const actions = useAppSelector(selectActions.selectAll);
  const actionEntities = useAppSelector(selectActions.selectEntities);
  const credentials = useAppSelector(selectCredentials.selectAll);
  const connections = useAppSelector(selectConnections.selectAll);
  const credentialActions = useAppSelector(selectCredentialActions);
  const verificationActions = useAppSelector(selectVerificationActions);
  const actionStatus = useAppSelector(selectActionsStatus);
  const networkStatus = useAppSelector(selectNetworkStatus);

  // States
  const [loaderText, setLoaderText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  //const [deepLink, setDeepLink] = useState(false);
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

  // Deep link guard (prevents double navigation)
  const deepLinkHandledRef = useRef(false);

  // show reject or delete action
  const [selectedAction, setSelectedAction] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Notification hook
  useNotification();

  // Deep Link handling
  useEffect(() => {
    const handleIncomingUrl = async incomingUrl => {
      if (deepLinkHandledRef.current) return;

      const url = incomingUrl ?? (await Linking.getInitialURL());

      if (!url) return;

      deepLinkHandledRef.current = true;
      handleDeepLink(url);
    };

    handleIncomingUrl();

    // Background / foreground
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleIncomingUrl(url);
      deepLinkHandledRef.current = false;
    });

    return () => subscription.remove();
  }, []);

  // fetch actions data
  useFocusEffect(
    useCallback(() => {
      if (networkStatus !== 'connected') {
        _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
        return;
      }
      if (actionStatus === 'initial') {
        dispatch(fetchActions());
      }
    }, [actionStatus, networkStatus])
  );

  // Pull to refresh
  const refreshHandler = () => {
    if (networkStatus !== 'connected') {
      _showAlert(t('errors.no_internet_title'), t('errors.no_internet_message'));
      return;
    }
    dispatch(fetchActions());
  };

  //Checking Notification Status
  useLayoutEffect(() => {
    const _checkPermission = async () => {
      const authorizationStatus = await messaging().hasPermission();
      if (authorizationStatus !== messaging.AuthorizationStatus.AUTHORIZED) {
        let message = t('ActionsScreen.notification_alert_message');
        Alert.alert(
          'Zada Wallet',
          message,
          [
            {
              text: t('common.confirm'),
              onPress: () => {},
              style: t('common.cancel'),
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

  useFocusEffect(
    React.useCallback(() => {
      _sendActionScreenAnalytic();
    }, [])
  );

  const handleDeepLink = url => {
    try {
      console.log('Deep link:', url);

      let item = {};

      if (url.includes('?data=')) {
        item.type = url.split('?data=')[0];
        item.data = url.split('?data=')[1];
      } else {
        const parsed = url.split('/');
        item.type = parsed[3];
        item.metadata = parsed[4];
      }

      const requestType = item.type.includes('/') ? item.type.split('/').pop() : item.type;

      if (requestType === CONNLESS_VER_REQ) {
        navigation.navigate('VerificationRequestScreen', {
          data: {
            scanData: JSON.stringify(item),
          },
        });
      } else {
        _showAlert('Zada Wallet', 'Invalid URL');
      }
    } catch (e) {
      _showAlert('Zada Wallet', 'Failed to handle deep link');
    }
  };

  const toggleModal = v => {
    setSelectedItem(JSON.stringify(v));

    let data = JSON.parse(JSON.stringify(v));

    // check connection base verification
    if (data.type === VER_REQ) {
      navigation.navigate('ConnectionBaseVerificationScreen', data);
      return;
    }

    setModalData(data);
    setModalVisible(true);
  };

  const acceptModal = async v => {
    if (!isLoading) {
      if (v.type === CRED_OFFER) {
        setLoaderText(t('messages.receiving_certificate'));
        handleCredentialRequest();
      } else if (v.type === VER_REQ) {
        setLoaderText(t('messages.verifying_certificate'));
        handleVerificationRequests(v);
      } else if (v.type === CONN_REQ) {
        setLoaderText(t('messages.creating_connection'));
        handleConnectionRequest(v);
      }
    }
  };

  // Checks is connection already exists or not using name
  const _isConnectionAlreadyExist = async () => {
    let selectedItemObj = JSON.parse(selectedItem);
    let find = false;

    for (let i = 0; i < connections.length; ++i) {
      if (connections[i].name.toLowerCase() === selectedItemObj.organizationName.toLowerCase())
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
    if (networkStatus === 'connected') {
      setIsLoading(true);

      if (!(await _isConnectionAlreadyExist())) {
        // Connection do not exist
        setModalVisible(false);
        let selectedItemObj = JSON.parse(selectedItem);

        try {
          // Accept connection Api call.
          let result = await accept_connection(selectedItemObj.metadata);

          if (result.data.success) {
            // Delete Action from redux
            let conn = actions.find(x => x.connectionId === selectedItemObj.connectionId);

            // Adding Connection
            dispatch(fetchAcceptConnectionList());

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
        // Connection is already exists
        setModalVisible(false);
        setIsLoading(false);
        showMessage('ZADA Wallet', t('errors.accept_connection'));
      }
    } else {
      showMessage('ZADA Wallet', t('errors.invalid_internet'));
    }
  };

  // Handle Certificate Request
  const handleCredentialRequest = async () => {
    let selectedItemObj = JSON.parse(selectedItem);
    try {
      setModalVisible(false);
      setIsLoading(true);

      // Find cred action for deletion.
      let credObj = credentialActions.find(x => x.credentialId === selectedItemObj.credentialId);

      // Check if crendential already exist
      let credArr = credentials.find(x => x.credentialId === selectedItemObj.credentialId);

      if (credArr === undefined) {
        if (credObj) {
          // Accept credentials Api call.
          let result = await accept_credential(selectedItemObj.credentialId);

          if (result.data.success) {
            // Delete Credential from list.
            dispatch(deleteAction(credObj.connectionId + credObj.credentialId));

            setTimeout(() => {
              _showSuccessAlert('cred');
              dispatch(fetchCredentials());
            }, 500);
          } else {
            showMessage('ZADA Wallet', t('errors.invalid_credential_offer'));
          }
          setIsLoading(false);
        }
      } else {
        setModalVisible(false);
        setIsLoading(false);
        showMessage('ZADA Wallet', t('errors.accept_credential_offer'));
      }
    } catch (e) {
      setModalVisible(false);
      setIsLoading(false);
    }
  };

  const onBiometricSuccess = async () => {
    setIsLoading(true);
    setShowConfirmModal(false);
    try {
      let selectedItemObj = JSON.parse(selectedItem);

      let credObj = verificationActions.find(
        x => x.verificationId === selectedItemObj.verificationId
      );
      if (dialogData == null) {
        if (!isLoading) {
          setLoaderText(t('messages.deleting'));

          // Deleting Verification from action list
          dispatch(deleteAction(selectedItemObj.connectionId + selectedItemObj.verificationId));

          // Deleting Verification
          await delete_verification(selectedItemObj.verificationId);

          _showAlert('Zada Wallet', t('errors.verification_request'));
        }
      } else {
        setLoaderText(t('messages.submitting'));

        // Accept verification
        await accept_verification_request(selectedItemObj, dialogData);

        // Delete Credential from list.
        dispatch(deleteAction(credObj.connectionId + credObj.verificationId));
      }
    } catch (err) {
      console.log({ err });
      _showAlert('Error: ', 'Something unexpected happened, please try again.');
    } finally {
      setIsLoading(false);
      setLoaderText(null);
    }
  };

  // Handle Verification Request
  const handleVerificationRequests = async data => {
    setDialogData(data);
    setModalVisible(false);
    setTimeout(() => {
      setShowConfirmModal(true);
    }, 500);
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
      let policyName = selectedItemObj.policy.name;
      // Submit Verification Api call
      let result = await submit_verification(
        selectedItemObj.verificationId,
        data.credentialId,
        policyName
      );

      if (result.data.success) {
        _showAlert('Zada Wallet', t('messages.success_verification_request_submit'));
      } else {
        showMessage('Zada', result.data.error);
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  // Reject Modal
  const rejectModal = async v => {
    let selectedItemObj = {};
    if (v.connectionId != undefined) {
      selectedItemObj = v;
    } else {
      selectedItemObj = JSON.parse(selectedItem);
    }
    setSelectedItem(JSON.stringify(v));

    setModalVisible(false);
    setIsLoading(true);
    setLoaderText(t('messages.deleting'));

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
        await delete_credential(selectedItemObj.credentialId, selectedItemObj.correlationId);
        dispatch(deleteAction(selectedItemObj.connectionId + selectedItemObj.credentialId));
      } catch (e) {
        console.log(e);
      }
    }

    // Verification Action
    if (selectedItemObj.type === ConstantsList.VER_REQ) {
      // Biometric Verification
      setDialogData(null);
      setTimeout(() => {
        setShowConfirmModal(true);
      }, 500);
    }
    setIsLoading(false);
    setLoaderText(null);
  };

  // Function that will show alert on acceptance of connection and credential
  const _showSuccessAlert = action => {
    let message = '';
    if (action == 'conn') message = t('messages.success_connection');
    else if (action == 'cred') message = t('messages.success_certificate');
    else if (action == 'ver') message = t('messages.success_verification_request');

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

  const dismissModal = v => {
    setModalVisible(false);
    setModalVisible(false);
  };

  const onDeletePressed = item => {
    // showAskDialog(
    //   'Are you sure?',
    //   t('messages.delete_request'),
    //   () => rejectModal(item),
    //   () => {}
    // );
    setSelectedAction(item);
    setShowDeleteAlert(true);
  };

  // Checking is Pincode set or not
  const _checkPinCode = async () => {
    try {
      const isPincode = await getItem(ConstantsList.PIN_CODE);
      if (isPincode != null && isPincode != undefined && isPincode.length != 0) setIsPincode(true);
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
      setPincodeError(t('errors.required_pincode'));
      return;
    }
    setPincodeError('');

    if (!pincodeRegex.test(pincode)) {
      setPincodeError(t('errors.length_pincode', { max: 6 }));
      return;
    }
    setPincodeError('');

    if (confirmPincode.length == 0) {
      setConfirmPincodeError(t('errors.required_confirm_pincode'));
      return;
    }
    setConfirmPincodeError('');

    if (!pincodeRegex.test(confirmPincode)) {
      setConfirmPincodeError(t('errors.length_confirm_pincode', { max: 6 }));
      return;
    }
    setConfirmPincodeError('');

    if (pincode != confirmPincode) {
      showMessage('Zada Wallet', t('errors.pincode_confirm_not_match'));
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

  return (
    <View style={themeStyles.mainContainer}>
      {showConfirmModal && (
        <BiometricModal
          oneTimeAuthentication={true}
          isVisible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          onSuccess={onBiometricSuccess}
        />
      )}

      {/* PinCode Modal */}
      {isPicodeChecked && (
        <PincodeModal
          isVisible={!isPincodeSet}
          pincode={pincode}
          onPincodeChange={text => {
            setPincode(text);
            if (text.length == 0) setPincodeError('');
          }}
          pincodeError={pincodeError}
          confirmPincode={confirmPincode}
          onConfirmPincodeChange={text => {
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
              height: height * 0.7,
            }}
            contentContainerStyle={{
              width: '100%',
              paddingBottom: 100,
            }}
            keyExtractor={(rowData, index) => {
              return Object.keys(actionEntities)[index];
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
                    <MaterialCommunityIcons size={30} name="delete" color={RED_COLOR} />
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
          text={t('ActionsScreen.empty_list_text')}
          image={require('../../assets/images/action.png')}
          onPress={() => {
            navigation.navigate('NewQRScreen');
          }}
          screen="actions"
        />
      )}

      <AppCustomAlert
        isVisible={showDeleteAlert}
        title={t('messages.delete_action_title')}
        message={t('messages.delete_request')}
        cancelText={t('common.cancel')}
        confirmText={t('common.confirm')}
        type={AlertType.DANGER}
        onConfirm={() => {
          if (selectedAction != null) {
            rejectModal(selectedAction);
          }
          setShowDeleteAlert(false);
        }}
        onCancel={() => {
          setShowDeleteAlert(false);
        }}
      />
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
