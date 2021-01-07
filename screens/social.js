import React from 'react';
import styled from "styled-components";
import { Logo, BrandName, Brand, Header } from "./home";
import { ScrollView } from "react-native";
import { Circle } from "./groups";

const Container = styled(ScrollView)`
`;


const Social = ({ navigation }) => (
    <Container>
        <Brand style={{ backgroundColor: "#FD708D" }}>
            <Circle><Logo source={require("../assets/whisper.png")} /></Circle>
            <BrandName style={{ color: "white" }}>Posts</BrandName>
        </Brand>
        <Header>Own your private conversations</Header>
    </Container>
);

export default Social;