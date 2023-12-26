import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { selectConnectionList, selectConnections } from '../store/connections/selectors';
import {
  acceptConnection,
  fetchConnectionList,
  fetchConnections,
  removeConnection,
} from '../store/connections/thunk';
import { updateConnectionlist } from '../store/connections';
import { selectUser } from '../store/auth/selectors';

const useConnections = () => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();

  // Selectors
  const user = useAppSelector(selectUser);
  const connections = useAppSelector(selectConnections.selectAll);
  const allConnectionlist = useAppSelector(selectConnectionList);
  const connectionlist = useAppSelector(selectConnectionList).map(item => {
    return { label: item.name, value: item.metadata, imageUrl: item.image };
  });

  // Functions
  const refreshConnections = () => {
    dispatch(fetchConnections());
  };

  const onAcceptConnection = (metadata: string) => {
    dispatch(acceptConnection(metadata)).then(() => {
      let newList = allConnectionlist.filter(item => item.metadata !== metadata);
      dispatch(updateConnectionlist(newList));
    });
  };

  const onDeleteConnection = (connectionId: string) => {
    dispatch(removeConnection(connectionId)).then(() => {
      dispatch(fetchConnectionList(user.country));
    });
  };

  return {
    connections,
    connectionlist,
    onAcceptConnection,
    onDeleteConnection,
    refreshConnections,
  };
};

export default useConnections;
