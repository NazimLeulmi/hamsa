import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link as lnk  , Redirect} from 'react-router-dom';
import { TextField, Button, Typography } from '@material-ui/core';
import { StylesProvider } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import Image from '../assets/whisper.png';
import axios from "axios";
axios.defaults.withCredentials = true;
export const colors = {
  "violet": "#726E97", // Rhythm
  "white": "#FDFFFC", // Baby Powder
  "blue": "#009FB7", // Blue Munsell
  "red": "#A5243D"  // Vivid Burgundy
}
export const Form = styled.form`
  display:flex; flex-direction:column;
  align-items:center;
  position:relative;
  width:100%;
  height:100vh;
  background-color:${colors.white};
`;
export const Header = styled(Typography)`
  margin-top:10px;
  color:${colors.violet};
  font-weight:200;
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
  background-color:${colors.violet};
  color:${colors.white};
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
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const [redirect, setRedirect] = useState(false);


  useEffect(function () {
    checkAuth();
  },[])

  function handleChange(e) {
    if (e.target.name === 'password') {
      setPassword(e.target.value)
    } else if (e.target.name === 'name') {
      setName(e.target.value)
    }
  }
  function checkAuth(e) {
    console.log("Checking Auth");
    axios.get('/checkAuth')
      .then(function (response) {
        if (response.data.auth === true) {
          setRedirect(true);
        } else {
          setRedirect(false);
        }
      })
      .catch(err => console.log(err))
  }
  function submitForm() {
    // client validation
    axios.post('/login', { name, password })
      .then(function (response) {
        if (response.data.isValid === false) {
          setErrors(response.data.errors);
          return;
        }
        setErrors([]);
        setRedirect(true);
      })
      .catch(err => console.log(err));
  }


  return (
    <StylesProvider injectFirst>
      <Form>
        <Header variant='h2' align='center'>Hamsa</Header>
        <Img src={Image} />
        <Input
          variant='filled' label='Name'
          name='name' value={name} onChange={handleChange}
          placeholder='Name' type='text'
        />
        <Input
          variant='filled' label='Password'
          name='password' value={password} onChange={handleChange}
          placeholder='Password' type='password'
        />
        <Btn children={'LOGIN'} variant='contained' onClick={submitForm} />
        <Link to='/register'>Don't have an account ? REGISTER NOW</Link>
        {errors.length === 0 ? null :
          <Alert severity="info" style={{
            width: "80%", textAlign: "center", marginTop: 50
          }}>
            {errors[0]}
          </Alert>
        }
        {redirect ? <Redirect to="/rooms" /> : null}
      </Form>
    </StylesProvider>
  )
}

export default LoginPage;
