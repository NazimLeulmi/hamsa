import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme, Provider as PaperProvider, Text } from 'react-native-paper';
import Home from "./screens/home";
import Login from "./screens/login";
import Register from "./screens/register";

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4C4981',
    // accent: 'palevioletred',
  },
};

const Stack = createStackNavigator();

const App = () => (
  <PaperProvider theme={theme} >
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="register" component={Register} />
        <Stack.Screen name="login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  </PaperProvider>
)

export default App;
