//  THIS IS NOT WORKING!!

import { useEffect } from 'react';
import { PreventScreenshots } from 'react-native-prevent-screenshots';

interface INProps {
  navigation: any;
}

const usePreventScreenshot = (props: INProps) => {
  useEffect(() => {
    const focusEvent = props.navigation.addListener('focus', () => {
      console.log('adding listener');
      PreventScreenshots.start();
    });
    const blurEvent = props.navigation.addListener('blur', () => {
      console.log('removing listerner');
      PreventScreenshots.stop();
    });

    return () => {
      focusEvent;
      blurEvent;
    };
  }, []);
};

export default usePreventScreenshot;
