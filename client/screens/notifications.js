import React from 'react';
import styled from "styled-components";
import { Logo, BrandName, Brand } from "./home";
import { ScrollView } from "react-native";
import { IconButton, Portal, Dialog, Text, Button } from "react-native-paper";
import {
  Circle, SmallCircle, Room as Notification,
  RoomName as UserName, RoomId
} from "./rooms";
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../globalState';

export let List = styled(ScrollView)`
    position:relative;
    height:100%;
    background:transparent;
`;

let Notifications = ({ navigation }) => {
  let [dialog, setDialog] = React.useState(false);
  let [current, setCurrent] = React.useState({});
  let { user, setUser, socket } = React.useContext(UserContext);
  let bills = user.notifications;



  function acceptReq() {
    axios.post('http://192.168.83.93:3000/acceptReq',
      { roomId: current.roomId, member: current.from },
      { withCredentials: true })
      .then(async function (response) {
        if (response.data.error) {
          console.log(response.data.error);
          return;
        }
        setDialog(false);
        console.log(response.data.index, "index");
      })
      .catch(function (error) {
        console.log(error);
      })
  }
  return (
    <List contentContainerStyle={{ alignItems: "center" }}>
      <Brand style={{ backgroundColor: "#D49496", marginBottom: 10, width: '100%' }}>
        <Circle><Logo source={require("../assets/whisper.png")} /></Circle>
        <BrandName style={{ color: "white" }}>Notifications</BrandName>
      </Brand>
      {bills.length !== 0 ? bills.map(bill => (
        <Notification style={{ elevation: 6, width: "95%" }} key={bill._id}>
          <SmallCircle><Icon name="notifications" size={35} color="#D49496" /></SmallCircle>
          <UserName>{bill.userName}</UserName>
          <RoomId>{bill.roomId}</RoomId>
          <IconButton icon="account-check" color="#504469" size={23}
            onPress={() => { setCurrent(bill); setDialog(true) }}
            style={{ alignSelf: "flex-end", position: 'absolute' }}
          />
          <IconButton icon="delete" color="#FD708D" size={23}
            onPress={() => console.log('Pressed')}
            style={{ position: 'absolute', right: 30 }}
          />
        </Notification>
      )) : null}
      <Portal>
        <Dialog visible={dialog} onDismiss={() => setDialog(false)}>
          <Dialog.Title>Membership request</Dialog.Title>
          <Dialog.Content>
            <Text>{current.name} requests to join {current.roomName}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={acceptReq}>APPROVE</Button>
            <Button onPress={() => setDialog(false)}>CANCEL</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </List >
  )
}

export default Notifications;