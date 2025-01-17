import { showMessage } from './Toast';
import { AuthenticateUser } from './Authenticate';
import ConstantsList, { ZADA_AUTH_TEST } from './ConfigApp';
import { getItem, saveItem } from './Storage';
import { get_credential } from '../gateways/credentials';

export const addCredentialToActionList = async (credentialID) => {
  let resp = await AuthenticateUser();
  let cred_arr = [];
  let cred_arr_archive = await getItem(ConstantsList.CRED_OFFER);

  if (cred_arr_archive !== null) {
    if (JSON.parse(cred_arr_archive).find((i) => i !== null))
      cred_arr = JSON.parse(cred_arr_archive);
  }

  if (ifExist(cred_arr, credentialID)) {
    return;
  }

  if (resp.success) {
    try {
      let result = await get_credential(credentialID);
      if (result.data.success) {
        let obj = result.data.credential;
        obj['type'] = ConstantsList.CRED_OFFER;
        obj = await addImageAndNameFromConnectionList(obj);
        cred_arr.push(obj);

        // Adding item to credentials.
        await saveItem(ConstantsList.CRED_OFFER, JSON.stringify(cred_arr));
        return result.data;
      } else {
        return result.data;
      }
    } catch (e) {
      console.log(e);
    }
  } else {
    showMessage('ZADA Wallet', resp.message);
  }
};

// Search and add Image and Name attr to Object
export async function addImageAndNameFromConnectionList(obj) {
  let conn = await getItem(ConstantsList.CONNECTIONS);
  if (conn == null) {
    return null;
  }
  let parseConn = JSON.parse(conn);
  parseConn.forEach((e) => {
    if (e.connectionId === obj.connectionId) {
      obj.imageUrl = e.imageUrl;
      obj.organizationName = e.name;
    }
  });
  return obj;
}

export function getActionHeader(v) {
  switch (v) {
    case ConstantsList.CONN_REQ:
      return 'Connection Request';
    case ConstantsList.CRED_OFFER:
      return 'Certificate Offer';
    case ConstantsList.VER_REQ:
      return 'Verification Request';
    default:
      return '';
  }
}

export function getActionText(v) {
  switch (v) {
    case ConstantsList.CONN_REQ:
      return ' has invited you to connect.';
    case ConstantsList.CRED_OFFER:
      return ' has sent you a certificate. Do you want to accept it?';
    case ConstantsList.VER_REQ:
      return ' has sent you a request for data verification';
    case ZADA_AUTH_TEST:
      return ' has sent you authorization request';
    default:
      return '';
  }
}

function ifExist(arr, credentialID) {
  let exist = false;
  arr.forEach((e) => {
    if (e.credentialId === credentialID) {
      exist = true;
    }
  });

  return exist;
}
