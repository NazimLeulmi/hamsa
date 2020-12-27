import React, { useEffect, useState } from 'react';
import { Text, Headline, ProgressBar, ActivityIndicator } from "react-native-paper";
import styled from "styled-components";
import { ScrollView } from "react-native";
import { RSA } from 'react-native-rsa-native';
import keyChain from 'react-native-sensitive-info';


const Container = styled(ScrollView)`
  flex:1;
  background-color:#F3E9DC;
  padding:15px;
`;

const Img = styled.Image`
  height:125px;
  width:125px;
  left:50%;
  transform:translateX(-62.5px);
  margin:50px 0;
`;


const Paragraph = styled(Text)`
  color: #504469;
  color:gray;
  font-weight:200;
  font-size:20px;
  margin-bottom:10px;
  text-align:center;
  margin-bottom:20px;
`;
const Header = styled(Headline)`
  color: #504469;
  font-weight:400;
  font-size:24px;
  text-align:center;
  margin:20px 0;
`;


async function Activate({ navigation, route }) {


  function submitData(pubKey) {
    axios.post('http://192.168.177.93:3000/signUp',
      {
        name: route.params.name, email: route.params.email,
        password: route.paarams.password, publicKey: pubKey
      })
      .then(function (response) {
        if (response.data.error) {
          setError(response.data.error);
          setAlert(true);
        }
        if (response.data.success) {
          navigation.push('generate', { name, email, password })
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  return (
    <Container>
      <ProgressBar progress={0.66} color="#504469" />
      <Img source={require("../assets/secure.png")} />
      <Header>Generating cryptographic keys </Header>
      <Paragraph>
        end-to-end encryption keeps your conversations secure. We can't read your
        messages and no one else can either. Privacy isn’t an optional mode —
        it’s just the way Hamsa was designed.
      </Paragraph>
      <ActivityIndicator animating={true} color="#504469" size="large" />
    </Container>
  )
}
export default Activate;


