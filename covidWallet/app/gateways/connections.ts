import {
  analytics_log_accept_connection_request,
  analytics_log_reject_connection_request,
} from '../helpers/analytics';
import http_client from './http_client';

// Get All Connections
export async function get_all_connections() {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/connection/get_all_connections',
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

    const result = await http_client({
      method: 'POST',
      url: '/api/connection/accept_connection',
      data: obj,
    });

    // Google Analytics
    analytics_log_accept_connection_request();

    return result;
  } catch (error) {
    throw error;
  }
}

// Delete Connection
export async function delete_connection(connectionId: string) {
  try {
    let obj = {
      connectionId,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/connection/delete_connection',
      data: obj,
    });

    // Google Analytics
    analytics_log_reject_connection_request();

    return result;
  } catch (error) {
    throw error;
  }
}

export async function invalidateCache() {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/connection/invalidate_cache',
    });
    return result;
  } catch (error) {
    throw error;
  }
}
