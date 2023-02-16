import { StackScreenProps } from '@react-navigation/stack';
import { ICombinedParamList } from './types';

import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

// export const navigationRef = React.createRef<StackNavigationProp<ICombinedParamList>>();

export const navigationRef = createNavigationContainerRef<ICombinedParamList>();
export function navigate(
  name: keyof ICombinedParamList,
  params?: StackScreenProps<ICombinedParamList>['route']['params']
) {
  if (navigationRef.current) {
    navigationRef.current?.navigate(name, params);
  }
}
