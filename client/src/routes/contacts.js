import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import { Container } from "./rooms";
import MobileNav from "./nav";

function Contacts(props) {
  const [contacts, setContacts] = useState([]);

  return (
    <Container>
      <h1>Contacts</h1>
      <MobileNav />
    </Container>
  )
}

export default Contacts