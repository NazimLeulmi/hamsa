import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import Paper from '@material-ui/core/Paper';
import MobileNav from "./nav";
import Image from '../assets/whisper.png';
import axios from "axios";
import { Redirect } from "react-router-dom";
import { colors } from "./login";
import Dialog from "./dialog";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/GroupAdd";
import { fabStyle } from "./contacts";
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
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");


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

  function openDialog() {
    setOpen(true);
  }
  function closeDialog() {
    setOpen(false);
  }
  function addRoom() {
    console.log("Create room on the backend");
  }
  return (
    <Container >
      <TopMobileBar>
        <img alt="Logo" src={Image} height="55" style={{ marginLeft: 15 }} />
        <Header>Rooms</Header>
      </TopMobileBar>
      <MobileNav />
      <Fab style={fabStyle} onClick={openDialog} > <AddIcon /> </Fab>
      <Dialog open={open}
        close={closeDialog}
        add={addRoom}
        name={roomName}
        setName={(value) => setRoomName(value)}
        error={error}
      />
      {redirect ? <Redirect to="/" /> : null}
    </Container>
  )
}
export default Rooms