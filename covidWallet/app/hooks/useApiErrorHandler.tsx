import React, { useEffect } from 'react';
import { _showAlert, showNetworkMessage } from '../helpers';

const useApiErrorHandler = (error: any) => {
  useEffect(() => {
    if (!error?.message) return;

    const result = error.message.toString();

    if (result === 'Network Error') {
      setTimeout(showNetworkMessage, 500);
    } else if (result.startsWith('custom:')) {
      const errorMessage = result.split(':')[1] || 'Something went wrong';
      _showAlert('Error', errorMessage);
    } else {
      _showAlert('Error', 'Something went wrong. Please try again.');
    }
  }, [error]);
};

export default useApiErrorHandler;
