import React from 'react';
import { TextInput, Button, Headline, ActivityIndicator } from "react-native-paper";
import { TouchableOpacity } from "react-native";
import styled from "styled-components";
import axios from 'axios';
import { Alert } from "./register";

export const Logo = styled.Image`
  height:125px;
  width:125px;
  left:50%;
  transform:translateX(-62.5px);
  margin:50px 0;
`;
export const Form = styled.ScrollView`
  background-color:#F3E9DC;
  flex:1;
  padding:15px;
  position:relative;
`;
export const Btn = styled(TouchableOpacity)`
  padding:10px;
  margin-top:6px;
  background:#504469;
  align-items:center;
  justify-content:center;
  height:56px;
  border:0;
`
export const BtnText = styled.Text`
  color:#F3E9DC;
  font-size:16px;
`;
export const Header = styled(Headline)`
  color:#504469;
  font-weight:200;
  font-size:26px;
`;
export const Link = styled(Button)`
  padding:10px;
  margin-top:6px;
  margin-bottom:75px;
`;
export const LinkTxt = styled.Text`
  color:#504469;
  font-weight:bold;
`;
export const Txt = styled.Text`
  font-weight:200;
`;
function Login({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [alert, setAlert] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  function toggleAlert() { setAlert(!alert) };
  async function submitForm() {
    setAlert(false);
    setLoading(true);
    axios.post('http://192.168.61.93:3000/signIn', { email, password },
      { withCredentials: true })
      .then(async function (response) {
        if (response.data.error) {
          setError(response.data.error);
          setAlert(true);
        }
        if (response.data.success) {
          navigation.push('tabs');
        }
      })
      .catch(function (error) {
        console.log(error);
      })
    setLoading(false);
  }
  return (
    <Form contentContainerStyle={{ justifyContent: 'flex-start' }}>
      <Logo source={require("../assets/whisper.png")} />
      <TextInput
        label="Email" value={email} autoCorrect={false}
        onChangeText={email => setEmail(email)} mode="outlined"
      />
      <TextInput
        label="Password" value={password} secureTextEntry
        onChangeText={password => setPassword(password)} mode="outlined"
      />
      <Btn mode="contained" onPress={submitForm} disabled={loading}>
        <BtnText>LOGIN</BtnText>
      </Btn>
      <Link onPress={() => navigation.navigate("register")}>
        <Txt>Not a member ? </Txt><LinkTxt>Join now</LinkTxt>
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
export default Login;