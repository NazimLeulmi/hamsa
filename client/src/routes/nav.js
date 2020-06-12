import React, { useContext, useEffect } from 'react';
import { Link } from "react-router-dom";
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ChatIcon from '@material-ui/icons/Chat';
import PeopleIcon from '@material-ui/icons/People';
import { SocketContext } from "../context";
import { colors } from "./login";




export default function MobileNavigation() {
  const { route, setRoute } = useContext(SocketContext);
  useEffect(function () {
    const pathname = window.location.pathname;
    if (pathname === "/") return;
    const parsedRoute = pathname.substring(1);
    console.log(parsedRoute);
    setRoute(parsedRoute);
  }, [])

  const handleChange = (event, newValue) => {
    setRoute(newValue);
  };

  return (
    <BottomNavigation
      onChange={handleChange}
      value={route}
      showLabels
      style={{ width: "100%", position: "fixed", bottom: 0, backgroundColor: colors.violet }}
    >
      <BottomNavigationAction
        component={Link}
        to="/rooms"
        label="rooms"
        value="rooms"
        icon={<ChatIcon />}
        style={{ color: route === "rooms" ? "white" : "lightgray" }}
      />
      <BottomNavigationAction
        component={Link}
        to="/contacts"
        label="contacts"
        value="contacts"
        icon={<PeopleIcon />}
        style={{ color: route === "contacts" ? "white" : "lightgray" }}
      />
      <BottomNavigationAction
        component={Link}
        to="/notifications"
        label="notifications"
        value="notifications"
        icon={<NotificationsIcon />}
        style={{ color: route === "notifications" ? "white" : "lightgray" }}
      />
    </BottomNavigation>
  );
}