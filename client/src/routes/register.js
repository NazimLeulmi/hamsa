import React, { useState, useContext, useEffect } from "react";
import { StylesProvider } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Image from "../assets/whisper.png";
import { Form, Header, Input, Btn, Img, Link} from "./login";
import { validateRegister } from "./validation";
import { SocketContext } from "../context";
import Alert from '@material-ui/lab/Alert';
import { CircularProgress as Spinner } from '@material-ui/core';

function rand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
function Register(props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordc, setPasswordc] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  // Antispam question
  const [a] = useState(rand(1, 10));
  const [b] = useState(rand(1, 10));
  // a + b = antispam answer
  const [answer, setAnswer] = useState('');
  // Custom alert state
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState("");
  const [severity, setSeverity] = useState("error");
  // Websocket connection from the context
  const [socket] = useContext(SocketContext);
  // Component has been mounted
  useEffect(() => {
    socket.on("validated", async (data) => {
      console.log(`${password} has been validated`)
      const { isValid, errors } = data;
      // errors coming from the server
      setErrors(errors);
      if (isValid === false) {
        // alert the user
        setAlert(errors[0]);
        setSeverity("error");
        setOpen(true);
        setLoading(false);
        return;
      }
      const keyPair = await genKeyPair();
      const pubKeyPem = await exportPubKey(keyPair.publicKey);
      const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      const request = indexedDB.open("hamsaDB", 1);
      request.onerror = function (event) {
        console.log("Request Error", event.target.errorCode);
      };
      request.onupgradeneeded = function (event) {
        const db = request.result;
        db.createObjectStore("keyPairs", { keyPath: "name" });
        console.log("IndexeDB store has been created");
      }
      request.onsuccess = (event) => {
        const db = request.result;
        const keyPairsStore = db.transaction("keyPairs", "readwrite").objectStore("keyPairs");
        db.onerror = function (event) {
          console.log("DB transaction error", event.target.errorCode);
        }
        keyPairsStore.put({ name: name, public: pubKeyPem, private: keyPair.privateKey})
        keyPairsStore.transaction.oncomplete = (event) => {
          db.close();
        }
      }
    })
    return function () {
      socket.off("validated")
    }
  })
  function submitForm(e) {
    e.preventDefault();
    const { isValid, errors } = validateRegister(name, password, passwordc, answer, a, b);
    setLoading(true);
    setOpen(false);
    setErrors(errors);
    if (isValid === false) {
      setAlert(errors[0]);
      setSeverity("error");
      setOpen(true)
      setLoading(false);
      return;
    }
    socket.emit("validate", { name, password, passwordc, answer, a, b })
  }
  function handleClose(e, reason) {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  function handleChange(e) {
    switch (e.target.name) {
      case "name":
        setName(e.target.value);
        break;
      case "password":
        setPassword(e.target.value);
        break;
      case "passwordc":
        setPasswordc(e.target.value);
        break;
      case "answer":
        setAnswer(e.target.value);
        break;
      default:
        console.log("Something went wrong!")
        break;
    }
  }
  // Generate an RSA-OAEP encryption/decryption key pair
  function genKeyPair() {
    return window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 4096, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      false, // set extractable:false to prevent xss to access the private key
      ["encrypt", "decrypt"]
    );
  }
  // Export the public RSA encryption key as a PEM string 
  async function exportPubKey(key) {
    const buffer = await window.crypto.subtle.exportKey(
      "spki",
      key
    );
    const string = String.fromCharCode.apply(null, new Uint8Array(buffer));
    const base64 = window.btoa(string);
    const pem = `-----BEGIN PUBLIC KEY-----\n${base64}\n-----END PUBLIC KEY-----`;
    return pem;
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
        <Input
          variant="filled" label="Password confirmation"
          name="passwordc" value={passwordc} onChange={handleChange}
          placeholder="Password confirmation"
        />
        <Input
          variant="filled" label={`${a} + ${b} = ?`}
          name="answer" value={answer} onChange={handleChange}
          placeholder={`${a} + ${b} = ?`}
        />
        <Btn 
          children={"REGISTER"} 
          variant="contained" 
          onClick={submitForm} 
          startIcon={loading?<Spinner size={20} style={{marginRight:10}}/>:null}
          disabled={loading?true:false}
        />
        <Link to="/">Already have an account ? LOGIN NOW</Link>
        <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity} style={{ textAlign: "center", alignItems: "center" }}>
            {alert}
          </Alert>
        </Snackbar>
      </Form>
    </StylesProvider>
  )
}

export default Register;