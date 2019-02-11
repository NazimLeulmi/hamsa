import React, { Component } from "react";
import { createSwitchNavigator } from "react-navigation";
import Login from "./screens/Login";
// import Chat from "./screens/Chat";
import Register from "./screens/Register";
import Profile from "./screens/Profile";
import Rooms from "./screens/Rooms";
console.disableYellowBox = true;
const Router = createSwitchNavigator({
  login: Login,
  register: Register,
  rooms: Rooms,
  profile: Profile,
}, {
    "initialRouteName": "login"
  });

export default class extends Component {


  render() {
    return <Router
    />
  }
}