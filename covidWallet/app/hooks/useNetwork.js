import { useCallback, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch } from '../store';
import { updateNetworkStatus } from '../store/app';

const useNetwork = () => {
  // Constants
  const dispatch = useAppDispatch();

  // UseEffect
  useEffect(() => {
    // Subscribe
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      dispatch(updateNetworkStatus(state.isConnected ? 'connected' : 'disconnected'));
    });

    // Unsubscribe
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  // // Handling connection change.
  // const handleConnectionChange = useCallback(
  //   (isConnected) => {
  //     if (isConnected) {
  //       dispatch(updateNetworkStatus(isConnected ? 'connected' : 'disconnected'));
  //       NetInfo.isConnected.removeEventListener('connectionChange');
  //     } else {
  //       NetInfo.isConnected.removeEventListener('connectionChange');
  //     }
  //   },
  //   [dispatch]
  // );

  return undefined;
};

export default useNetwork;
