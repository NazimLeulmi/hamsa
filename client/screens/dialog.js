import React from 'react';
import styled from "styled-components";
import {
  Portal, Provider, TextInput,
  Button, Dialog, HelperText, , IconButton
} from 'react-native-paper';


function Dial(create) {
  let [roomName, setRoomName] = React.useState('');
  let [roomId, setRoomId] = React.useState('');
  return (
    <Provider>
      <Portal>
        <Dialog
          visible={dialog}
          onDismiss={() => setDialog(false)}>
          <Dialog.Title style={{ color: "#504469" }}>
            {create ? "Create a room" : "Join a room"}
          </Dialog.Title>
          <Dialog.Content >
            <TextInput
              value={create ? roomName : roomId} placeholder={create ? "Room Name" : "Room Id"}
              onChangeText={data => setData(data)} mode="flat" underlineColor="gray"
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
  )
}


export default Dial;