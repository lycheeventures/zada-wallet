import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { selectToken } from '../store/auth/selectors';
import { updateIsAuthorized } from '../store/auth';
import { checkIfWalletExist } from '../screens/utils';

const useAppInit = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        const walletExists = checkIfWalletExist(token);
        dispatch(updateIsAuthorized(walletExists));
      } else {
        dispatch(updateIsAuthorized(false));
      }

      setIsAppReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [token, dispatch]);

  return {
    isAppReady,
  };
};

export default useAppInit;
