import React, { useState, useEffect, useContext } from "react";
// import styled from "styled-components";
// import Paper from "@material-ui/core/Paper";
import { Container } from "./rooms";
import MobileNav from "./nav";
import Dialog from "./dialog";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/GroupAdd";
import axios from "axios";
import { SocketContext } from "../context";
import { Redirect } from "react-router-dom";
axios.defaults.withCredentials = true;

const fabStyle = {
  position: "fixed",
  bottom: "75px",
  right: "20px",
};

function Contacts(props) {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [nameErrors, setNameErrors] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(SocketContext);

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
        if (response.data.isValid === false) {
          setNameErrors(response.data.errors);
          setLoading(false);
          return;
        }
      }).catch(err => console.log(err));
  }
  // Get all contacts from the server
  useEffect(function () {
  }, []);
  return (
    <Container>
      <h1>Contacts</h1>
      <Dialog open={open}
        close={closeDialog}
        add={addContact}
        name={name}
        setName={(value) => setName(value)}
        errors={nameErrors}
        loading={loading}
      />
      <Fab
        color="primary"
        aria-label="add"
        style={fabStyle}
        onClick={openDialog}
      >
        <AddIcon />
      </Fab>
      <MobileNav />
      {user ? null : <Redirect to="/" />}
    </Container>
  );
}

export default Contacts;
