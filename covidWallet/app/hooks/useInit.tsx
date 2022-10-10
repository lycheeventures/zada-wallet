import React, { useEffect, useState } from 'react';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store';

import { selectActionsError, selectActionsStatus } from '../store/actions/selectors';
import {
  selectConnections,
  selectConnectionsError,
  selectConnectionsStatus,
} from '../store/connections/selectors';
import { selectCredentialsError, selectCredentialsStatus } from '../store/credentials/selectors';

import { fetchActions } from '../store/actions/thunk';
import { fetchConnections } from '../store/connections/thunk';
import { fetchCredentials } from '../store/credentials/thunk';
import { _showAlert } from '../helpers/Toast';
import { changeCredentialStatus } from '../store/credentials';
import { changeActionStatus } from '../store/actions';
import { changeConnectionStatus } from '../store/connections';
import { selectAuthError, selectAuthStatus, selectToken } from '../store/auth/selectors';
import { getItem } from '../helpers/Storage';
import { updateAuthStatus, updateIsAuthorized } from '../store/auth';
import useDecryption from './useDecryption';
import { fetchToken } from '../store/auth/thunk';
import { ConnectionAPI, CredentialAPI } from '../gateways';

const useInit = () => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const token = useAppSelector(selectToken);
  const connections = useAppSelector(selectConnections.selectAll);
  const authStatus = useAppSelector(selectAuthStatus);
  const actionStatus = useAppSelector(selectActionsStatus);
  const connStatus = useAppSelector(selectConnectionsStatus);
  const credStatus = useAppSelector(selectCredentialsStatus);

  const authError = useAppSelector(selectAuthError);
  const actionError = useAppSelector(selectActionsError);
  const connError = useAppSelector(selectConnectionsError);
  const credError = useAppSelector(selectCredentialsError);

  // Hooks
  const { decrpytData } = useDecryption();

  // States
  const [isAppReady, setIsAppReady] = useState(false);
  const [messageIndex, setMessageIndex] = useState(2);

  // useEffects
  useEffect(() => {
    setMessageIndex(1);
  }, []);

  useEffect(() => {
    if (actionStatus == 'idle' && connStatus == 'idle' && credStatus == 'idle') {
      setIsAppReady(true);
      setMessageIndex(3);
    }
  }, [actionStatus, connStatus, credStatus]);

  // Whenever token gets updated.
  useEffect(() => {
    if (token) {
      // Invalidating cache.
      ConnectionAPI.invalidateCache();
      CredentialAPI.invalidateCache();

      // Fetching Connections
      dispatch(fetchConnections());
    } else {
      dispatch(changeConnectionStatus('idle'));
    }
  }, [token]);

  const startApp = async () => {
    if (token) {
      setMessageIndex(3);
      // Decrypt Redux.
      await decrpytData();

      // Fetch Tokens.
      await dispatch(fetchToken({ secret: undefined }));
      dispatch(changeConnectionStatus('idle'));
    } else {
      dispatch(changeConnectionStatus('idle'));
    }
  };

  // Fetching all crendetials and actions after fetching connections.
  useEffect(() => {
    if (connections.length > 0) {
      // Fetching all credentials
      dispatch(fetchCredentials());

      // Fetching all actions
      dispatch(fetchActions());
    } else {
      // changing status to idle
      dispatch(changeActionStatus('idle'));
      dispatch(changeCredentialStatus('idle'));
    }
  }, [connections, token]);

  useEffect(() => {
    // Auth status handling
    handleAuthStatus();

    // Action status handling
    handleActionStatus();

    // Credential status handling
    handleCredentialStatus();

    // Connection status handling
    handleConnectionStatus();
  }, [authStatus, actionStatus, credStatus, connStatus]);

  // Functions
  const init = async () => {
    await dispatch(fetchToken());
  };

  // Handling Action Status
  const handleAuthStatus = () => {
    if (authStatus == 'succeeded' || authStatus == 'failed') {
      dispatch(updateAuthStatus('idle'));

      if (authStatus === 'failed') {
        _showAlert(authError);
      }
    }
  };

  // Handling Action Status
  const handleActionStatus = () => {
    if (actionStatus == 'succeeded' || actionStatus == 'failed') {
      dispatch(changeActionStatus('idle'));

      if (actionStatus === 'failed') {
        _showAlert('Error', actionError);
      }
    }
  };

  // Handling Credentials Status
  const handleCredentialStatus = () => {
    if (credStatus == 'succeeded' || credStatus == 'failed') {
      dispatch(changeCredentialStatus('idle'));

      if (credStatus === 'failed') {
        _showAlert('Error', credError);
      }
    }
  };

  // Handling Connection Status
  const handleConnectionStatus = () => {
    if (connStatus == 'succeeded' || connStatus == 'failed') {
      dispatch(changeConnectionStatus('idle'));

      if (connStatus === 'failed') {
        _showAlert('Error', connError);
      }
    }
  };

  return {
    isAppReady,
    messageIndex,
    setMessageIndex,
    startApp,
  };
};

export default useInit;
