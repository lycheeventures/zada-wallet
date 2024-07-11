//  THIS IS NOT WORKING!!

import { useEffect } from 'react';
import { PreventScreenshots } from 'react-native-prevent-screenshots';

interface INProps {
  navigation: any;
}

const usePreventScreenshot = (props: INProps) => {
  useEffect(() => {
    const focusEvent = props.navigation.addListener('focus', () => {
      PreventScreenshots.start();
    });
    const blurEvent = props.navigation.addListener('blur', () => {
      PreventScreenshots.stop();
    });

    return () => {
      focusEvent;
      blurEvent;
    };
  }, []);
};

export default usePreventScreenshot;
