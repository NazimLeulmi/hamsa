import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme, Provider as PaperProvider, Text } from 'react-native-paper';
import Home from "./screens/home";
import SignIn from "./screens/signIn";
import SignUp from "./screens/signUp";
import Activate from './screens/activate';
import Tabs from './screens/tabs';
import { UserContext } from "./globalState";
import io from 'socket.io-client';

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

const App = () => {
  let [user, setUser] = React.useState();
  let [socket, setSocket] = React.useState();

  return (
    <UserContext.Provider value={{ user, setUser, socket, setSocket }}>
      <PaperProvider theme={theme} >
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" component={Home} />
            <Stack.Screen name="signUp" component={SignUp} />
            <Stack.Screen name="activate" component={Activate} />
            <Stack.Screen name="signIn" component={SignIn} />
            <Stack.Screen name="tabs" component={Tabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider >
    </UserContext.Provider >
  )
}

export default App;
