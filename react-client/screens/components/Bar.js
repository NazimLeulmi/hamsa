import styled from "styled-components";
import React from "react";
import { Text, TouchableOpacity, Image } from "react-native";
import { Uploader } from "../Profile";
import Icon from "react-native-vector-icons/Feather";

export const AvContainer = styled(TouchableOpacity)`
  width: ${props => props.size};
  height: ${props => props.size};
  border-radius:${props => props.size};
  margin: 10px;
  position: relative;
  border: 1px solid ${props => props.color};
`;
export const Avatar = styled(Image)`
  width: ${props => props.size ? props.size : 80};
  height: ${props => props.size ? props.size : 80};
  border-radius:${props => props.size ? props.size : 80};
`;
const Bar = styled.View`
  width: 100%;
  height: 100;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: row;
  align-items: center;
  position:absolute;
  z-index:1000;
  top:0;
`;
export const Btn = styled(Uploader)`
  margin-right: 5px;
  width: 65;
  height: 65;
  border-radius:65;
  border:${props => props.blue ? "1px solid #5c96ac" : "1px solid #000000"};
  background: ${props => props.blue ? "rgba(0, 0, 0, 0.45)" : "#5c96ac"};
  display: flex;
  flex-direction:column;
  justify-content: center ;
  align-items: center;
`;


// props = {inRoom,image,username,toggleForm,dropDown,navigateProfile,form}
const TopBar = (props) => (
    <Bar>
        {/* Group/User Avatar */}
        <AvContainer
            size={80}
            color="#5c96ac"
            onPress={props.inRoom ? props.inRoomRequests ? null : props.dropDown : props.navigateProfile}
        >

            <Avatar size={80} source={props.roomAvatar ? props.roomAvatar : { uri: props.image.uri }} />
        </AvContainer>
        {/* group name */}
        {props.inRoom &&
            <Text style={{ color: "#5c96ac" }}>
                {props.roomName}
            </Text>}
        {/* Navigate Back to Rooms or Toggle The PopForm */}
        {props && <Btn blue onPress={() => {
            if (props.inRoom === true) {
                if (props.inRoomRequests === true) {
                    props.leaveRoomRequests();
                } else {
                    props.leaveRoom();
                    console.log("Leaaving Room");
                }
            } else if (props.inUserRequests === true) {
                props.leaveRoom();
            } else {
                props.toggleForm();
            }
        }}
            style={{ marginLeft: "auto" }}>
            <Icon
                name="users"
                size={30}
                color="#5C96AC"
            />
        </Btn>}
        {/* Request a group Leader to join a group */}
        {props.inRoom === false && props.inUserRequests === false &&
            <Btn blue onPress={props.requestToJoin}>
                <Icon
                    name="message-square"
                    size={30}
                    color="#5C96AC"
                />
            </Btn>}
        {/* Invitations or Requests depending on the props*/}
        {props.inUserRequests === false && props.inRoomRequests === false &&
            <Btn blue
                onPress={props.inRoom ? props.goInRoomRequests : props.goInUserRequests}
            >
                <Icon
                    name="bell"
                    size={30}
                    color="#5C96AC"
                />
            </Btn>
        }



    </Bar>
)

export default TopBar;