import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import MobileNav from "./nav";
import axios from "axios";
import { SocketContext } from "../context";
import { Redirect } from "react-router-dom";
axios.defaults.withCredentials = true

export const Container = styled.form`
  display:flex; flex-direction:column;
  align-items:center;
  position:relative;
  width:100%;
  height:100vh;
  background-color:lightblue;
`;
function Rooms(props) {
  const [rooms, setRooms] = useState([]);
  const { user, setUser } = useContext(SocketContext);
  function checkAuth(e) {
    console.log("Checking Auth");
    axios.get('/checkAuth')
      .then(function (response) {
        if (response.data.auth === true) {
          setUser(response.data.user);
          return;
        } else {
          setUser(null);
        }
      })
      .catch(err => console.log(err))
  }

  return (
    <Container>
      <h1>Rooms</h1>
      <MobileNav />
      {user ? null : <Redirect to="/" />}
    </Container>
  )
}
export default Rooms