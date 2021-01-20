import React from "react";
import { Headline } from "react-native-paper";
import styled from "styled-components";
import { ScrollView } from "react-native";
import { Btn, BtnText } from "./login";

          const Container = styled.View`
  flex: 1;
  background-color: #fbfbfb;
  padding: 15px;
`;
const Img = styled.Image`
  height: 200px;
  width: 300px;
  left: 50%;
  transform: translateX(-135px);
  margin-top: 50px;
`;
const Paragraph = styled.Text`
  color: #504469;
  color: gray;
  font-weight: 200;
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
`;
const Header = styled(Headline)`
  color: #504469;
  font-weight: 400;
  font-size: 24px;
  text-align: center;
  margin-bottom: 50px;
`;

const Activate = ({ navigation }) => (
                <Container>
    <Img source={require("../assets/activate.png")} />
    <Header>Activate your account </Header>
    <Paragraph>
      We've sent you an activision link via EMAIL . Please check your email
      inbox to activate your account
    </Paragraph>
    <Btn mode="contained" onPress={() => navigation.navigate("login")}>
      <BtnText>LOGIN</BtnText>
    </Btn>
  </Container>
);
export default Activate;
