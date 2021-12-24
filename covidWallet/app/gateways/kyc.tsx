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
