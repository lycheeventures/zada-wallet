import jwt_decode from 'jwt-decode';
import { AuthAPI } from '../../gateways';
import { storeSecureItems } from '../../helpers/utils';

export const AuthenticateUser = async (
  userId: string,
  secret: string,
  generateWallet?: boolean
) => {
  let authResp = await AuthAPI.authenticate(userId, secret);
  let token = authResp.data.token;
  let walletAlreadyExist = await createWallet(token);
  if (!walletAlreadyExist && generateWallet) {
    // Reauthenticate on wallet creation.
    let resp = await AuthAPI.authenticate(userId, secret);
    await storeSecureItems('TOKEN', resp.data.token);
    return resp.data.token;
  } else {
    // Wallet already exist. we can send the previous token.
    await storeSecureItems('TOKEN', authResp.data.token);
    return authResp.data.token;
  }
};

const createWallet = async (token: string) => {
  const decodedToken = jwt_decode(token);
  if (decodedToken && decodedToken.dub?.length) {
    return true;
  }
  await AuthAPI.createWallet(token);
  return false;
};
