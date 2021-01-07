import React from "react";
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Groups from "./groups";
import Social from "./social";
import Settings from "./settings";
import Notifications from "./notifications";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { enableScreens } from "react-native-screens";

const Tab = createMaterialBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Groups"
    >
      <Tab.Screen
        name="Groups"
        component={Groups}
        options={{
          tabBarLabel: 'Groups',
          tabBarColor: "#504469",
          tabBarIcon: ({ color }) => (
            <Icon name="groups" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Social"
        component={Social}
        options={{
          tabBarColor: "#FD708D",
          tabBarLabel: 'Posts',
          tabBarIcon: ({ color }) => (
            <Icon name="share" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{
          tabBarColor: "#D49496",
          tabBarLabel: 'Notifications',
          tabBarIcon: ({ color }) => (
            <Icon name="notifications" color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarColor: "#6D63F4",
          tabBarIcon: ({ color }) => (
            <Icon name="settings" color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
export default MyTabs;