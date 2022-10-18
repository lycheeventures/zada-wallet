import * as AuthAPI from './auth';
import * as CredentialAPI from './credentials';
import * as ConnectionAPI from './connections';
import * as VerificationAPI from './verifications';

export function throwErrorIfExist(error: any) {
  if (error?.response?.data.error) {
    throw error?.response?.data.error;
  } else {
    throw error;
  }
}

export { AuthAPI, CredentialAPI, ConnectionAPI, VerificationAPI };
