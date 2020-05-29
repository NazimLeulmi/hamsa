import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import { Container } from "./rooms";
import MobileNav from "./nav";

function Notifications(props) {
  const [Notifications, setNotifications] = useState([]);

  return (
    <Container>
      <h1>Notifications</h1>
      <MobileNav />
    </Container>
  )
}

export default Notifications;