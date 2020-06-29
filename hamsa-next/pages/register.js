import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Input from "./components/input";
import Form from "./components/form";
import Link from "./components/link";
import Logo from "./components/logo";
import Btn from "./components/button";
import Alert from "./components/alert";



function Register(props) {
  // Form state
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordc, setPasswordc] = useState('');
  const [error, setError] = useState('');
  // Antispam question
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState(''); // a + b = antispam answer
  // Security question
  const [question, setQuestion] = useState('');
  const [reset, setReset] = useState(''); // answer
  // Alert state
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState('');
  // State
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(function () {
    setA(rand(1, 10));
    setB(rand(1, 10));
  }, [])

  function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
  // function submitForm(e) {
  //   console.log("submiting the form");
  //   e.preventDefault();
  //   setLoading(true);
  //   axios.post('/validate', { name, password, passwordc, answer, a, b })
  //     .then(async function (response) {
  //       if (response.data.isValid === false) {
  //         setAlert(response.data.errors[0]);
  //         setSeverity('error');
  //         setOpen(true)
  //         setLoading(false);
  //         return;
  //       }
  //       const keyPair = await genKeyPair();
  //       const pubKeyPem = await exportPubKey(keyPair.publicKey);
  //       const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  //       const request = indexedDB.open('hamsaDB', 1);
  //       request.onerror = function (event) {
  //         console.log('Request Error', event.target.errorCode);
  //       };
  //       request.onupgradeneeded = function (event) {
  //         const db = request.result;
  //         db.createObjectStore('keyPairs', { keyPath: 'name' });
  //         console.log('IndexeDB store has been created');
  //       }
  //       request.onsuccess = (event) => {
  //         const db = request.result;
  //         const keyPairsStore = db.transaction('keyPairs', 'readwrite').objectStore('keyPairs');
  //         db.onerror = function (event) {
  //           console.log('DB transaction error', event.target.errorCode);
  //         }
  //         keyPairsStore.put({ name: name, public: pubKeyPem, private: keyPair.privateKey })
  //         keyPairsStore.transaction.oncomplete = (event) => {
  //           db.close();
  //           axios.post('/register', { name, password, publicKey: pubKeyPem })
  //             .then(function (response) {
  //               if (response.data.registered === true) {
  //                 setAlert('You have been registered');
  //                 setSeverity('success');
  //                 setOpen(true)
  //                 setLoading(false);
  //                 setTimeout(() => setRegistered(true), 1500);
  //               }
  //             })
  //             .catch(err => console.log(err))
  //         }
  //       }
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //     });
  // }
  function handleClose(e, reason) {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  function handleChange(e) {
    switch (e.target.name) {
      case 'name':
        setName(e.target.value);
        break;
      case 'password':
        setPassword(e.target.value);
        break;
      case 'passwordc':
        setPasswordc(e.target.value);
        break;
      case 'answer':
        setAnswer(e.target.value);
        break;
      default:
        console.log('Something went wrong!')
        break;
    }
  }
  // Generate an RSA-OAEP encryption/decryption key pair
  function genKeyPair() {
    return window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-256' }, //can be 'SHA-1', 'SHA-256', 'SHA-384', or 'SHA-512'
      },
      false, // set extractable:false to prevent xss to access the private key
      ['encrypt', 'decrypt']
    );
  }
  // Export the public RSA encryption key as a PEM string 
  async function exportPubKey(key) {
    const buffer = await window.crypto.subtle.exportKey(
      'spki',
      key
    );
    const string = String.fromCharCode.apply(null, new Uint8Array(buffer));
    const base64 = window.btoa(string);
    const pem = `-----BEGIN PUBLIC KEY-----\n${base64}\n-----END PUBLIC KEY-----`;
    return pem;
  }
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
      <Input
        name='passwordc' type='password' label='Password confirmation'
        placeholder='Password Confirmation' value={passwordc} onChange={handleChange}
      />
      <Input
        name='answer' type='text' label='Antispam question'
        placeholder={`${a} + ${b} = ?`} value={answer} onChange={handleChange}
      />
      <Input
        name='question' type='text' label='Security question'
        placeholder='Security question to reset your password' value={passwordc} onChange={handleChange}
      />
      <Input
        name='reset' type='text' label='Your answer' onChange={handleChange}
        placeholder='Your answer' value={passwordc}
      />
      <Btn children="REGISTER" variant='contained' />
      <Link href='/login' text="Already have an account ?" span='LOGIN HERE' />
      <Alert text={alert} open={open} isError={error !== ''} />
    </Form>
  )
}

export default Register;
