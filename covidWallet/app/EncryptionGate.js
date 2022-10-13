import React, { useEffect, useState } from 'react';
import binaryToBase64 from 'react-native/Libraries/Utilities/binaryToBase64';
import * as Keychain from 'react-native-keychain';
import LoadingScreen from './screens/LoadingScreen';
import { generateSecureRandom } from 'react-native-securerandom';
import { getSecureItems } from './helpers/utils';

const ENCRYPTION_KEY = 'ZADA_UNIQUE_ID';
export const EncryptionGate = ({ children }) => {
  // States
  const [encryptionKey, setEncryptionKey] = useState({
    isFresh: false,
    key: null,
  });

  useEffect(() => {
    const init = async () => {
      const { isFresh, key } = await getEncryptionKey();
      setEncryptionKey({ isFresh, key });
    };
    init();
  }, []);

  // Unique non-sensitive ID which we use to save the store password
  const getEncryptionKey = async () => {
    // check for existing credentials
    const existingCredentials = await Keychain.getGenericPassword();
    const existingToken = await getSecureItems();
    if (existingToken && existingCredentials && existingCredentials.password !== '1') {
      return { isFresh: false, key: existingCredentials.password };
    }

    // generate new credentials based on random string
    const randomBytes = await generateSecureRandom(32);
    const randomBytesString = binaryToBase64(randomBytes);
    const hasSetCredentials = await Keychain.setGenericPassword(ENCRYPTION_KEY, randomBytesString);

    if (hasSetCredentials) {
      return { isFresh: true, key: randomBytesString };
    }
  };

  if (!encryptionKey.key && !encryptionKey.isFresh) {
    return <LoadingScreen messageIndex={2} />;
  }

  return children(encryptionKey);
};
