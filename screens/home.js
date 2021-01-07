import React from 'react';
import { Text, Headline, Surface, Button } from "react-native-paper";
import { ScrollView } from "react-native";
import styled from "styled-components";
import axios from "axios";


const Container = styled(ScrollView)`
  flex:1;
  background-color:#F3E9DC;
`;

export const Brand = styled(Surface)`
  flex-direction:row;
  height:80px;
  padding:10px;
  background-color:lightgray;
  align-items:center;
  elevation:9;
  margin-bottom:30px;
`;

export const Logo = styled.Image`
  height:50px;
  width:50px;
  margin:5px;
`;
export const BrandName = styled(Headline)`
  color:#4C4981;
  font-weight:200;
  font-size:30px;
`;
export const Header = styled(Headline)`
  color:#4C4981;
  font-weight:400;
  font-size:24px;
  margin:0 15px;
`;
const Paragraph = styled(Text)`
  color:gray;
  font-weight:200;
  font-size:20px;
  margin:0 15px;
  margin-bottom:10px;
`;

const Btn = styled(Button)`
  margin:15px;
  padding:10px;
`

const Home = ({ navigation }) => {
  React.useEffect(() => {
    axios.get('http://192.168.61.93:3000/checkAuth')
      .then((response) => {
        if (response.data.success) navigation.navigate("tabs");
      });
  }, [])
  return (
    <Container>
      <Brand>
        <Logo source={require("../assets/whisper.png")} />
        <BrandName>HAMSA</BrandName>
      </Brand>
      <Header>Own your private conversations</Header>
      <Paragraph>
        Hamsa is a different private messaging experience. This application was
        tailored with an unexpected focus on the user's privacy.
    </Paragraph>
      <Header>Speak freely</Header>
      <Paragraph>
        end-to-end encryption keeps your conversations secure. We can't read your
        messages and no one else can either. Privacy isn’t an optional mode —
        it’s just the way Hamsa was designed.
    </Paragraph>
      <Header>Free for everyone</Header>
      <Paragraph>
        Hamsa is developed by the people for the people. We're not tied to any companies.
        Development will be supported by grants and donations from people like you.
    </Paragraph>
      <Btn mode="contained" onPress={() => navigation.navigate("login")}>GET STARTED</Btn>
    </Container>
  )
}

export default Home;

