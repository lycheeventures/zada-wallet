import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import {
    Splash
} from '../screens';
import { ROUTES } from './routes';
import AuthNavigator from './AuthNavigator';

const Stack = createStackNavigator();

const RootNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName={ROUTES.AUTH}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name={ROUTES.SPLASH}
                component={Splash}
            />
            <Stack.Screen
                name={ROUTES.AUTH}
                component={AuthNavigator}
            />
        </Stack.Navigator>
    );
}

export default RootNavigator;