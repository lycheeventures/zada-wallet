import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TourProps {
  tooltipKey: string; // Unique key for each screen
  totalSteps: number; // How many steps in this screen's tour
  delay?: number; // Delay before showing (default 1000ms)
}

const useAppTooltip = ({ tooltipKey, totalSteps, delay = 600 }: TourProps) => {
  const [activeStep, setActiveStep] = useState<number>(0); // 0 means hidden

  useFocusEffect(
    useCallback(() => {
      const checkTourStatus = async () => {
        const hasSeen = await AsyncStorage.getItem(tooltipKey);

        // If not seen, start at step 1 after the delay
        if (!hasSeen) {
          setTimeout(() => {
            setActiveStep(1);
          }, delay);
        }
      };

      checkTourStatus();

      // Cleanup: hide tooltip if user navigates away
      return () => setActiveStep(0);
    }, [tooltipKey, delay])
  );

  const onNext = () => {
    if (activeStep < totalSteps) {
      setActiveStep(prev => prev + 1);
    } else {
      onDone();
    }
  };

  const onSkip = async () => {
    setActiveStep(0);
    await AsyncStorage.setItem(tooltipKey, 'true');
  };

  const onDone = async () => {
    setActiveStep(0);
    await AsyncStorage.setItem(tooltipKey, 'true');
  };

  return {
    activeStep,
    onNext,
    onSkip,
  };
};
export default useAppTooltip;
