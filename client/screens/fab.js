import React from 'react';
import {
  Portal, Provider, FAB, Text
} from 'react-native-paper';


function FabGroup({ open, setOpen, setCreate, setDialog }) {
  return (
    < Provider >
      <Portal >
        <FAB.Group open={open} icon={open ? 'plus' : 'chat-plus'} color="white"
          fabStyle={{ backgroundColor: "#FD708D" }}
          actions={[
            {
              icon: 'account-multiple-plus',
              label: 'Create a room',
              onPress: () => { setCreate(true); setDialog(true); },
            },
            {
              icon: 'account-group',
              label: 'Join a room',
              onPress: () => { setCreate(false); setDialog(true); },
            },
          ]}
          onStateChange={() => setOpen(!open)}
        />
      </Portal>
    </Provider >
  )
}


export default FabGroup;