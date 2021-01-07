import React from 'react';
import styled from "styled-components";
import { Logo, BrandName, Brand, Header } from "./home";
import {
  FAB, Portal, Provider, TextInput, Chip, Snackbar,
  Button, Dialog, HelperText, Surface, IconButton, Text
} from 'react-native-paper';
import { ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from "axios";
import { useFocusEffect } from '@react-navigation/native';
import Clipboard from "@react-native-community/clipboard";


export const Circle = styled.View`
    height:70px;
    width:70px;
    border-radius:35px;
    background-color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    margin-right:10px;
`;

export const SmallCircle = styled(Circle)`
    height:50px;
    width:50px;
    border-radius:25px;
    border:2px solid lightgray;
    margin-left:10px;
    position:absolute;
    left:0px;
`;



export const List = styled(ScrollView)`
    position:relative;
    height:100%;
    padding:15px;
    z-index:-10;
    background:transparent;
`;


export const ChipList = styled(ScrollView)`
  width:100%;
  height:25px;
  margin-top:3px;
`;

export const GroupName = styled.Text`
  color:#504469;
  font-weight:bold;
  font-size:12px;
  margin-top:5px;
`;
export const GroupId = styled.Text`
  color:gray;
  font-weight:200;
  font-size:10px;
`;

export const Group = styled(Surface)`
  height:70px;
  width:100%;
  margin-bottom:10px;
  display:flex;
  padding-left:80px;
  justify-content:center;
  /* align-items:center; */
  border-radius:10px;
`;


const Groups = ({ navigation }) => {
  const [open, setOpen] = React.useState(false);
  const [dialog, setDialog] = React.useState(false);
  const [data, setData] = React.useState('');
  const [error, setError] = React.useState('');
  const [type, setType] = React.useState('error');
  const [create, setCreate] = React.useState(null);
  const [groups, setGroups] = React.useState([]);
  const [copied, setCopied] = React.useState(false);


  async function getGroups() {
    try {
      console.log("Fetching Groups")
      const response = await axios.get('http://192.168.61.93:3000/groups');
      if (response.data.error) console.log(response.data.error);
      setGroups(response.data.groups);
    } catch (err) { console.log(err) }
  }
  useFocusEffect(
    React.useCallback(() => {
      getGroups();
    }, [])
  );

  async function submitForm() {
    axios.post(`http://192.168.61.93:3000/${create ? "createGroup" : "joinGroup"}`, { data: data },
      { withCredentials: true })
      .then(async function (response) {
        if (response.data.error) {
          setType("error");
          setError(response.data.error);
          return;
        }
        setType("info");
        setError(create ? "The group has been created" :
          "Request has been sent to the group admin");
        setTimeout(() => {
          setDialog(false); setError("");
          setData(""); getGroups();
        }, 1000);
      })
      .catch(function (error) {
        console.log(error);
      })
  }
  return (
    <View style={{ width: '100%', height: '100%' }}>
      <Brand style={{ backgroundColor: "#504469", marginBottom: 0 }}>
        <Circle><Logo source={require("../assets/whisper.png")} /></Circle>
        <BrandName style={{ color: "white" }}>Groups</BrandName>
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
        {groups.map(grp => (
          <Group style={{ elevation: 6 }} key={grp._id}>
            <SmallCircle><Icon name="group" size={35} color="#504469" /></SmallCircle>
            <GroupName>{grp.name}</GroupName>
            <GroupId>{grp._id}</GroupId>
            <IconButton icon="content-copy" color="#504469" size={23}
              onPress={() => { Clipboard.setString(grp._id); setCopied(true) }}
              style={{ alignSelf: "flex-end", position: 'absolute' }}
            />
            {grp.isAdmin ? <IconButton icon="delete" color="#FD708D" size={23}
              onPress={() => console.log('Pressed')}
              style={{ position: 'absolute', right: 30 }}
            /> : null}
          </Group>
        ))}
      </List >

      <Provider>
        <Portal>
          <Dialog
            visible={dialog}
            onDismiss={() => setDialog(false)}>
            <Dialog.Title style={{ color: "#504469" }}>
              {create === true ? "Create a group" : "Join a Group"}
            </Dialog.Title>
            <Dialog.Content >
              <TextInput
                value={data} placeholder={create === true ? "Group Name" : "Group Id"}
                onChangeText={data => setData(data)}
                mode="flat" underlineColor="gray"
              />
              <HelperText type={type} visible={error !== ''}>{error}</HelperText>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialog(false)}>CANCEL</Button>
              <Button onPress={submitForm}>{create ? "CREATE" : "JOIN"}</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Provider>
      <Provider>
        <Portal >
          <FAB.Group open={open} icon={open ? 'plus' : 'chat-plus'} color="white"
            fabStyle={{ backgroundColor: "#FD708D" }}
            actions={[
              {
                icon: 'account-multiple-plus',
                label: 'Create a group',
                onPress: () => { setCreate(true); setDialog(true); },
              },
              {
                icon: 'account-group',
                label: 'Join a group',
                onPress: () => { setCreate(false); setDialog(true); },
              },
            ]}
            onStateChange={() => setOpen(!open)}
          />
        </Portal>
      </Provider>
    </View >
  )
}

export default Groups;

