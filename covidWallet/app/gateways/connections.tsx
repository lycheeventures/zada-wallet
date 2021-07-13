import {AuthenticateUser} from '../helpers/Authenticate';
import http_client from './http_client';

async function getToken() {
  let resp = await AuthenticateUser();
  if (resp.success) {
    console.log('token => ', resp.token);
    return resp.token;
  } else {
    return '';
  }
}

export async function get_all_connections() {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/connection/get_all_connections',
      headers: {
        Authorization: 'Bearer ' + (await getToken()),
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Accept Connection
export async function accept_connection(metadata: string) {
  try {
    let baseURL = 'https://trinsic.studio/url/';
    let obj = {
      inviteUrl: baseURL + metadata,
    };

    let headers = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + (await getToken()),
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/connection/accept_connection',
      data: obj,
      headers,
    });
    return result;
  } catch (error) {
    throw error;
  }
}
