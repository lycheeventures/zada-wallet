import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';

export type AuthStackParamList = {
  IntroScreen: undefined;
  WelcomeScreen: undefined;
  AuthScreen: undefined;
  ForgotPasswordScreen: undefined;
  MultiFactorScreen: { from: 'Register' | 'Login' };
  PassCodeContainer: undefined;
  SecurityScreen: { navigation: NativeStackNavigationProp<AuthStackParamList> };
  SecureidContainer: undefined;
  NotifyMeScreen: undefined;
};

export type MainStackParamList = {
  MainScreen: undefined;
  SettingsScreen: undefined;
  ContactUs: undefined;
  AboutUs: undefined;
  ProfileScreen: undefined;
  DetailsScreen: undefined;
  AuthScreen: undefined;
  QRScreen: undefined;
};

export type TabStackParamList = {
  Actions: undefined;
  Certificates: undefined;
  Connections: undefined;
};

export type ICombinedParamList = AuthStackParamList & MainStackParamList & TabStackParamList;

const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const TabStack = createBottomTabNavigator<TabStackParamList>();

export type MainStackNavigationProp = NativeStackNavigationProp<MainStackParamList>;

export { AuthStack, MainStack, TabStack };
