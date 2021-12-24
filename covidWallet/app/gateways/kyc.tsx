import {getToken} from './credentials';
import http_client from './http_client';

export const add_kyc_session = async (sessionId: string, userId: string) => {
  try {
    const token = await getToken();
    const result = http_client({
      url: '/api/kyc/add_kyc_session',
      method: 'POST',
      data: {
        sessionId,
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};

export const get_kyc_status = async (userId: string) => {
  try {
    const token = await getToken();
    const result = http_client({
      url: '/api/kyc/get_kyc_status',
      method: 'GET',
      params: {
        userId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
};
