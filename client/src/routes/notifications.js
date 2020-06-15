import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Container, TopMobileBar, Header } from "./rooms";
import Image from "../assets/whisper.png";
import MobileNav from "./nav";
import axios from "axios";
import { Redirect } from "react-router-dom";
import { colors } from "./login";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddContactIcon from "@material-ui/icons/PersonAdd";
import AlertDialog from "./alertDialog";

const Notification = styled.div`
  width: 100%;
  height: 65px;
  background-color: rgba(0, 0, 0, 0.045);
  display: flex;
  align-items: center;
`;

const Avatar = styled.div`
  height: 50px;
  width: 50px;
  border-radius: 50px;
  background-color: rgba(255, 255, 255, 0.85);
  margin-left: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 1px;
  font-size: 24px;
  color: ${colors.violet};
  text-transform: uppercase;
`;

const SubHeader = styled.h2`
  color: ${colors.violet};
  font-weight: 400;
  align-self: flex-start;
  margin-left: 15px;
`;
const Text = styled.h3`
  font-size: 16px;
  font-weight: 400;
  color: gray;
`;
const deleteStyle = { marginLeft: "auto", color: colors.red };

function Notifications(props) {
  const [contactRequests, setContactRequests] = useState([]);
  const [roomInv, setRoomInv] = useState([]);
  const [redirect, setRedirect] = useState(false);
  // Alert Dialog state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  // Check if the user is logged in
  useEffect(function () {
    checkAuth();
  }, []);
  useEffect(function () {
    getContactRequests();
  }, []);

  function checkAuth(e) {
    console.log("Checking Auth from contacts");
    axios
      .get("/checkAuth")
      .then(function (response) {
        if (response.data.auth === true) {
          setRedirect(false);
        } else {
          setRedirect(true);
        }
      })
      .catch((err) => console.log(err));
  }
  function getContactRequests(e) {
    console.log("Getting contact requests");
    axios
      .get("/contactRequests")
      .then(function (response) {
        if (response.data.error) {
          setRedirect(true);
        } else {
          setContactRequests(response.data.requests);
        }
      })
      .catch((err) => console.log(err));
  }
  function openDelete(e) {
    setTitle("Contact request rejection");
    setText("Do you want to delete this contact request?");
    setOpen(true);
  }
  function openAdd(e) {
    setTitle("Contact request confirmation");
    setText("Do you want to add this contact?");
    setOpen(true);
  }

  return (
    <Container>
      <TopMobileBar>
        <img alt="LOGO" src={Image} height="55" style={{ marginLeft: 15 }} />
        <Header>Notifications</Header>
      </TopMobileBar>
      <SubHeader>Contact Requests</SubHeader>
      {contactRequests && contactRequests.length !== 0 ? (
        contactRequests.map((req) => (
          <Notification key={req}>
            <Avatar>{req.substring(0, 2)}</Avatar>
            <label style={{ marginLeft: 15 }}>{req}</label>
            <IconButton
              aria-label="delete"
              style={deleteStyle}
              onClick={openDelete}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              aria-label="confirm"
              style={{ color: colors.violet }}
              onClick={openAdd}
            >
              <AddContactIcon />
            </IconButton>
          </Notification>
        ))
      ) : (
        <Text>You don't have any contact requests</Text>
      )}
      <SubHeader>Room invitations</SubHeader>
      {roomInv && roomInv.length === 0 ? (
        <Text>You don't have any room invitations</Text>
      ) : (
        contactRequests.map((req) => <Notification>{req}</Notification>)
      )}
      <AlertDialog open={open} title={title} text={text} />
      {redirect ? <Redirect to="/" /> : null}
      <MobileNav />
    </Container>
  );
}

export default Notifications;
