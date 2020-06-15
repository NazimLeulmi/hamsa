import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import Paper from '@material-ui/core/Paper';
import MobileNav from "./nav";
import Image from '../assets/whisper.png';
import axios from "axios";
import { Redirect } from "react-router-dom";
import { colors } from "./login";
axios.defaults.withCredentials = true

export const Container = styled.div`
  display:flex; flex-direction:column;
  align-items:center;
  position:relative;
  width:100%;
  height:100vh;
  background:${colors.white};
`;
export const TopMobileBar = styled.div`
  width:100%;
  height:60px;
  display:flex;
  align-items:center;
  background:${colors.violet};
`;
export const Header = styled.h1`
  color:${colors.white};
  font-weight:400;
`;
function Rooms(props) {
  // const [rooms, setRooms] = useState([]);
  const [redirect, setRedirect] = useState(false);
  useEffect(function () {
    checkAuth();
  }, [])
  function checkAuth(e) {
    console.log("Checking Auth from rooms");
    axios.get('/checkAuth')
      .then(function (response) {
        if (response.data.auth === true) {
          setRedirect(false);
        } else {
          setRedirect(true);
        }
      })
      .catch(err => console.log(err))
  }
  return (
    <Container >
      <TopMobileBar>
        <img alt="Logo" src={Image} height="55" style={{ marginLeft: 15 }} />
        <Header>Rooms</Header>
      </TopMobileBar>
      <MobileNav />
      {redirect ? <Redirect to="/" /> : null}
    </Container>
  )
}
export default Rooms