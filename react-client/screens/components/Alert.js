import React, { Component } from "react";
import styled from "styled-components";
import Icon from "react-native-vector-icons/Feather";
import { Text, View, TouchableOpacity } from "react-native";

export const AlertContainer = styled.View`
  position:absolute;
  background:rgba(92, 150, 172, .5);
  z-index:10000;
  display:flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width:100%;
  height:100%;
`;

const Alert = styled.View`
  width:80%;
  height:200px;
  /* padding:15px; */
  display:flex;
  flex-direction: column;
  background:#000000;
  border-radius:10px;
  border:0.5px solid white ;
`;

const BtnsContainer = styled.View`
    width:100%;
    height:auto;
    display:flex;
    flex-direction:row;
    justify-content:flex-start;
    position:absolute;
    bottom:0;
`;

const AlertText = styled.Text`
    color:rgb(92, 150, 172);
    font-size:18;
    margin:15px;
    text-align:center;
`;


export default class AlertScreen extends Component {

    acceptRequest = () => {
        if (this.props.inRoomRequests) {
            let data = {
                token: this.props.token,
                roomName: this.props.roomName,
                person: this.props.person
            }
            this.props.socket.emit("acceptRoomRequest", data);

        } else {
            let data = {
                token: this.props.token,
                roomName: this.props.roomName,
            }
            this.props.socket.emit("acceptUserRequest", data);

        }
    }

    refuseRequest = () => {
        if (this.props.inRoomRequests) {
            let data = {
                token: this.props.token,
                roomName: this.props.roomName,
                person: this.props.person
            }
            this.props.socket.emit("refuseRoomRequest", data);

        } else {
            let data = {
                token: this.props.token,
                roomName: this.props.roomName,
            }
            this.props.socket.emit("refuseUserRequest", data);

        }
    }

    render() {
        return (
            <AlertContainer>
                <Alert>
                    <TouchableOpacity
                        onPress={this.props.popAlert}
                        style={{ alignSelf: "flex-end", margin: 15, position: "absolute", right: 0 }}>
                        <Icon name="x" size={25} color="#ff01fb"
                        />
                    </TouchableOpacity>
                    <Icon style={{ alignSelf: "center", marginTop: 15 }} name="alert-octagon" size={35} color="#5c96ac" />
                    <AlertText style={{ color: "white" }}>Do you want to accept {this.props.person}'s
                    {this.props.inRoomRequests ? " request " : " invitation "} to join {this.props.roomName}?</AlertText>
                    {/* <AlertText>{this.props.roomName}</AlertText> */}
                    <BtnsContainer>
                        <TouchableOpacity onPress={this.acceptRequest}>
                            <AlertText>Accept</AlertText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.refuseRequest}>
                            <AlertText>Refuse</AlertText>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginLeft: "auto" }} onPress={this.props.popAlert}>
                            <AlertText style={{ color: "#ff01fb" }}>Delay</AlertText>
                        </TouchableOpacity>
                    </BtnsContainer>
                </Alert>
            </AlertContainer>
        )
    }
}