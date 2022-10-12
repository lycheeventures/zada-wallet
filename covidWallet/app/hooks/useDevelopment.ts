import { useEffect, useState } from 'react';
import { showOKDialog } from '../helpers/Toast';
import { AppDispatch, persistor, useAppDispatch, useAppSelector } from '../store';
import { updateDevelopmentMode } from '../store/app';
import { selectDevelopmentMode } from '../store/app/selectors';
import { fetchCredentials } from '../store/credentials/thunk';

// Development mode feature
const useDevelopment = () => {
  // Constants
  const dispatch = <AppDispatch>useAppDispatch();

  // Selectors
  const developmentMode = useAppSelector(selectDevelopmentMode);

  // States
  const [longPressCount, setLongPressCount] = useState(0);
  const [pressCount, setPressCount] = useState(0);

  // Useeffects
  useEffect(() => {
    if (pressCount === 4) {
      setDevelopmentMode(true);
    }
  }, [pressCount]);

  useEffect(() => {
    persistor.purge();
    dispatch(fetchCredentials());
  }, [developmentMode]);

  // Button press
  const buttonPressed = () => {
    if (longPressCount === 3) {
      setPressCount((count) => count + 1);
      return;
    }
    setLongPressCount((count) => count + 1);
  };

  // Setting developmer mode
  const setDevelopmentMode = (val: boolean) => {
    dispatch(updateDevelopmentMode(val));
    if (val) showOKDialog('Congratulations!', 'Development mode enabled!');
  };

  return {
    pressCount,
    setDevelopmentMode,
    longPressCount,
    buttonPressed,
    developmentMode,
  };
};

export default useDevelopment;
