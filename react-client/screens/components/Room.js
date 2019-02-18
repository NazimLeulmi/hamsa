import styled from "styled-components";
import { Text, ScrollView, TouchableOpacity, Keyboard } from "react-native";
import React, { Component } from "react";
import { isRTL, Input } from "../Login";
import Icon from "react-native-vector-icons/Feather";
import DropDown from "./Dropdown";
const ChatInput = styled(Input)`
  border: 1.5px solid black;
  border-radius: 10px;
  padding: 15px;
  flex: 80;
`;
// const BubbleContainer = styled.View`
//   width:100%;
//   height:auto;
//   background:rgba(0,0,0,.15);
//   display:flex;
//   flex-direction:column;
//   margin-top:3;
//   margin-bottom:3;
//   padding:10px;
//   position:relative;
// `
const Bubble = styled.View`
  min-height:40px;
  min-width:150px;
  max-width:85%;
  margin:5px;
  padding:3px;
  height:auto;
  background-color:${props => props.me ? "#5c96ac" : "#000000"};
  align-self:${props => props.me ? "flex-start" : "flex-end"};
  border-radius:10px;
  display:flex;
  align-items:flex-start;
  justify-content:center;
  position:relative;
`;
const BubbleText = styled.Text`
  color:white;
  font-size:14;
`;
const BubbleMsg = styled.Text`
  color:${props => props.me ? "#333333" : "#5c96ac"};
  font-size:16;
`;

const Time = styled.Text`
    font-size:12;
    color:#ff01fb;
    align-self: flex-end;
`;
const BubbleInfo = styled.View`
display:flex;
flex-direction:row;
justify-content:space-between;
position:relative;
align-self: stretch;
border:${props => props.me ? "#5c96ac" : "#000000"};
border-bottom-color:#333333;
`;
const Camera = styled(TouchableOpacity)`
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 20;
  border-radius: 10px;
`;
const InputContainer = styled.View`
  width: 100%;
  height: 50;
  position: relative;
  display: flex;
  flex-direction: row;
  margin: 2px;
`;


export default class Room extends Component {

    // Props = {room:{},keypair:{},inRoom:Bool,token,toggleForm,dropDown,socket}
    constructor(props) {
        super(props);
        this.state = {
            typingMsg: false,
            msg: "",
            RTL: true,
        }
        if (this.props.socket === null || this.props.socket === undefined) {
            this.props.navigation.navigate("login");
        }
    }

    componentDidMount() {
        this.props.socket.on("invited", () => {
            this.props.toggleForm();
        });
    }

    componentWillUnmount() {
        // console.log(`Room {${this.props.decChat.roomName}} is UnMounting`);
    }
    onChat = msg => {
        let isR2L;
        if (msg === "") isR2L = true;
        else {
            isR2L = isRTL(msg);
        }
        this.setState({ RTL: isR2L, msg });
    };
    send = () => {
        if (this.state.typingMsg) {
            // Send a Msg
            this.props.socket.emit("newMsg", { token: this.props.token, msg: this.state.msg, roomName: this.props.roomName });
            this.setState({ msg: "", RTL: true, typingMsg: false });
            Keyboard.dismiss();
            this.scrollView.scrollToEnd();
        }
    }
    render() {
        console.log("Rendering Room");
        let Chat;
        if (this.props.decChat) {
            Chat = this.props.decChat.chat.map((chat, i) => {
                return (
                    <Bubble key={i} me={chat.from === this.props.keyPair.username}>
                        <BubbleInfo me={chat.from === this.props.keyPair.username}>
                            <BubbleText style={{ marginRight: 30 }} >{chat.from}</BubbleText>
                            <BubbleText style={{ color: "#333333" }}>{chat.date}</BubbleText>
                        </BubbleInfo>
                        <BubbleMsg me={chat.from === this.props.keyPair.username}>{chat.msg}</BubbleMsg>
                        <Time>{chat.time}</Time>
                    </Bubble>
                )
            })
        } else {
            Chat = null;
        }
        return (
            <React.Fragment>
                {/* DropDown */}
                {this.props.dropdown === true ?
                    <DropDown toggleForm={this.props.toggleForm}
                        dropDown={this.props.dropDown} /> : null
                }
                {/* Chat List */}
                <ScrollView style={{ flex: 1, position: "relative", width: "100%", marginTop: 100 }}
                    ref={component => { this.scrollView = component }}
                >
                    {Chat}
                </ScrollView>
                {/* Text Input */}
                <InputContainer>
                    <ChatInput
                        placeholder="اكتب هنا"
                        placeholderTextColor="white"
                        onChangeText={this.onChat}
                        autoCorrect={false}
                        spellCheck={false}
                        selectionColor="white"
                        isRTL={this.state.RTL}
                        value={this.state.msg}
                        onFocus={() => this.setState({ typingMsg: true })}
                        onBlur={() => this.setState({ typingMsg: false })}
                    />
                    {/* Image Picker / Msg Sender */}
                    <Camera onPress={this.send}>
                        <Icon
                            name={this.state.typingMsg ? "send" : "camera"}
                            size={30}
                            color="#5c96ac"
                        />
                    </Camera>
                </InputContainer>
            </React.Fragment>
        )
    }
}