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

export const List = styled(ScrollView)`
    position:relative;
    height:100%;
    background:transparent;
`;

const Notifications = ({ navigation }) => {
  const [notifications, setNot] = React.useState([]);
  const [dialog, setDialog] = React.useState(false);
  const [current, setCurrent] = React.useState({});

  async function getNotifications() {
    try {
      console.log("Fetching Notifcations")
      const response = await axios.get('http://192.168.61.93:3000/notifications');
      if (response.data.error) return console.log(response.data.error);
      console.log(response.data.notifications)
      setNot(response.data.notifications);
    } catch (err) { console.log(err) }
  }
  useFocusEffect(
    React.useCallback(() => {
      getNotifications();
    }, [])
  );
  return (
    <List contentContainerStyle={{ alignItems: "center" }}>
      <Brand style={{ backgroundColor: "#D49496", marginBottom: 10, width: '100%' }}>
        <Circle><Logo source={require("../assets/whisper.png")} /></Circle>
        <BrandName style={{ color: "white" }}>Notifications</BrandName>
      </Brand>
      {notifications.length !== 0 ? notifications.map(not => (
        <Notification style={{ elevation: 6, width: "95%" }} key={not._id}>
          <SmallCircle><Icon name="notifications" size={35} color="#D49496" /></SmallCircle>
          <GroupName>{not.name}</GroupName>
          <GroupId>{not.from}</GroupId>
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
            <Button onPress={() => setDialog(false)}>APPROVE</Button>
            <Button onPress={() => setDialog(false)}>CANCEL</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </List >
  )
}

export default Notifications;