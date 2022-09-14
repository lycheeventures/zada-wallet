import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch } from '../store';
import { updateNetworkStatus } from '../store/app';

const useNetwork = () => {
  // Constants
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Subscribe
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(updateNetworkStatus(state.isConnected ? 'connected' : 'disconnected'));
    });

    // Unsubscribe
    unsubscribe();
  }, [dispatch]);

  return undefined;
};

export default useNetwork;
