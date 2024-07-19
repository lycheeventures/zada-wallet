import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { selectBaseUrl, selectShowClaimButton } from '../store/app/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCredentials } from '../store/credentials/selectors';
import { PROD_BASE_URL, ZADA_WALLET_ID_CRED_DEF_PROD, ZADA_WALLET_ID_CRED_DEF_TEST } from '../helpers/ConfigApp';
import { updateShowClaimButton } from '../store/app';
import { selectIsAuthorized, selectUser } from '../store/auth/selectors';
import { AppColors } from '../theme/Colors';
import { claimCredential } from '../gateways/credentials';

const useClaimCredential = () => {
  // Constants
  const dispatch = useAppDispatch();

  // Selectors
  const baseUrl = useAppSelector(selectBaseUrl);
  const credentials = useAppSelector(selectCredentials.selectAll);
  const user = useAppSelector(selectUser);
  const showClaimButton = useAppSelector(selectShowClaimButton);
  const isAuthorized = useAppSelector(selectIsAuthorized);

  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    handleShowClaimButton();
  }, [credentials]);

  useEffect(() => {
    if (showClaimButton) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showClaimButton]);

  // To determine whether to show claim button or not.
  const handleShowClaimButton = () => {
    const credDef = PROD_BASE_URL === baseUrl ? ZADA_WALLET_ID_CRED_DEF_PROD : ZADA_WALLET_ID_CRED_DEF_TEST;
    const { didExist } = user;
    const zadaWalletIdCredential = credentials.find(credential => credential.definitionId === credDef);
    if (didExist && !zadaWalletIdCredential) {
      // Auto claim
      claimZadaWalletId();
    } else if (!didExist && !zadaWalletIdCredential) {
      // Show claim button
      dispatch(updateShowClaimButton(true));
    } else {
      // Hide claim button
      dispatch(updateShowClaimButton(false));
    }
  };

  const claimZadaWalletId = async () => {
    claimCredential("zada-wallet-id")
  }

  return (
    <>
      {isAuthorized && showClaimButton && (
        <SafeAreaView>
          <Animated.View style={[styles.container, { transform: [{ translateX }] }]}>
            <Text style={styles.text}>
              Claim Zada Wallet ID Credential
            </Text>
            <TouchableOpacity style={styles.button} onPress={claimZadaWalletId}>
              <Text style={styles.text}>
                Claim
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: AppColors.PRIMARY,
    height: 50,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  text: {
    color: AppColors.WHITE,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    borderWidth: 1,
    borderColor: AppColors.WHITE,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  buttonText: {
    color: AppColors.WHITE,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
});

export default useClaimCredential;
