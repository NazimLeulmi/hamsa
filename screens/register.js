import React from 'react';
import { Logo, Btn, BtnText, Form, Txt, Link, LinkTxt } from './login';
import { TextInput, Snackbar, ActivityIndicator, ProgressBar } from 'react-native-paper';
import styled from 'styled-components';
import axios from 'axios';
import { RSA } from 'react-native-rsa-native';
import keyChain from 'react-native-sensitive-info';

export const Alert = styled(Snackbar)`
  background-color:#FD708D;
  color:#F3E9DC;
  display:flex;
  align-items:center;
  justify-content:center;
`;

function Register({ navigation }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordc, setPassC] = React.useState('');
  const [error, setError] = React.useState('');
  const [alert, setAlert] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function submitForm() {
    setAlert(false);
    setLoading(true);
    const cryptoKeys = await RSA.generateKeys(4096);
    axios.post('http://192.168.61.93:3000/signUp',
      { name, email, password, passwordc, publicKey: cryptoKeys.public })
      .then(async function (response) {
        if (response.data.error) {
          setError(response.data.error);
          setAlert(true);
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
        label="Name" value={name} autoCompleteType="off" autoCorrect={false}
        onChangeText={name => setName(name)} mode="outlined"
      />
      <TextInput
        label="Email" value={email} autoCompleteType="off" autoCorrect={false}
        onChangeText={email => setEmail(email)} mode="outlined"
      />
      <TextInput
        label="Password" value={password} secureTextEntry
        onChangeText={password => setPassword(password)} mode="outlined"
      />
      <TextInput
        label="Password Confirmation" value={passwordc} secureTextEntry
        onChangeText={passwordc => setPassC(passwordc)} mode="outlined"
      />
      <Btn mode="contained" onPress={submitForm} disabled={loading ? true : false}>
        <BtnText>REGISTER</BtnText>
      </Btn>
      <Link onPress={() => navigation.push("login")}>
        <Txt>Already have an account ? </Txt><LinkTxt>Login</LinkTxt>
      </Link>
      <Alert visible={alert} onDismiss={toggleAlert} duration={4000}
        action={{ label: 'X', onPress: () => setAlert(!alert) }}
      >
        {error}
      </Alert>
      {loading ? <ActivityIndicator animating={true} color="#504469" /> : null}
    </Form>
  )
}
export default Register;