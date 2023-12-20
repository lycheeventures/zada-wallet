import http_client from './http_client';
import {
  analytics_log_accept_verification_request,
  analytics_log_reject_verification_request,
  analytics_log_submit_connectionless_verification_request,
} from '../helpers/analytics';

// Get All Verification Proposals API
export async function get_all_verification_proposals() {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_all_verification_proposals',
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Get Policies API
export async function get_policy(policyId: string) {
  try {
    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_policy?policyId=' + policyId,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Get All Credentials for Verification Proposals API
export async function get_all_credentials_for_verification(verificationId: string) {
  try {
    let obj = {
      verificationId,
    };

    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_all_credentials_for_verification',
      params: obj,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Getting all credentials for connectionless verification.
export async function get_all_credentials_connectionless_verification(metadata: string) {
  try {
    let obj = {
      metadata,
    };

    const result = await http_client({
      method: 'GET',
      url: '/api/credential/get_all_credentials_connectionless_verification',
      params: obj,
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Submitting Connectionless verification request.
export async function submit_verification_connectionless(
  metadata: string,
  policyName: string,
  credentialId: string
) {
  try {
    let obj = {
      metadata,
      policyName,
      credentialId,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/credential/submit_verification_connectionless',
      data: obj,
    });

    // Google Analytics
    analytics_log_submit_connectionless_verification_request();

    return result;
  } catch (error) {
    throw error;
  }
}

// Delete Verification
export async function delete_verification(verificationId: string) {
  try {
    let obj = {
      verificationId,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/credential/delete_verification',
      data: obj,
    });

    // Google Analytics
    analytics_log_reject_verification_request();

    return result;
  } catch (error) {
    throw error;
  }
}

// Delete Verification
export async function submit_verification(
  verificationId: string,
  credentialId: string,
  policyName: string,
  organizationName: string
) {
  try {
    let obj = {
      verificationId,
      credentialId,
      policyName,
    };

    const result = await http_client({
      method: 'POST',
      url: '/api/credential/submit_verification',
      data: obj,
    });

    // Google Analytics
    analytics_log_accept_verification_request();

    return result;
  } catch (error) {
    throw error;
  }
}

// Do verification of credential
export async function submit_cold_verification(
  data: String,
  signature: String,
  tenantId: String,
  keyVersion: String
) {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/credential/submit_cold_verification',
      data: {
        data,
        signature,
        tenantId,
        keyVersion,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
}

// Send request to agency.
export async function send_request_to_agency(data: String) {
  try {
    const result = await http_client({
      method: 'POST',
      url: '/api/credential/url_request_handler',
      data: {
        data,
      },
    });
    return result;
  } catch (error) {
    throw error;
  }
}
