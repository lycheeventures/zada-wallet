import http_client from './http_client';
import { Buffer } from 'buffer';
import {
  analytics_log_accept_credential_request,
  analytics_log_credential_delete,
  analytics_log_reject_credential_request,
} from '../helpers/analytics';

// Get Specific Credential
export async function get_credential(credentialID: string) {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_credential' + `?credentialId=${credentialID}`,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Get All Crendentials API
export async function get_all_credentials() {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_all_credentials',
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Accept Crendentials API
export async function accept_credential(credentialId: string) {
  try {
    const params = new URLSearchParams();
    params.append('credentialId', credentialId);

    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/credential/accept_credential',
      data: params,
      headers,
    });

    // Google Analytics
    analytics_log_accept_credential_request();

    return result;
  } catch (error) {
    throw error;
  }
}

// Delete Crendentials API
export async function delete_credential(credentialId: string) {
  try {
    const params = new URLSearchParams();
    params.append('credentialId', credentialId);

    let headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/credential/delete_credential',
      data: params,
      headers,
    });

    // Google Analytics
    analytics_log_reject_credential_request();
    analytics_log_credential_delete();

    return result;
  } catch (error) {
    throw error;
  }
}

// Get All Crendentials offers API
export async function get_all_credentials_offers() {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_all_credential_offers',
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Get signature for credential
export async function get_signature(credentialId: string) {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_credential_signature',
      params: {
        credentialId: credentialId,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Generate signature
export async function get_credential_qr(data: string) {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_credential_qr',
      params: {
        data,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Compress data for QR
export async function compress_credential_qr(jsonData: Object) {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/compress_credential_qr',
      params: {
        data: JSON.stringify(jsonData),
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Fetching signature for credential
export const fetch_signature_by_cred_id = async (credentialId: string, values: Object) => {
  try {
    const result = await get_signature(credentialId);
    if (result.data.success) {
      // Converting values in base64
      let objJsonStr = JSON.stringify(values);
      let base64Values = Buffer.from(objJsonStr).toString('base64');

      // Making QR based on signature and base 64 encoded data
      let qrData = {
        data: base64Values,
        signature: result.data.signature,
        tenantId: result.data.tenantId,
        keyVersion: result.data.keyVersion,
        type: 'cv',
      };
      return {
        success: true,
        qrcode: `${JSON.stringify(qrData)}`,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    return { success: false };
  }
};

export async function get_encrypted_credential(credentialId: string, hash: string) {
  try {
    let params = {
      credentialId,
      hash,
    };
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_encrypted_credential',
      params,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function save_encrypted_credential(
  credentialId: string,
  encryptedString: string,
  hash: string
) {
  try {
    let data = {
      credentialId,
      encryptedString,
      hash: hash,
    };
    const result = await http_client({
      method: 'POST',
      url: '/api/credential/save_encrypted_credential',
      data,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function get_credential_template(name: string) {
  try {
    let params = {
      fileName: name,
    };
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_credential_template',
      params,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function submit_url_scheme(url: string, phone: string) {
  try {
    let data = {
      phone,
      url,
    };
    const result = await http_client({
      method: 'POST',
      url: '/api/credential/submit_url_scheme',
      data,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function invalidateCache() {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/credential/invalidate_cache',
    });
    return result;
  } catch (error) {
    throw error;
  }
}
