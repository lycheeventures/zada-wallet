// import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { AppDispatch, useAppDispatch, useAppSelector } from '../store';
// import { selectActionsError, selectActionsStatus } from '../store/actions/selectors';
// import {
//   selectConnections,
//   selectConnectionsError,
//   selectConnectionsStatus,
// } from '../store/connections/selectors';
// import { selectCredentialsError, fetchCredentialsStatus } from '../store/credentials/selectors';

// import { fetchActions } from '../store/actions/thunk';
// import { fetchConnections } from '../store/connections/thunk';
// import { fetchCredentials } from '../store/credentials/thunk';
// import { getUserProfile } from '../store/auth/thunk';
// import { showNetworkMessage, _showAlert } from '../helpers/Toast';
// import { changeCredentialStatus } from '../store/credentials';
// import { changeActionStatus } from '../store/actions';
// import { changeConnectionStatus } from '../store/connections';
// import { selectAuthStatus, selectToken, selectUser } from '../store/auth/selectors';
// import { updateAuthStatus, updateIsAuthorized } from '../store/auth';
// import { ConnectionAPI, CredentialAPI } from '../gateways';
// import { checkIfWalletExist } from '../screens/utils';
// import { selectAppSetupComplete } from '../store/app/selectors';

// const useInit = () => {
//   // Constants
//   const dispatch = useAppDispatch<AppDispatch>();

//   // Selectors
//   const { i18n } = useTranslation(); // destructure i18n here
//   const isAppSetupComplete = useAppSelector(selectAppSetupComplete);
//   const token = useAppSelector(selectToken);
//   const user = useAppSelector(selectUser);
//   const connections = useAppSelector(selectConnections.selectAll);
//   const authStatus = useAppSelector(selectAuthStatus);
//   const actionStatus = useAppSelector(selectActionsStatus);
//   const connStatus = useAppSelector(selectConnectionsStatus);
//   const credStatus = useAppSelector(fetchCredentialsStatus);

//   const actionError = useAppSelector(selectActionsError);
//   const connError = useAppSelector(selectConnectionsError);
//   const credError = useAppSelector(selectCredentialsError);

//   // States
//   const [isAppReady, setIsAppReady] = useState(false);
//   const [messageIndex, setMessageIndex] = useState(2);

//   // useEffects
//   useEffect(() => {
//     setMessageIndex(1);
//   }, []);

//   useEffect(() => {
//     if (actionStatus == 'initial' && connStatus == 'initial' && credStatus == 'initial') {
//       fetchUserProfile();
//     }
//   }, [actionStatus, connStatus, credStatus]);

//   // Whenever token gets updated.
//   useEffect(() => {
//     if (token) {
//       if (!isAppSetupComplete) {
//         return;
//       } else {
//         let walletExist = checkIfWalletExist(token);
//         if (walletExist) {
//           // Invalidating cache.
//           ConnectionAPI.invalidateCache();
//           CredentialAPI.invalidateCache();

//           // Fetching Connections
//           dispatch(fetchConnections());
//         }
//       }
//     } else {
//       dispatch(changeConnectionStatus('idle'));
//     }
//   }, [token]);

//   const fetchUserProfile = async () => {
//     if (user.language === undefined && token) {
//       await dispatch(getUserProfile()).unwrap();
//     }
//     await i18n.changeLanguage(user.language);
//     setTimeout(() => {
//       setMessageIndex(3);
//       setIsAppReady(true);
//     }, 1000);
//   };

//   const startApp = async () => {
//     if (token) {
//       let walletExist = checkIfWalletExist(token);
//       if (!walletExist) {
//         dispatch(changeConnectionStatus('idle'));
//       } else {
//         setMessageIndex(3);
//         if (isAppSetupComplete !== null) {
//           dispatch(updateIsAuthorized(true));
//           dispatch(changeConnectionStatus('idle'));
//         }
//       }
//     } else {
//       dispatch(changeConnectionStatus('idle'));
//     }
//   };

//   // Fetching all crendetials and actions after fetching connections.
//   useEffect(() => {
//     if (connections.length > 0 && isAppReady) {
//       // Fetching all credentials
//       dispatch(fetchCredentials());

//       // Fetching all actions
//       dispatch(fetchActions());
//     } else {
//       // changing status to idle
//       dispatch(changeActionStatus('idle'));
//       dispatch(changeCredentialStatus('idle'));
//     }
//   }, [connections]);

//   useEffect(() => {
//     // Auth status handling
//     handleAuthStatus();

//     // Action status handling
//     handleActionStatus();

//     // Credential status handling
//     handleCredentialStatus();

//     // Connection status handling
//     handleConnectionStatus();
//   }, [authStatus, actionStatus, credStatus, connStatus]);

//   // Handling Action Status
//   const handleAuthStatus = () => {
//     if (authStatus == 'succeeded' || authStatus == 'failed') {
//       dispatch(updateAuthStatus('idle'));
//     }
//   };

//   // Handling Action Status
//   const handleActionStatus = () => {
//     if (actionStatus == 'success' || actionStatus == 'error') {
//       dispatch(changeActionStatus('idle'));

//       if (actionStatus === 'error' && actionError.message === 'Network Error') {
//         setTimeout(() => {
//           showNetworkMessage();
//         }, 500);
//       }

//       handleCustomErrorMessages(actionError);
//     }
//   };

//   // Handling Credentials Status
//   const handleCredentialStatus = () => {
//     if (credStatus == 'success' || credStatus == 'error') {
//       dispatch(changeCredentialStatus('idle'));

//       if (credStatus === 'error' && credError.message === 'Network Error') {
//         setTimeout(() => {
//           showNetworkMessage();
//         }, 500);
//       }

//       handleCustomErrorMessages(credError);
//     }
//   };

//   // Handling Connection Status
//   const handleConnectionStatus = () => {
//     if (connStatus == 'success' || connStatus == 'error') {
//       dispatch(changeConnectionStatus('idle'));

//       if (connStatus === 'error' && connError.message === 'Network Error') {
//         setTimeout(() => {
//           showNetworkMessage();
//         }, 500);
//       }

//       handleCustomErrorMessages(connError);
//     }
//   };

//   const handleCustomErrorMessages = (error: any) => {
//     if (error.message?.substring(0, 6) === 'custom') {
//       _showAlert('Error', error.message?.split(':')[1]);
//     }
//   };

//   return {
//     isAppReady,
//     messageIndex,
//     setMessageIndex,
//     startApp,
//   };
// };

// export default useInit;
