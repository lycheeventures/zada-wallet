import { StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';
import Modal from 'react-native-modal';
import { AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { selectWebViewUrl } from '../store/app/selectors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '../theme/Colors';
import TouchableComponent from '../components/Buttons/TouchableComponent';
import { updateWebViewUrl } from '../store/app';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

const useWebview = () => {
  // Constants
  const dispatch = useAppDispatch<AppDispatch>();
  const { top } = useSafeAreaInsets();

  // Selectors
  const url = useAppSelector(selectWebViewUrl);

  // States
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        dispatch(updateWebViewUrl(''));
      }, 500);
    }
  }, [visible]);

  useEffect(() => {
    if (url !== '') {
      setVisible(true);
    }
  }, [url]);

  const onClose = () => {
    setVisible(false);
  };

  return (
    <Modal
      isVisible={visible}
      style={{ margin: 0, marginTop: top, padding: 0 }}
      backdropColor={AppColors.TRANSPARENT}
      backdropOpacity={1}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={500}
      animationOutTiming={500}
      backdropTransitionInTiming={500}
      backdropTransitionOutTiming={500}
      onBackButtonPress={onClose}>
      <View style={{ flex: 1, backgroundColor: AppColors.BACKGROUND }}>
        <View>
          <TouchableComponent style={styles.touchableStyle} onPress={onClose}>
            <Text>Close</Text>
          </TouchableComponent>
        </View>
        <WebView
          bounces={false}
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          source={{ uri: url }}
          allowsFullscreenVideo={false}
          containerStyle={{
            backgroundColor:"black",
            position: 'absolute',
            top: 40,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  touchableStyle: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginRight: 8,
    padding: 5,
    borderRadius: 18,
  },
  crossIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default useWebview;
