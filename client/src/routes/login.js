import React, { useState } from "react";
import styled from "styled-components";
import { Link as lnk } from "react-router-dom";
import { TextField, Button, Typography } from "@material-ui/core";
import { StylesProvider } from '@material-ui/core/styles';
import Image from "../assets/whisper.png";

export const Form = styled.form`
  display:flex; flex-direction:column;
  align-items:center;
  position:relative;
  width:100%;
  height:100vh;
  background-color:lightblue;
`;
export const Header = styled(Typography)`
  margin-top:10px;
`;
export const Input = styled(TextField)`
  position:relative;
  width:90%; 
  height:56px;
  margin-top: 10px;
`;
export const Btn = styled(Button)`
  width:90%; height:56px;
  margin-top: 10px;
  background-color:rgba(255,255,255,.35)
`;
export const Img = styled.img`
  width:125px;
  background: rgba(0,0,0,.15);
  border-radius: 50%;
`;
export const Link = styled(lnk)`
  text-decoration:none;
  margin-top:15px;
`;


function LoginPage(props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  /* const [socket] = useContext(SocketContext); */

  function handleChange(e) {
    if (e.target.name === "password") {
      setPassword(e.target.value)
    } else if (e.target.name === "name") {
      setName(e.target.value)
    }
  }

  return (
    <StylesProvider injectFirst>
      <Form>
        <Header variant="h2" align="center">Hamsa</Header>
        <Img src={Image} />
        <Input
          variant="filled" label="Name"
          name="name" value={name} onChange={handleChange}
          placeholder="Name"
        />
        <Input
          variant="filled" label="Password"
          name="password" value={password} onChange={handleChange}
          placeholder="Password"
        />
        <Btn children={"LOGIN"} variant="contained" />
        <Link to="/register">Don't have an account ? REGISTER NOW</Link>
      </Form>
    </StylesProvider>
  )
}

export default LoginPage;