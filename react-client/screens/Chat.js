import React, { Component } from "react";
import { P, H1, Container, Touch, BtnTxt } from "./Login";
import { TouchableHighlight, TouchableOpacity } from "react-native";

export default class Chat extends Component {
    state = {
        chat: []
    }

    static navigationOptions = {
        header: null
    }
    render() {
        return (
            <Container >
                <H1>Chat Page</H1>
                <P>Hello world</P>
                <Touch onPress={() => this.props.navigation.navigate("login")}>
                    <BtnTxt>Hello</BtnTxt>
                </Touch>

            </Container>
        );
    }
}

