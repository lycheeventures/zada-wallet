import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppColors, PRIMARY_COLOR, SECONDARY_COLOR } from '../theme/Colors';
import { TabStack } from './types';
// Store
import { useAppSelector } from '../store';

import { selectActionCount } from '../store/actions/selectors';
// Screens
import ActionsScreen from '../screens/action/ActionsScreen';
import ConnectionsScreen from '../screens/connection/ConnectionsScreen';
import CredentialsScreen from '../screens/credential/CredentialsScreen';
import { useTranslation } from 'react-i18next';

function TabNavigator() {
  // Constants
  const { t } = useTranslation();
  const actionCount = useAppSelector(selectActionCount);

  return (
    <TabStack.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';
          if (route.name === 'Actions') {
            iconName = 'notifications-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Connections') {
            iconName = 'swap-horizontal';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Credentials') {
            iconName = 'badge-account-horizontal-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          }
          // You can return any component that you like here!
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: AppColors.WHITE,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
        },
      })}>
      <TabStack.Screen
        name="Actions"
        component={ActionsScreen}
        options={{
          tabBarLabel: t('common.actions'),
          tabBarBadge: actionCount === 0 ? undefined : actionCount,
          headerShown: false,
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        }}
      />
      <TabStack.Screen
        name="Credentials"
        component={CredentialsScreen}
        options={{
          tabBarLabel: t('common.credentials'),
          headerShown: false,
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        }}
      />
      <TabStack.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={{
          tabBarLabel: t('common.connections'),
          headerShown: false,
          tabBarActiveTintColor: PRIMARY_COLOR,
          tabBarInactiveTintColor: SECONDARY_COLOR,
        }}
      />
    </TabStack.Navigator>
  );
}

export default TabNavigator;
