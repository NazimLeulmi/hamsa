import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import MobileNav from "./nav";
import Dialog from "./dialog";
import Image from '../assets/whisper.png';
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/GroupAdd";
import { colors } from "./login";
import { Container, TopMobileBar, Header } from "./rooms";
import { Row, Avatar, Text } from "./notifications";


axios.defaults.withCredentials = true;

const fabStyle = {
  position: "fixed",
  bottom: "75px",
  right: "20px",
  color: colors.violet
};

function Contacts(props) {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [errors, setErrors] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  useEffect(function () {
    checkAuth();
  }, [])
  useEffect(function () {
    getContacts();
  }, [])
  function checkAuth(e) {
    console.log("Checking Auth from contacts");
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
  function addContact() {
    setLoading(true);
    axios.post("/addContact", { name })
      .then(function (response) {
        setLoading(false);
        if (response.data.isValid === false) {
          setErrors(response.data.errors);
          return;
        }
        setOpen(false);
      }).catch(err => console.log(err));
  }
  function getContacts(e) {
    axios.get("/contacts")
      .then(function (response) {
        if (response.data.error) {
          setRedirect(true);
        } else {
          console.log("Fetched contacts");
          setContacts(response.data.contacts);
        }
      })
      .catch((err) => console.log(err));
  }
  return (
    <Container>
      <TopMobileBar>
        <img src={Image} height="55" style={{ marginLeft: 15 }} alt="Logo" />
        <Header>Contacts</Header>
      </TopMobileBar>
      {contacts.length === 0 ? <Text>You don't have any contacts</Text> :
        contacts.map(contact => (
          <Row key={contact}>
            <Avatar>{contact.substring(0, 2)}</Avatar>
            <label style={{ marginLeft: 15 }}>{contact}</label>
          </Row>
        ))
      }
      <Fab style={fabStyle} onClick={openDialog} > <AddIcon /> </Fab>
      <Dialog open={open}
        close={closeDialog}
        add={addContact}
        name={name}
        setName={(value) => setName(value)}
        errors={errors}
        loading={loading}
      />
      <MobileNav />
      {redirect ? <Redirect to="/" /> : null}
    </Container>
  );
}

export default Contacts;
