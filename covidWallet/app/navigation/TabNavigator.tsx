import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ActionsScreen from '../screens/action/ActionsScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import CredentialsScreen from '../screens/credential/CredentialsScreen';
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../theme/Colors';
import { useAppSelector } from '../store';
import { selectActionCount } from '../store/actions/selectors';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  // Constants
  const actionCount = useAppSelector(selectActionCount);

  return (
    <Tab.Navigator
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
      })}
      tabBarOptions={{
        activeTintColor: PRIMARY_COLOR,
        inactiveTintColor: SECONDARY_COLOR,
      }}>
      <Tab.Screen
        name="Actions"
        component={ActionsScreen}
        options={{ tabBarBadge: actionCount === 0 ? undefined : actionCount }}
      />
      <Tab.Screen name="Certificates" component={CredentialsScreen} />
      <Tab.Screen name="Connections" component={ConnectionsScreen} />
    </Tab.Navigator>
  );
}

export default TabNavigator;
