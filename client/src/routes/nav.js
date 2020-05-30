import React, { useContext } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsActiveIcon from '@material-ui/icons/NotificationsActive';
import ChatIcon from '@material-ui/icons/Chat';
import PeopleIcon from '@material-ui/icons/People';
import { SocketContext } from "../context";


export default function MobileNavigation() {
  const { route, setRoute } = useContext(SocketContext);

  const handleChange = (event, newValue) => {
    setRoute(newValue);
  };
  return (
    <BottomNavigation
      onChange={handleChange}
      value={route}
      showLabels
      style={{ width: "100%", position: "fixed", bottom: 0, backgroundColor: "rgba(255,255,255,.55)" }}
    >
      <BottomNavigationAction
        component={Link}
        to="/rooms"
        label="rooms"
        value="rooms"
        icon={<ChatIcon />}
      />
      <BottomNavigationAction
        component={Link}
        to="/contacts"
        label="contacts"
        value="contacts"
        icon={<PeopleIcon />}
      />
      <BottomNavigationAction
        component={Link}
        to="/notifications"
        label="notifications"
        value="notifications"
        icon={<NotificationsIcon />}
      />
    </BottomNavigation>
  );
}