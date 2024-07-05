import { useEffect, useState } from 'react';
import { AppDispatch, store, useAppDispatch, useAppSelector } from '../store';
import { selectBaseUrl, selectDevelopmentMode } from '../store/app/selectors';
import { updateBaseUrl } from '../store/app';
import ConfigApp from '../helpers/ConfigApp';
import { setup } from '../gateways/http_client';

// Development mode feature
const useEnvironmentSwitch = () => {
  // Constants
  const dispatch = <AppDispatch>useAppDispatch();

  //selectors
  const baseUrl = useAppSelector(selectBaseUrl)

  // States
  const [longPressCount, setLongPressCount] = useState(0);
  const [pressCount, setPressCount] = useState(0);
  const [openEnvOptionsModal, setEnvOptionsModal] = useState(false);
  const [selectedEnvOption, setSelectedEnvOption] = useState('Production Environment');

  const closeEnvOptionsModal = () => {
    setEnvOptionsModal(false);
    setPressCount(0);
    setLongPressCount(0);
  }

  // Useeffects
  useEffect(() => {
    if (pressCount === 4) {
      setEnvOptionsModal(true);
      setPressCount(0);
      setLongPressCount(0);
    }
  }, [pressCount]);

  // Button press
  const buttonPressed = () => {
    if (longPressCount === 3) {
      setPressCount((count) => count + 1);
      return;
    }
    setLongPressCount((count) => count + 1);
  };

  useEffect(() => {
    const apiUrl = selectedEnvOption === 'Production Environment' ? ConfigApp.PROD_BASE_URL : ConfigApp.TEST_BASE_URL;
    if (baseUrl === apiUrl) return;
    dispatch(updateBaseUrl(apiUrl));
    setup(store, apiUrl);
    closeEnvOptionsModal();
  }, [selectedEnvOption]);

  return {
    pressCount,
    longPressCount,
    buttonPressed,
    openEnvOptionsModal,
    closeEnvOptionsModal,
    setSelectedEnvOption,
    selectedEnvOption
  };
};

export default useEnvironmentSwitch;
