import { Buffer } from 'buffer';
import queryString from 'query-string';
import { get_encrypted_credential } from '../../gateways/credentials';
import { decryptAES256CBC, performSHA256 } from '../../helpers/crypto';
import { sortValuesByKey } from '../../helpers/utils';

export const getType = (str) => {
  if (str) {
    let unEscapedStr = str.replace(/\\/g, '');
    unEscapedStr = str.replace(/“/g, '"');
    try {
      return JSON.parse(unEscapedStr).type;
    } catch (error) {
      return 'default';
    }
  }
};

export const handleQRLogin = async (loginQRData) => {
  try {
    let availableCredentials = {
      metadata: loginQRData.metadata,
      type: loginQRData.type,
      imageUrl: require('../../assets/images/qr-code.png'),
      organizationName: 'ZADA Verification',
    };
    return {
      credential: availableCredentials,
    };
  } catch (error) {
    throw error;
  }
};

export const handleCredVerification = async (credQrData) => {
  try {
    let credValues = {};
    // spliting hash and credentialId from QR data.
    if (credQrData.version === 2) {
      let credentialId = credQrData.credentialId;
      let key = credQrData.key;

      // Getting hash from key.
      let hash = await performSHA256(key);

      // Getting encrypted credentials from database.
      let resp = await get_encrypted_credential(credentialId, hash);
      if (!resp.data.success) {
        return false;
      }
      credQrData = resp.data.credential;

      // Decrypting encrypted credentials
      let base64Data = await decryptAES256CBC(credQrData.encryptedCredential, key);
      credValues = Buffer.from(base64Data, 'base64').toString();
    } else {
      // Handling old implementation
      credValues = Buffer.from(credQrData.data, 'base64').toString();
    }

    credValues = JSON.parse(credValues);
    var sortedValues = sortValuesByKey(credValues);

    return {
      credential: {
        data: Buffer.from(JSON.stringify(sortedValues)).toString('base64'),
        signature: credQrData.signature,
        tenantId: credQrData.tenantId,
        keyVersion: credQrData.keyVersion,
      },
      sortedValues,
    };
  } catch (error) {
    throw error;
  }
};

export const handleQRConnectionRequest = async (inviteID, qrJSON) => {
  let baseURL = 'https://trinsic.studio/url/';
  try {
    let response = await fetch(baseURL + inviteID);
    const parsed = queryString.parse(response.url, true);
    let urlData = Object.values(parsed)[0];
    var data = JSON.parse(Buffer.from(urlData, 'base64').toString());

    qrJSON.organizationName = data.label;
    qrJSON.imageUrl = data.imageUrl;
    qrJSON.connectionId = data['@id'];

    return qrJSON;
  } catch (error) {
    throw error;
  }
};
