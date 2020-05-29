import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import MobileNav from "./nav";


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

  return (
    <Container>
      <h1>Rooms</h1>
      <MobileNav />
    </Container>
  )
}
export default Rooms