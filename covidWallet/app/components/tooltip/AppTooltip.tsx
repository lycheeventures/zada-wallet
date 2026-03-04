import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { AppColors } from '../../theme/Colors';

interface AppTooltipProps {
  isVisible: boolean;
  message: string;
  onNext: () => void;
  onSkip: () => void;
  isLastStep?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  spacing?: number;
  arrowSize?: { width: number; height: number };
  children: ReactNode;
}

const AppTooltip: React.FC<AppTooltipProps> = ({
  isVisible,
  message,
  onNext,
  onSkip,
  isLastStep = false,
  placement = 'top',
  spacing = 10,
  arrowSize = { width: 16, height: 8 },
  children,
}) => {
  return (
    <Tooltip
      isVisible={isVisible}
      content={
        <View style={styles.dialogContainer}>
          <Text style={styles.dialogMessage}>{message}</Text>

          <View style={styles.dialogFooter}>
            {!isLastStep ? (
              <>
                <TouchableOpacity style={styles.dialogAction} onPress={onSkip}>
                  <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.dialogAction} onPress={onNext}>
                  <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.finishAction} onPress={onNext}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      }
      placement={placement}
      showChildInTooltip={false}
      childContentSpacing={spacing}
      closeOnBackgroundInteraction={false}
      closeOnChildInteraction={false}
      closeOnContentInteraction={false}
      arrowSize={arrowSize}
      allowChildInteraction={false}
      backgroundColor="rgba(0,0,0,0.5)">
      {children}
    </Tooltip>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    backgroundColor: 'white',
    padding: 8,
  },
  dialogMessage: {
    fontSize: 14,
    textAlign: 'left',
    color: '#444',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  dialogAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  finishAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  skipText: {
    color: AppColors.BLACK,
    fontSize: 15,
  },
  nextText: {
    color: AppColors.BRIGHT_GREEN,
    fontSize: 15,
    fontWeight: '600',
  },
  doneText: {
    color: AppColors.BRIGHT_GREEN,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default AppTooltip;
