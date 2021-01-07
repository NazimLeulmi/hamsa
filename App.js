import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme, Provider as PaperProvider, Text } from 'react-native-paper';
import Home from "./screens/home";
import Login from "./screens/login";
import Register from "./screens/register";
import Activate from './screens/activate';
import Tabs from './screens/tabs';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#504469',
    accent: '#0B040B',
  },
};

const Stack = createStackNavigator();

const App = () => (
  <PaperProvider theme={theme} >
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="register" component={Register} />
        <Stack.Screen name="activate" component={Activate} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="tabs" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  </PaperProvider>
)

export default App;
