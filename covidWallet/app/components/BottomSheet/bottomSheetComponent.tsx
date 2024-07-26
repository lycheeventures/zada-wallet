import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AppColors } from '../../theme/Colors';

interface IProps {
  component: () => React.ReactNode;
  headingText: string;
  headingTextColor?: string;
  backgroundColor?: string;
  onDismiss?: () => void;
  dismissOnTouchOutside?: boolean;
}
const BottomSheetComponent = (props: IProps) => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Constants
  const snapPoints = useMemo(() => ['25%', '35%'], []);
  const { headingText, component, backgroundColor, headingTextColor, onDismiss } = props;

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (onDismiss && index === -1) onDismiss();
  }, []);

  useEffect(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}>
        <BottomSheetView
          style={[
            styles.contentContainer,
            { backgroundColor: props.backgroundColor ? backgroundColor : AppColors.PRIMARY },
          ]}>
          <Text style={[styles.optionsTitle, { color: headingTextColor }]}>{headingText}</Text>
          {component()}
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default BottomSheetComponent;
