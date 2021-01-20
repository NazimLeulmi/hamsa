import React from 'react';
import styled from "styled-components";
import { Logo, BrandName, Brand, Header } from "./home";
import { View, ScrollView } from "react-native";
import { IconButton, Portal, Dialog, Text, Button } from "react-native-paper";
import {
  Circle, SmallCircle, Group as Notification,
  GroupName, GroupId
} from "./groups";
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { not } from 'react-native-reanimated';
import { UserContext } from '../globalState';

export const List = styled(ScrollView)`
    position:relative;
    height:100%;
    background:transparent;
`;

const Notifications = ({ navigation }) => {
  const [dialog, setDialog] = React.useState(false);
  const [current, setCurrent] = React.useState({});
  const { user, setUser } = React.useContext(UserContext);
  let nots = user.notifications;

  function acceptReq() {
    axios.post('http://192.168.2.97:3000/acceptReq',
      { groupId: current.groupId, member: current.from },
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
      {nots.length !== 0 ? nots.map(not => (
        <Notification style={{ elevation: 6, width: "95%" }} key={not._id}>
          <SmallCircle><Icon name="notifications" size={35} color="#D49496" /></SmallCircle>
          <GroupName>{not.name}</GroupName>
          <GroupId>{not.groupId}</GroupId>
          <IconButton icon="account-check" color="#504469" size={23}
            onPress={() => { setCurrent(not); setDialog(true) }}
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
            <Text>{current.name} requests to join {current.groupName}</Text>
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