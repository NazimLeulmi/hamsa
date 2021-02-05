import React from 'react';
import { Logo, Btn, BtnText, Form, Txt, Link, LinkTxt } from './signIn';
import { TextInput, Snackbar, ActivityIndicator } from 'react-native-paper';
import styled from 'styled-components';
import axios from 'axios';
import { RSA } from 'react-native-rsa-native';
import keyChain from 'react-native-sensitive-info';
import { validateSignUp } from './validation';

const Alert = styled(Snackbar)`
  background-color:#FD708D;
  color:#F3E9DC;
  display:flex;
  align-items:center;
  justify-content:center;
`;

function SignUp({ navigation }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordc, setPassC] = React.useState('');
  const [error, setError] = React.useState('');
  const [alert, setAlert] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const secondInput = React.useRef(null);
  const thirdInput = React.useRef(null);
  const fourthInput = React.useRef(null);
  const btn = React.useRef(null);

  async function submitForm() {
    let errors = validateSignUp(name, email, password, passwordc);
    if (errors.length !== 0) {
      setError(errors[0]); setAlert(true); return;
    }
    setAlert(false); setLoading(true);
    const cryptoKeys = await RSA.generateKeys(4096);
    axios.post('http://192.168.83.93:3000/signUp',
      { name, email, password, passwordc, publicKey: cryptoKeys.public })
      .then(async function (response) {
        if (response.data.error) {
          setError(response.data.error); setAlert(true);
        }
        if (response.data.success) {
          const saved = await keyChain.setItem(email, cryptoKeys.private, {
            keychainService: 'private',
            sharedPreferencesName: 'private'
          });
          navigation.push('activate');
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    setLoading(false);
  }
  function toggleAlert() { setAlert(!alert) };
  return (
    <Form >
      <Logo source={require("../assets/whisper.png")} />
      <TextInput
        label="Name" value={name} keyboardType="visible-password"
        onChangeText={name => setName(name)} mode="outlined"
        returnKeyType="next" onSubmitEditing={() => secondInput.current.focus()}
      />
      <TextInput
        label="Email" value={email} keyboardType="visible-password"
        onChangeText={email => setEmail(email)} mode="outlined"
        ref={secondInput} onSubmitEditing={() => thirdInput.current.focus()}
      />
      <TextInput
        label="Password" value={password} secureTextEntry
        onChangeText={password => setPassword(password)} mode="outlined"
        ref={thirdInput} onSubmitEditing={() => fourthInput.current.focus()}
      />
      <TextInput
        label="Password Confirmation" value={passwordc} secureTextEntry
        onChangeText={passwordc => setPassC(passwordc)} mode="outlined"
        ref={fourthInput} onSubmitEditing={submitForm}
      />
      <Btn mode="contained" onPress={submitForm} disabled={loading ? true : false} ref={btn}>
        <BtnText>SIGN UP</BtnText>
      </Btn>
      {loading ? <ActivityIndicator animating={true} color="#504469"
        style={{ marginTop: 25 }}
      /> : null}
      <Link onPress={() => navigation.push("signIn")}>
        <Txt>Already have an account ? </Txt><LinkTxt>SIGN IN</LinkTxt>
      </Link>
      <Alert visible={alert} onDismiss={toggleAlert} duration={4000}
        action={{ label: 'X', onPress: () => setAlert(!alert) }}
      >
        {error}
      </Alert>
    </Form>
  )
}
export default SignUp;