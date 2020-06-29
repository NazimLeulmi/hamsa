import React, { useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import Input from "./components/input";
import Form from "./components/form";
import Link from "./components/link";
import Logo from "./components/logo";
import Btn from "./components/button";


function LoginPage(props) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirect, setRedirect] = useState(false);

  // useEffect(function () {
  //   checkAuth();
  // }, [])

  function handleChange(e) {
    if (e.target.name === 'password') {
      setPassword(e.target.value)
    } else if (e.target.name === 'name') {
      setName(e.target.value)
    }
  }
  // function checkAuth(e) {
  //   console.log("Checking Auth");
  //   axios.get('/checkAuth')
  //     .then(function (response) {
  //       if (response.data.auth === true) {
  //         setRedirect(true);
  //       } else {
  //         setRedirect(false);
  //       }
  //     })
  //     .catch(err => console.log(err))
  // }
  // function submitForm() {
  //   // client validation
  //   axios.post('/login', { name, password })
  //     .then(function (response) {
  //       if (response.data.isValid === false) {
  //         setError(response.data.error);
  //         return;
  //       }
  //       setError("")
  //       setRedirect(true);
  //     })
  //     .catch(err => console.log(err));
  // }


  return (
    <Form >
      <Typography variant="h2" component="h1" color="primary">Hamsa</Typography>
      <Logo />
      <Input
        type='text' label='Name' placeholder='Name'
        name='name' value={name} onChange={handleChange}
      />
      <Input
        type='password' label='Password' placeholder='Password'
        name='password' value={password} onChange={handleChange}
      />
      <Btn children='LOGIN' variant='contained' />
      <Link href='/register' text="Don't have an account ?" span='REGISTER HERE' />

    </Form>
  )
}

export default LoginPage;
