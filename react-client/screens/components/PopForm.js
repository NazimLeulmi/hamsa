import React, { Component } from "react";
import styled from "styled-components";
import Icon from "react-native-vector-icons/Feather";
import Login, { Avoid, isRTL, Input, Error } from "../Login";
import { Btn, AvContainer, Avatar } from "./Bar";
import { Text, Keyboard } from "react-native";
import { AlertContainer } from "./Alert"
import ImagePicker from "react-native-image-picker";
import LoginBg from "../../assets/login.jpg";
import GroupAvatar from "../../assets/group.png";

const GroupInput = styled(Input)`
  border: 1px solid #333333;
  border-radius: 10px;
  width: 90%;
  height: 60;
  padding: 10px;
`;
export const Form = styled(Avoid)`
  width: 80%;
  height: 300;
  background: #5c96ac;
  border-top-right-radius: 30px;
  border-bottom-left-radius: 30px;
  border:1px solid #000000;
  justify-content: flex-start;
  padding-top: 10;
`;
const FormBtn = styled(Btn)`
  width: 90%;
  height: 60;
  margin: 0;
  margin-top: 5;
  border-radius: 10px;
`;


export default class PopForm extends Component {
    // Props = {inRoom,username,socket,roomName,token}
    constructor(props) {
        super(props);
        console.log("LoginBG", LoginBg);
        this.state = {
            name: "",
            avatar: "",
            focus: false,
            RTL: true,
            error: null,
            avatarSource: null,
        }
    }
    componentDidMount() {
        this.props.socket.on("groupFormError", error => {
            this.setState({ error });
        });
        this.props.socket.on("requestSent", () => {
            this.props.toggleForm()
        });
    }
    onSubmit = () => {
        if (this.props.inRoom === false) {
            //invite 
            if (this.props.joinRequest) {
                //  Send a request to a room leader to join a group/room
                console.log("Joining a group")
                this.props.socket.emit("joinRequest", {
                    token: this.props.token,
                    name: this.state.name
                })
            } else {
                // Create Room
                console.log("Creating a room");
                Keyboard.dismiss();
                this.props.socket.emit("createRoom", {
                    name: this.state.name,
                    token: this.props.token,
                    avatar: this.state.avatar
                });
            }
        }
        else {
            console.log("Inviting")
            this.props.socket.emit("invite", {
                room: this.props.roomName,
                user: this.state.name,
                username: this.props.username
            });


        }
    }
    // Text Input Handler
    onName = name => {
        let isR2L;
        if (name === "") isR2L = true;
        else {
            isR2L = isRTL(name);
        }
        this.setState({
            name: name,
            RTL: isR2L
        });
    };
    // Image Picker for the group avatar
    onPick = () => {
        ImagePicker.showImagePicker(this.options, response => {
            if (response.didCancel) {
                console.log("User cancelled image picker");
            } else if (response.error) {
                console.log("ImagePicker Error: ", response.error);
            } else {
                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                // if (this.state.socket !== null && this.state.socket !== undefined) {
                //   this.state.socket.emit("imageUp", response.data);
                // }
                this.setState({
                    avatar: { uri: "data:image/jpeg;base64," + response.data },
                });
            }
        });
    };
    render() {
        console.log(this.props.joinRequest)
        return (
            <AlertContainer>
                <Form>
                    <Text style={{ color: "#333333", fontSize: 18 }}>
                        {this.props.inRoom === false ? this.props.joinRequest ?
                            "Join a Group" : "Create a Group"
                            : "Invite User"}
                    </Text>
                    <Icon
                        name="x"
                        size={40}
                        color="#333333"
                        style={{ right: 10, margin: 10, position: "absolute" }}
                        onPress={this.props.toggleForm}
                    />
                    {/* Group Avatar */}
                    {(this.props.inRoom === false && this.props.joinRequest === false) ?
                        <AvContainer onPress={this.onPick} size={65}
                            color={this.state.focus ? "white" : "black"}>
                            <Avatar
                                source={this.state.avatar === "" ? GroupAvatar : this.state.avatar}
                                size={64}
                            >
                            </Avatar>
                        </AvContainer> :

                        <Icon
                            name={this.props.inRoom ? "user" : "users"}
                            size={50}
                            color={this.state.focus ? "white" : "#333333"}
                        />
                    }
                    <GroupInput
                        placeholder={this.props.inRoom ? "اسم الشخص" : "اسم المجموعة"}
                        placeholderTextColor="white"
                        onChangeText={this.onName}
                        isRTL={this.state.RTL}
                        autoCorrect={false}
                        spellCheck={false}
                        onFocus={() => this.setState({ focus: true })}
                        onBlur={() => this.setState({ focus: false })}
                        selectionColor="white"
                        value={this.state.name}
                    />
                    {this.state.error ? (
                        <Error style={{ textAlign: "right", margin: 5 }}>{this.state.error}</Error>
                    ) : null}
                    <FormBtn blue onPress={this.onSubmit}>
                        <Text style={{ color: "white", fontSize: 18 }}>
                            {this.props.inRoom ? " ادْعُ" : this.props.joinRequest ? "طلب الانضمام" : "إنشئ"}
                        </Text>
                    </FormBtn>
                </Form>
            </AlertContainer>
        )
    }
}