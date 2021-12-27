import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {
    Welcome
} from '../screens';
import { ROUTES } from './routes';

const Stack = createStackNavigator();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName={ROUTES.WELCOME}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name={ROUTES.WELCOME}
                component={Welcome}
            />
        </Stack.Navigator>
    );
}

export default AuthNavigator;