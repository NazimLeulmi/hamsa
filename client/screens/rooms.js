import React from 'react';
import styled from "styled-components";
import { Logo, BrandName, Brand } from "./home";
import { Snackbar, Surface, IconButton } from 'react-native-paper';
import { ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from "axios";
import Clipboard from "@react-native-community/clipboard";
import { UserContext } from '../globalState';
import FabGroup from "./fab";
import io from "socket.io-client";


export let Circle = styled.View`
    height:70px;
    width:70px;
    border-radius:35px;
    background-color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    margin-right:10px;
`;

export let SmallCircle = styled(Circle)`
    height:50px;
    width:50px;
    border-radius:25px;
    border:2px solid lightgray;
    margin-left:10px;
    position:absolute;
    left:0px;
`;



export let List = styled(ScrollView)`
    position:relative;
    height:100%;
    padding:15px;
    z-index:-10;
    background:transparent;
`;


export let ChipList = styled(ScrollView)`
  width:100%;
  height:25px;
  margin-top:3px;
`;

export let RoomName = styled.Text`
  color:#504469;
  font-weight:bold;
  font-size:12px;
  margin-top:5px;
`;
export let RoomId = styled.Text`
  color:gray;
  font-weight:200;
  font-size:10px;
`;

export let Room = styled(Surface)`
  height:70px;
  width:100%;
  margin-bottom:10px;
  display:flex;
  padding-left:80px;
  justify-content:center;
  /* align-items:center; */
  border-radius:10px;
`;


let Rooms = ({ navigation, route }) => {
  const [open, setOpen] = React.useState(false); // boolean to trigger FAB
  const [dialog, setDialog] = React.useState(false); // boolean to trigger the Dialog
  const [error, setError] = React.useState(''); // Dialog text input error handling
  const [create, setCreate] = React.useState(false); // Dialog state ( create || join ) a room
  const [copied, setCopied] = React.useState(false); // Copy room id to the clipboard state
  const { user, setUser, socket, setSocket } = React.useContext(UserContext);


  // This will hopefully connect once to the websockets server
  React.useEffect(() => {
    if (!socket) {
      let sock = io('ws://192.168.2.97:3000', { withCredentials: true });
      if (sock) setSocket(sock);
    }
  }, []);


  async function leaveRoom() {

  }
  async function deleteRoom() {
  }
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <Brand style={{ backgroundColor: "#504469", marginBottom: 0 }}>
        <Circle><Logo source={require("../assets/whisper.png")} /></Circle>
        <BrandName style={{ color: "white" }}>Rooms</BrandName>
        <Snackbar visible={copied}
          onDismiss={() => setCopied(false)}
          duration={2000}
          style={{ backgroundColor: "gray", borderRadius: 10 }}
          wrapperStyle={{ right: 0, width: 175, bottom: 10 }}
        >
          Copied to clipboard
        </Snackbar>
      </Brand>
      <List contentContainerStyle={{ alignItems: "center" }}>
        {user ? user.rooms.map(room => (
          <Room style={{ elevation: 6 }} key={room._id}>
            <SmallCircle><Icon name="group" size={35} color="#504469" /></SmallCircle>
            <RoomName>{room.name}</RoomName>
            <RoomId>{room._id}</RoomId>
            <IconButton icon="content-copy" color="#504469" size={23}
              onPress={() => { Clipboard.setString(room._id); setCopied(true) }}
              style={{ alignSelf: "flex-end", position: 'absolute' }}
            />
            <IconButton color="#FD708D" size={23} style={{ position: 'absolute', right: 30 }}
              onPress={room.isAdmin ? deleteRoom : leaveRoom}
              icon={room.isAdmin ? "delete" : "trash-can"}
            />
          </Room>
        )) : null}
      </List >
      {/* Floating Action Button Group */}
      <FabGroup open={open} setOpen={setOpen} setDialog={setDialog} setCreate={setCreate} />
    </View >
  )
}

export default Rooms;

