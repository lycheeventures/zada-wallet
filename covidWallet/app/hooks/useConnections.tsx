import { useEffect } from 'react';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { selectConnectionList, selectConnections } from '../store/connections/selectors';
import {
  acceptConnection,
  fetchAllConnectionList,
  fetchAcceptConnectionList,
  removeConnection,
} from '../store/connections/thunk';
import { updateConnectionlist } from '../store/connections';
import { selectUser } from '../store/auth/selectors';
import { CredentialAPI } from '../gateways';
import { ICredentialObject, Action } from '../store/credentials/interface';

const useConnections = () => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const user = useAppSelector(selectUser);
  const acceptConnections = useAppSelector(selectConnections.selectAll);
  const allConnectionlist = useAppSelector(selectConnectionList);

  const connectionlist = useAppSelector(selectConnectionList).map(item => {
    return { label: item.name, value: item.metadata, imageUrl: item.image };
  });

  // UseEffect
  useEffect(() => {
    dispatch(fetchAllConnectionList());
  }, []);

  const fetchAcceptConnections = () => {
    dispatch(fetchAcceptConnectionList());
  };

  // pull to refresh
  const refreshConnections = () => {
    dispatch(fetchAcceptConnectionList());
  };

  const onAcceptConnection = (metadata: string) => {
    dispatch(acceptConnection(metadata)).then(() => {
      let newList = allConnectionlist.filter(item => item.metadata !== metadata);
      dispatch(updateConnectionlist(newList));
    });
  };

  const onDeleteConnection = async (connectionId: string) => {
    try {
      // check Credential exit after delete Connection
      const response = await CredentialAPI.get_all_credentials();
      const credentials: ICredentialObject[] = response.data.credentials || [];
      const hasCredential = credentials.some(cred => cred.connectionId === connectionId);

      if (hasCredential) {
        return {
          success: false,
          message: 'messages.credential_exit',
        };
      }

      // check Action exit after delete Connection
      const responseActions = await CredentialAPI.get_all_credentials_offers();
      const actions: Action[] = responseActions.data.offers || [];
      const hasActions = actions.some(action => action.connectionId === connectionId);

      if (hasActions) {
        return {
          success: false,
          message: 'messages.action_exit',
        };
      }

      await dispatch(removeConnection(connectionId)).unwrap();
      await dispatch(fetchAllConnectionList());

      return { success: true, message: 'messages.delete_connection_success' };
    } catch (error) {
      return { success: false, message: 'messages.delete_connection_fail' };
    }
  };

  return {
    acceptConnections,
    connectionlist,
    onAcceptConnection,
    onDeleteConnection,
    refreshConnections,
    fetchAcceptConnections,
  };
};

export default useConnections;
