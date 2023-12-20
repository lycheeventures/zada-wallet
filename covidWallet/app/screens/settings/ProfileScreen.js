import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { InputComponent } from '../../components/Input/inputComponent';
import OverlayLoader from '../../components/OverlayLoader';
import { _fetchProfileAPI, _updateProfileAPI } from '../../gateways/auth';
import { showAskDialog, showMessage, _showAlert } from '../../helpers/Toast';
import {
  emailRegex,
  nameRegex,
  pincodeRegex,
  validateLength,
  validatePasswordStrength,
} from '../../helpers/validation';
import { AppColors, BLACK_COLOR, SECONDARY_COLOR, WHITE_COLOR } from '../../theme/Colors';
import { getItem, saveItem } from '../../helpers/Storage';
import ConstantsList from '../../helpers/ConfigApp';
import SimpleButton from '../../components/Buttons/SimpleButton';
import EmailWarning from '../../components/EmailWarning';
import PincodeModal from '../../components/Modal/PincodeModal';
import { _handleAxiosError } from '../../helpers/AxiosResponse';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

const ProfileScreen = (props) => {
  // Selectors 
  const { t } = useTranslation();

  const { initDeleteAccount } = props.route.params;
  const [isLoading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [disableName, setDisableName] = useState(true);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailWarning, setEmailWarning] = useState(false);
  const [disableEmail, setDisableEmail] = useState(true);

  const [phone, setPhone] = useState('');

  const [isCurrPassSecure, setCurrPassSecure] = useState(true);
  const [currPassword, setCurrPassword] = useState('');
  const [currPasswordError, setCurrPasswordError] = useState('');
  const [isRePassSecure, setRePassSecure] = useState(true);
  const [rePassword, setRePassword] = useState('');
  const [rePasswordError, setRePasswordError] = useState('');

  const [isNewPassSecure, setNewPassSecure] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  // For Pincode
  const [showPincodeModal, setShowPinCodeModal] = useState(false);
  const [isPincodeSet, setIsPincode] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [confirmPincode, setConfirmPincode] = useState('');
  const [confirmPincodeError, setConfirmPincodeError] = useState('');

  const [oldPincode, setOldPincode] = useState('');
  const [oldPincodeError, setOldPincodeError] = useState('');
  const [newPincode, setNewpincode] = useState('');
  const [newPincodeError, setNewPincodeError] = useState('');
  const [oldpincodeSecurity, setOldPincodeSecurity] = useState(true);
  const [newPincodeSecurity, setNewPincodeSecurity] = useState(true);
  const [rePincode, setRepincode] = useState('');
  const [rePincodeError, setRePincodeError] = useState('');
  const [rePincodeSecurity, setRePincodeSecurity] = useState(true);
  const [newStrengthMessage, setNewStrengthMessage] = useState(undefined);
  const [reStrengthMessage, setReStrengthMessage] = useState(undefined);

  // KEYBOARD AVOIDING VIEW
  const keyboardVerticalOffset = Platform.OS == 'ios' ? 100 : 0;
  const keyboardBehaviour = Platform.OS == 'ios' ? 'padding' : null;

  // Toggle pincode eye icon
  const _toggleOldPincodeSecurity = () => {
    setOldPincodeSecurity(!oldpincodeSecurity);
  };

  // Toggle Confirm pincode eye icon
  const _toggleNewPincodeSecurity = () => {
    setNewPincodeSecurity(!newPincodeSecurity);
  };

  // toggle current password security
  const _toggleCurrPassSecurity = () => {
    setCurrPassSecure(!isCurrPassSecure);
  };

  // toggle new password security
  const _toggleNewPassSecurity = () => {
    setNewPassSecure(!isNewPassSecure);
  };

  // toggle new re password security
  const _toggleRePassSecurity = () => {
    setRePassSecure(!isRePassSecure);
  };

  // toggle new re password security
  const _toggleRePincodeSecurity = () => {
    setRePincodeSecurity(!rePincodeSecurity);
  };

  // Saving Name
  const _onNameSave = async () => {
    if (!nameRegex.test(name)) {
      setNameError(
        t('errors.length_name', { min: 2, max: 1000 })
      );
      return;
    }
    setNameError('');

    // call update profile api for name
    try {
      setLoading(true);

      let data = {
        name: name.trim().toString(),
      };

      const result = await _updateProfileAPI(data);
      if (result.data.success) {
        _showAlert('Zada Wallet', t('success.updated_profile'));
        setDisableName(true);
      } else {
        _showAlert('Zada Wallet', result.data.error);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      _handleAxiosError(error);
    }
  };

  //Saving Email
  const _onEmailSave = async () => {
    // Check if email is valid
    if (!emailRegex.test(email)) {
      setEmailError(t('errors.invalid_email'));
      return;
    }
    setEmailError('');

    // call api to update email
    try {
      setLoading(true);
      setEmailWarning(false);

      let data = {
        email: email.toLowerCase().trim().toString(),
      };

      const result = await _updateProfileAPI(data);
      if (result.data.success) {
        _showAlert('Zada Wallet', t('success.updated_profile'));
        setDisableEmail(true);
      } else {
        _showAlert('Zada Wallet', result.data.error);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      _handleAxiosError(error);
    }
  };

  // Fetching user profile
  const _fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const result = await _fetchProfileAPI();
      if (result.data.success) {
        await saveItem(ConstantsList.USER_PROFILE, JSON.stringify(result.data.user));
        setName(result.data.user.name);
        setEmail(result.data.user.email);
        setPhone(result.data.user.phone ?? '');
      } else {
        _showAlert('Zada Wallet', result.data.error.toString());
      }
      setProfileLoading(false);
    } catch (error) {
      setProfileLoading(false);
      _handleAxiosError(error);
    }
  };

  // Function to update user password
  const _onUpdatePasswordClick = async () => {
    if (currPassword == '') {
      setCurrPasswordError(t('errors.required_current_password'));
      return;
    }

    if (validateLength(currPassword, 1, 50)) {
      setCurrPasswordError(t('errors.length_current_password', { min: 1, max: 50 }));
      return;
    }
    setCurrPasswordError('');

    if (newPassword == '') {
      setNewPasswordError(t('errors.required_new_password'));
      return;
    }

    if (validateLength(newPassword, 6, 30)) {
      setNewPasswordError(t('errors.length_new_password', { min: 6, max: 30 }));
      return;
    }

    setNewPasswordError('');

    if (rePassword == '') {
      setRePasswordError(t('errors.required_confirm_password'));
      return;
    }

    if (validateLength(rePassword, 6, 30)) {
      setRePasswordError(t('errors.length_confirm_password', { min: 6, max: 30 }));
      return;
    }

    setRePasswordError('');

    if (newPassword != rePassword) {
      showMessage('Zada Wallet', t('errors.password_not_match'));
      return;
    }

    // call api to update password
    try {
      setLoading(true);

      let data = {
        oldSecretPhrase: currPassword.trim(),
        newSecretPhrase: newPassword.trim(),
      };

      const result = await _updateProfileAPI(data);
      if (result.data.success) {
        await saveItem(ConstantsList.WALLET_SECRET, newPassword.trim());
        _showAlert('Zada Wallet', t('success.updated_password'));
        setCurrPassword('');
        setNewPassword('');
        setRePassword('');
      } else {
        _showAlert('Zada Wallet', result.data.error);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      _handleAxiosError(error);
    }
  };

  // Effect to fetch user profile
  useEffect(() => {
    _fetchProfile();
  }, []);

  // Checking is Pincode set or not
  const _checkPinCode = async () => {
    try {
      const isPincode = await getItem(ConstantsList.PIN_CODE);
      if (isPincode != null && isPincode != undefined && isPincode.length != 0) setIsPincode(true);
      else setIsPincode(false);
    } catch (error) {
      showMessage('Zada Wallet', error.toString());
    }
  };

  React.useLayoutEffect(() => {
    _checkPinCode();
  }, []);

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
      showMessage(
        'Zada Wallet',
        t('errors.pincode_confirm_not_match')
      );
    }

    // Saving pincode in async
    try {
      await saveItem(ConstantsList.PIN_CODE, pincode);

      setIsPincode(true);
      setShowPinCodeModal(false);
      showMessage(
        'Zada Wallet',
        t('PincodeScreen.alert_message')
      );
      setPincode('');
      setConfirmPincode('');
    } catch (error) {
      showMessage('Zada Wallet', error.toString());
    }
  };

  const _updatePincode = async () => {
    if (oldPincode.length == 0) {
      setOldPincodeError(t('errors.required_old_pincode'));
      return;
    }
    setOldPincodeError('');

    if (!pincodeRegex.test(oldPincode)) {
      setOldPincodeError(t('errors.length_old_pincode', { max: 6 }));
      return;
    }
    setOldPincodeError('');

    if (newPincode.length == 0) {
      setNewPincodeError(setOldPincodeError(t('errors.required_new_pincode')));
      return;
    }
    setNewPincodeError('');

    if (!pincodeRegex.test(newPincode)) {
      setNewPincodeError(t('errors.length_new_pincode', { max: 6 }));
      return;
    }
    setNewPincodeError('');

    if (rePincode.length == 0) {
      setRePincodeError(t('errors.required_confirm_pincode'));
      return;
    }
    setRePincodeError('');

    if (!pincodeRegex.test(rePincode)) {
      setRePincodeError(t('errors.length_confirm_pincode', { max: 6 }));
      return;
    }
    setRePincodeError('');

    if (newPincode != rePincode) {
      showMessage('Zada Wallet', t('errors.new_pincode_confirm_not_match'));
      return;
    }

    // Updating Pincode
    try {
      const code = await getItem(ConstantsList.PIN_CODE);
      if (code == oldPincode) {
        await saveItem(ConstantsList.PIN_CODE, newPincode);
        showMessage('Zada Wallet', t('success.updated_pincode'));
        setOldPincode('');
        setNewpincode('');
        setRepincode('');
      } else {
        showMessage('Zada Wallet', t('errors.invalid_old_pincode'));
      }
    } catch (error) {
      showMessage('Zada Wallet', error.toString());
    }
  };

  const deleteAccount = () => {
    // Check if email exist.
    if (!emailRegex.test(email)) {
      _showAlert(
        'Zada Wallet',
        t('errors.required_account_deletion')
      );
      return;
    }

    // Show dialog to confirm account deletion.
    showAskDialog(
      'Are you sure?',
      t('message.delete_account'),
      () => initDeleteAccount(),
      () => { },
      'Delete',
      'destructive',
      'Cancel',
      'default'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={keyboardBehaviour}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={styles._mainContainer}>
      {/* PinCode Modal */}
      {showPincodeModal && (
        <PincodeModal
          isVisible={showPincodeModal}
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
            setShowPinCodeModal(!showPincodeModal);
          }}
          onContinueClick={_setPinCode}
        />
      )}

      {isLoading && <OverlayLoader text={t('messages.updating_profile')} />}

      {profileLoading && <OverlayLoader text={t('messages.fetching_profile')} />}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles._scrollContainer}>
        {/* General Items */}
        <Text style={styles._parent}>{t('ProfileScreen.general')}</Text>

        {/* Name */}
        <View style={styles._itemContainer}>
          <Text style={styles._itemLabel}>{t('ProfileScreen.full_name')}</Text>
          <View style={styles._row}>
            <View style={{ width: '85%' }}>
              <InputComponent
                height={45}
                placeholderText={t('ProfileScreen.full_name')}
                errorMessage={nameError}
                value={name}
                isSecureText={false}
                inputContainerStyle={styles._inputView}
                setStateValue={(text) => {
                  setName(text);
                }}
                disabled={disableName}
              />
            </View>

            <Text
              onPress={() => {
                disableName ? setDisableName(!disableName) : _onNameSave();
              }}
              style={styles._editText}>
              {disableName ? 'Edit' : 'Save'}
            </Text>
          </View>
        </View>

        {/* Email */}
        <View style={styles._itemContainer}>
          <Text style={styles._itemLabel}>{t('ProfileScreen.email')}</Text>
          <View style={styles._row}>
            <View style={{ width: '85%' }}>
              <InputComponent
                height={45}
                placeholderText={t('ProfileScreen.email')}
                errorMessage={emailError}
                value={email}
                isSecureText={false}
                inputContainerStyle={styles._inputView}
                setStateValue={(text) => {
                  setEmail(text);
                  let domain = text.split('@');
                  if (domain.length == 2) {
                    let domainName = domain[1].toLowerCase();

                    if (
                      domainName !== 'gmail.com' &&
                      domainName !== 'yahoo.com' &&
                      domainName !== 'outlook.com'
                    ) {
                      setEmailWarning(true);
                      return;
                    }

                    setEmailWarning(false);
                    return;
                  } else setEmailWarning(false);
                }}
                disabled={disableEmail}
              />
              {emailWarning && (
                <EmailWarning
                  style={{
                    marginLeft: 12,
                    marginRight: 12,
                    marginTop: 5,
                  }}
                />
              )}
            </View>

            <Text
              onPress={() => {
                disableEmail ? setDisableEmail(!disableEmail) : _onEmailSave();
              }}
              style={styles._editText}>
              {disableEmail ? 'Edit' : 'Save'}
            </Text>
          </View>
        </View>

        <View style={styles._itemContainer}>
          <Text style={styles._itemLabel}>{t('ProfileScreen.phone_number')}</Text>
          <View style={styles._row}>
            <View style={{ width: '100%' }}>
              <InputComponent
                height={45}
                placeholderText="Phone Number"
                errorMessage={''}
                value={phone}
                isSecureText={false}
                inputContainerStyle={styles._inputView}
                setStateValue={(text) => { }}
                disabled={true}
              />
            </View>
          </View>
        </View>

        {/* Change Password */}
        <Text style={styles._parent}>{t('ProfileScreen.change_password')}</Text>

        {/* Current Password */}
        <View style={styles._itemContainer}>
          <View style={{ width: '100%' }}>
            <InputComponent
              height={45}
              type={'secret'}
              toggleSecureEntry={_toggleCurrPassSecurity}
              placeholderText={t('ProfileScreen.current_password')}
              errorMessage={currPasswordError}
              value={currPassword}
              keyboardType="default"
              isSecureText={isCurrPassSecure}
              autoCapitalize={'none'}
              inputContainerStyle={styles._inputView}
              setStateValue={(text) => {
                setCurrPassword(text.replace(',', ''));
              }}
            />
          </View>
        </View>

        {/* New Password */}
        <View style={styles._itemContainer}>
          <View style={{ width: '100%' }}>
            <InputComponent
              height={45}
              type={'secret'}
              toggleSecureEntry={_toggleNewPassSecurity}
              placeholderText={t('ProfileScreen.new_password')}
              errorMessage={newPasswordError}
              value={newPassword}
              strengthMessage={newStrengthMessage}
              keyboardType="default"
              isSecureText={isNewPassSecure}
              autoCapitalize={'none'}
              inputContainerStyle={styles._inputView}
              setStateValue={(text) => {
                setNewPassword(text.replace(',', ''));

                if (text.length > 1) {
                  const msg = validatePasswordStrength(text);
                  setNewStrengthMessage(msg);
                } else {
                  setNewStrengthMessage(null);
                }
              }}
            />
          </View>
        </View>

        {/* Re Enter New Password */}
        <View style={styles._itemContainer}>
          <View style={{ width: '100%' }}>
            <InputComponent
              height={45}
              type={'secret'}
              toggleSecureEntry={_toggleRePassSecurity}
              placeholderText={t('ProfileScreen.re_enter_new_password')}
              errorMessage={rePasswordError}
              value={rePassword}
              strengthMessage={reStrengthMessage}
              keyboardType="default"
              isSecureText={isRePassSecure}
              autoCapitalize={'none'}
              inputContainerStyle={styles._inputView}
              setStateValue={(text) => {
                setRePassword(text.replace(',', ''));

                if (text.length > 1) {
                  const msg = validatePasswordStrength(text);
                  setReStrengthMessage(msg);
                } else {
                  setReStrengthMessage(null);
                }
              }}
            />
          </View>
        </View>

        {/* Update Password Button */}
        <View style={styles._itemContainer}>
          <View style={{ width: 250, alignSelf: 'center', marginTop: 16 }}>
            <PrimaryButton
              title={t('ProfileScreen.update_password')}
              onPress={_onUpdatePasswordClick}
              disabled={false}
              buttonStyle={{
                backgroundColor: AppColors.BLUE,
                alignSelf: 'center',
              }}
              buttonTitleStyle={{ color: AppColors.WHITE }}
            />
          </View>
        </View>

        {/* Pincode */}
        <Text style={styles._parent}>{t('ProfileScreen.pincode')}</Text>
        {!isPincodeSet ? (
          <>
            <Text style={styles._pincodeInfo}>
              {t('ProfileScreen.info_pincode')}
            </Text>
            {/* Set Pincode Button */}
            <View style={styles._itemContainer}>
              <View style={{ width: 250, alignSelf: 'center', marginTop: 16 }}>
                <PrimaryButton
                  title={t('ProfileScreen.set_pincode')}
                  onPress={() => {
                    setShowPinCodeModal(!showPincodeModal);
                  }}
                  disabled={false}
                  buttonStyle={{
                    backgroundColor: AppColors.BLUE,
                    alignSelf: 'center',
                  }}
                  buttonTitleStyle={{ color: AppColors.WHITE }}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Old Pincode */}
            <View style={styles._itemContainer}>
              <View style={{ width: '100%' }}>
                <InputComponent
                  height={45}
                  type={'secret'}
                  toggleSecureEntry={_toggleOldPincodeSecurity}
                  placeholderText={t('ProfileScreen.old_pincode')}
                  errorMessage={oldPincodeError}
                  value={oldPincode}
                  keyboardType="number-pad"
                  isSecureText={oldpincodeSecurity}
                  autoCapitalize={'none'}
                  inputContainerStyle={{ width: '80%' }}
                  inputContainerStyle={styles._inputView}
                  setStateValue={(text) => {
                    setOldPincode(text);
                    if (text.length == 0 || text == undefined) setOldPincodeError('');
                  }}
                />
              </View>
            </View>

            {/* New Pincode */}
            <View style={styles._itemContainer}>
              <View style={{ width: '100%' }}>
                <InputComponent
                  height={45}
                  type={'secret'}
                  toggleSecureEntry={_toggleNewPincodeSecurity}
                  placeholderText={t('ProfileScreen.new_pincode')}
                  errorMessage={newPincodeError}
                  value={newPincode}
                  keyboardType="number-pad"
                  isSecureText={newPincodeSecurity}
                  autoCapitalize={'none'}
                  inputContainerStyle={{ width: '80%' }}
                  inputContainerStyle={styles._inputView}
                  setStateValue={(text) => {
                    setNewpincode(text);
                    if (text.length == 0 || text == undefined) setNewPincodeError('');
                  }}
                />
              </View>
            </View>

            {/* Re Enter Pincode */}
            <View style={styles._itemContainer}>
              <View style={{ width: '100%' }}>
                <InputComponent
                  height={45}
                  type={'secret'}
                  toggleSecureEntry={_toggleRePincodeSecurity}
                  placeholderText={t('ProfileScreen.re_enter_pincode')}
                  errorMessage={rePincodeError}
                  value={rePincode}
                  keyboardType="number-pad"
                  isSecureText={rePincodeSecurity}
                  autoCapitalize={'none'}
                  inputContainerStyle={{ width: '80%' }}
                  inputContainerStyle={styles._inputView}
                  setStateValue={(text) => {
                    setRepincode(text);
                    if (text.length == 0 || text == undefined) setRePincodeError('');
                  }}
                />
              </View>
            </View>

            {/* Set Pincode Button */}
            <View style={styles._itemContainer}>
              <View style={{ width: 250, alignSelf: 'center', marginTop: 16 }}>
                <PrimaryButton
                  title={t('ProfileScreen.update_pincode')}
                  onPress={() => {
                    _updatePincode();
                  }}
                  disabled={false}
                  buttonStyle={{
                    backgroundColor: AppColors.BLUE,
                    alignSelf: 'center',
                  }}
                  buttonTitleStyle={{ color: AppColors.WHITE }}
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.deleteAccountViewStyle}>
          <PrimaryButton
            title={t('ProfileScreen.delete_account')}
            onPress={() => {
              deleteAccount();
            }}
            disabled={false}
            buttonStyle={{
              backgroundColor: AppColors.DANGER,
              alignSelf: 'center',
            }}
            buttonTitleStyle={{ color: AppColors.WHITE }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  _mainContainer: {
    flex: 1,
  },
  _scrollContainer: {
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: '#f7f7f7',
    paddingBottom: '10%',
  },
  _parent: {
    marginHorizontal: 5,
    marginTop: 20,
    fontSize: 15,
    color: '#6f6f6f',
    marginBottom: 10,
  },
  _itemContainer: {
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  _itemLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: BLACK_COLOR,
    marginLeft: 10,
    marginBottom: 5,
  },
  _row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  _inputView: {
    backgroundColor: WHITE_COLOR,
    borderRadius: 10,
    width: '100%',
    height: 45,
    paddingLeft: 15,
    paddingRight: 10,
    borderBottomWidth: 0,
  },
  _editText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    marginRight: 14,
  },
  _pincodeInfo: {
    fontFamily: 'Poppins-regular',
    fontSize: 12,
    marginHorizontal: 20,
    color: SECONDARY_COLOR,
    marginBottom: 10,
  },
  deleteAccountViewStyle: {
    width: 250,
    alignSelf: 'center',
    marginTop: 200,
  },
  deleteAccountStyle: {
    padding: 5,
    justifyContent: 'flex-end',
    backgroundColor: AppColors.DANGER,
    borderRadius: 4,
  },
});

export default ProfileScreen;
