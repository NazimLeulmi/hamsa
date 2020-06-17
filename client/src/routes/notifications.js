import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";
import { Redirect } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddContactIcon from "@material-ui/icons/PersonAdd";
import AlertDialog from "./alertDialog";
import Image from "../assets/whisper.png";
import MobileNav from "./nav";
import { Container, TopMobileBar, Header } from "./rooms";
import { colors } from "./login";

axios.defaults.withCredentials = true;

export const Row = styled.div`
  width: 100%;
  height: 65px;
  background-color: rgba(0, 0, 0, 0.045);
  display: flex;
  align-items: center;
`;

export const Avatar = styled.div`
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
export const Text = styled.h3`
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
  const [current, setCurrent] = useState("");
  const [target, setTarget] = useState("");

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
  function openRejectContact(e) {
    const currentTarget = e.currentTarget.parentNode.textContent.substring(2);
    setTitle("Request rejection");
    setText(`Do you want to reject ${currentTarget}'s contact request?`);
    setCurrent("rejectContact");
    setOpen(true);
    setTarget(currentTarget);
  }
  function openConfirmContact(e) {
    const currentTarget = e.currentTarget.parentNode.textContent.substring(2);
    setTitle("Request confirmation");
    setText(`Do you want to add ${currentTarget} to your contacts list?`);
    setCurrent("confirmContact");
    setOpen(true);
    setTarget(currentTarget);
  }
  function openRejectInv(e) {
    const currentTarget = e.currentTarget.parentNode.textContent.substring(2);
    setTitle("Room invitation rejection");
    setText(`Do you want to reject ${currentTarget}'s invitation?` );
    setCurrent("rejectInv");
    setOpen(true);
    setTarget(currentTarget);
  }
  function openConfirmInv(e) {
    const currentTarget = e.currentTarget.parentNode.textContent.substring(2);
    setTitle("Room invitation confirmation");
    setText(`Do you want to join ${currentTarget}?` );
    setCurrent("confirmInv");
    setOpen(true);
    setTarget(currentTarget);
  }
  // confirm current action
  function confirm(e){
    switch (current) {
      case "rejectContact":
        axios.post("/rejectContact",{name:target})
          .then(res=>{
            console.log(res.data);
            setOpen(false);
          }).catch(err=>console.log(err));
        break;
      case "confirmContact":
        axios.post("/confirmContact",{name:target})
          .then(res=>{
            console.log(res.data);
            setOpen(false);
          }).catch(err=>console.log(err));
        break;
      case "rejectInv":
        // do something
        break;
      case "confirmInv":
        // do something
        break;
      default:
        console.log("Something wrong happened");
        break;
    }
  }
  return (
    <Container>
      <TopMobileBar>
        <img alt="LOGO" src={Image} height="55" style={{ marginLeft: 15 }} />
        <Header>Notifications</Header>
      </TopMobileBar>
      <SubHeader>Contact Requests</SubHeader>
      {contactRequests && contactRequests.length !== 0 ? 
        contactRequests.map(req => (
          <Row key={req}>
            <Avatar>{req.substring(0, 2)}</Avatar>
            <label style={{ marginLeft: 15 }}>{req}</label>
            <IconButton
              aria-label="delete"
              style={deleteStyle}
              onClick={openRejectContact}
            >
              <DeleteIcon />
            </IconButton>
            <IconButton
              aria-label="confirm"
              style={{ color: colors.violet }}
              onClick={openConfirmContact}
            >
              <AddContactIcon />
            </IconButton>
          </Row>
        ))
       : <Text>You don't have any contact requests</Text>
      }
      <SubHeader>Room invitations</SubHeader>
      {roomInv && roomInv.length === 0 ? (
        <Text>You don't have any room invitations</Text>
      ) : (
        roomInv.map((req) => <Row>{req}</Row>)
      )}
      <AlertDialog open={open} confirm={confirm} cancel={()=>setOpen(false)} title={title} text={text} />
      {redirect ? <Redirect to="/" /> : null}
      <MobileNav />
    </Container>
  );
}

export default Notifications;
