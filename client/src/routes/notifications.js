import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { Container, TopMobileBar, Header } from "./rooms";
import Image from '../assets/whisper.png';
import MobileNav from "./nav";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { SocketContext } from "../context";
import { colors } from "./login";

const Notification = styled.div`
  width:100%;
  height:65px;
  background-color:rgba(0,0,0,.25);
  display:flex;
  align-items:center;
`;

const Avatar = styled.div`
  height:50px;
  width:50px;
  border-radius:50px;
  background-color:rgba(255,255,255,.45);
  margin-left:15px;
  display:flex;
  align-items:center;
  justify-content:center;
  letter-spacing:1px;
  font-size:24px;
  color:${colors.violet};
`;


function Notifications(props) {
  const [contactRequests, setContactRequests] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const { user, setUser } = useContext(SocketContext);

  // Check if the user is logged in
  useEffect(function () {
    checkAuth();
  }, [])
  useEffect(function () {
    getContactRequests();
  }, [])

  function checkAuth(e) {
    console.log("Checking Auth from contacts");
    axios.get('/checkAuth')
      .then(function (response) {
        if (response.data.auth === true) {
          setUser(response.data.user);
          setRedirect(false);
        } else {
          setUser(null);
          setRedirect(true);
        }
      })
      .catch(err => console.log(err))
  }
  function getContactRequests(e) {
    console.log("Getting contact requests");
    axios.get('/contactRequests')
      .then(function (response) {
        if (response.data.error) {
          setRedirect(true);
        } else {
          setContactRequests(response.data.contactRequests);
          console.log(response.data.requests);
        }
      })
      .catch(err => console.log(err))
  }


  return (
    <Container>
      <TopMobileBar>
        <img src={Image} height="55" style={{ marginLeft: 15 }} />
        <Header>Notifications</Header>
      </TopMobileBar>
      <Notification >
        <Avatar>AC</Avatar>
      </Notification>
      {redirect ? <Redirect to="/" /> : null}
      <MobileNav />
    </Container>
  )
}

export default Notifications;