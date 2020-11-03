import React from 'react';
import { TextInput, Button, Headline, Text } from "react-native-paper";
import styled from "styled-components";



const Logo = styled.Image`
  height:125px;
  width:125px;
  left:50%;
  transform:translateX(-62.5px);
  margin:50px 0;
`;
const Form = styled.ScrollView`
  background-color:#F3E9DC;
  flex:1;
  padding:15px;
`;
const Btn = styled(Button)`
  padding:10px;
  margin-top:6px;
`
const Header = styled(Headline)`
  color:#4C4981;
  font-weight:200;
  font-size:26px;
`;
const Link = styled(Button)`
  padding:10px;
  margin-top:6px;
`;
const LinkTxt = styled.Text`
  color:#4C4981;
  font-weight:bold;
`;
const Txt = styled.Text`
  font-weight:200;
`;
function Login({ navigation }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  return (
    <Form >
      <Logo source={require("../assets/whisper.png")} />
      <TextInput
        label="Email" value={email}
        onChangeText={email => setEmail(email)} mode="outlined"
      />
      <TextInput
        label="Password" value={password}
        onChangeText={password => setPassword(password)} mode="outlined"
      />
      <Btn mode="contained" onPress={() => console.log("LOGIN")}>LOGIN</Btn>
      <Link onPress={() => navigation.navigate("register")}>
        <Txt>Not a member ? </Txt><LinkTxt>Join now</LinkTxt>
      </Link>
    </Form>
  )
}
export default Login;