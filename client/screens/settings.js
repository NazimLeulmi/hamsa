import React from 'react';
import styled from "styled-components";
import { Logo, BrandName, Brand, Header } from "./home";
import { ScrollView } from "react-native";
import { Circle } from "./rooms";

const Container = styled(ScrollView)`
`;

const Settings = ({ navigation }) => (
    <Container>
        <Brand style={{ backgroundColor: "#6D63F4" }}>
            <Circle><Logo source={require("../assets/whisper.png")} /></Circle>
            <BrandName style={{ color: "white" }}>Settings</BrandName>
        </Brand>
    </Container>
);

export default Settings;