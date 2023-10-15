import queryString from 'query-string';
import { CredentialAPI, VerificationAPI } from '../../gateways';
import { get_encrypted_credential } from '../../gateways/credentials';
import { decryptAES256CBC, performSHA256 } from '../../helpers/crypto';
import { convertBase64ToString, convertStringToBase64, sortValuesByKey } from '../../helpers/utils';

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

export const makeVerificationObject = async (data) => {
  try {
    let availableCredentials = {
      metadata: data.metadata,
      type: data.type,
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
    let signature = '';
    let tenantId = '';
    let keyVersion = '';

    // Handling v3
    if (credQrData.v === 3) {
      // Getting compressed credentials from database.
      let resp = await CredentialAPI.get_credential_qr(credQrData.d);
      if (resp.data.success) {
        credValues = convertBase64ToString(resp.data.decompressed);
        signature = resp.data.signature;
        tenantId = resp.data.tenantId;
        keyVersion = resp.data.keyVersion;
      }
    }

    // Handling v2
    else if (credQrData.version === 2) {
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
      credValues = convertBase64ToString(base64Data);
      signature = credQrData.signature;
      tenantId = credQrData.tenantId;
      keyVersion = credQrData.keyVersion;
    } else {
      // Handling v1
      credValues = convertBase64ToString(credQrData.data);
      signature = credQrData.signature;
      tenantId = credQrData.tenantId;
      keyVersion = credQrData.keyVersion;
    }

    credValues = JSON.parse(credValues);
    var sortedValues = sortValuesByKey(credValues);
    return {
      credential: {
        data: convertStringToBase64(JSON.stringify(sortedValues)),
        signature: signature,
        tenantId: tenantId,
        keyVersion: keyVersion,
      },
      sortedValues,
    };
  } catch (error) {
    throw error;
  }
};

export const handleQRConnectionRequest = async (inviteID, qrJSON) => {
  try {
    let response = await VerificationAPI.get_policy(inviteID);
    let urlData = response.data.policy.verificationRequestData
    var data = JSON.parse(convertBase64ToString(urlData));

    qrJSON.organizationName = JSON.parse(convertBase64ToString(data.label));
    qrJSON.imageUrl = data.imageUrl;
    qrJSON.connectionId = data['@id'];

    return qrJSON;
  } catch (error) {
    throw error;
  }
};
