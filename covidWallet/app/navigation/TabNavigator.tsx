import * as React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { PRIMARY_COLOR, SECONDARY_COLOR } from '../theme/Colors';
import { TabStack } from './types';
// Store
import { useAppSelector } from '../store';
import { selectActionCount } from '../store/actions/selectors';
// Screens
import ActionsScreen from '../screens/action/ActionsScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import CredentialsScreen from '../screens/credential/CredentialsScreen';

function TabNavigator() {
  // Constants
  const actionCount = useAppSelector(selectActionCount);

  return (
    <TabStack.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Actions') {
            iconName = 'md-notifications-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Connections') {
            iconName = 'ios-git-network';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Certificates') {
            iconName = 'account-badge-horizontal-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          }
          // You can return any component that you like here!
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
      })}>
      <TabStack.Screen
        name="Actions"
        component={ActionsScreen}
        options={{
          tabBarBadge: actionCount === 0 ? undefined : actionCount,
          headerShown: false,
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        }}
      />
      <TabStack.Screen
        name="Certificates"
        component={CredentialsScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        }}
      />
      <TabStack.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        }}
      />
    </TabStack.Navigator>
  );
}

export default TabNavigator;
