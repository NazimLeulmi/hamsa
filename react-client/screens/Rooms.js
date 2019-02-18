import React, { Component } from "react";
import { Error } from "./Login";
import Not from "react-native-push-notification";
import {
  Image, TouchableOpacity, ActivityIndicator,
  Text, View, ScrollView, RefreshControl, Platform
} from "react-native";
import styled from "styled-components";
import ImagePicker from "react-native-image-picker";
import { RSA } from "react-native-rsa-native";
import { AES, mode, enc, pad } from "crypto-js";
import Bar from "./components/Bar";
import InRoom from "./components/Room";
import PopForm from "./components/PopForm";
import Alert from "./components/Alert";

///////////////////////////////////////////
// React Push Notification Configuration //
//////////////////////////////////////////
Not.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },

  // (required) Called when a remote or local notification is opened or received
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);

    // process the notification

    // required on iOS only 
    if (Platform.OS === "ios") {
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    }
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,
  /**
    * (optional) default: true
    * - Specified if permissions (ios) and token (android and ios) will requested or not,
    * - if not, you must call PushNotificationsHandler.requestPermissions() later
    */
  requestPermissions: true,
});
///////////////////////
// Styled Components//
/////////////////////
export const MainContainer = styled.View`
  width: 100%;
  height: 100%;
  background-color: #333333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding-top:100px; */
`;
const RoomsContainer = styled(ScrollView)`
  width: 100%;
  margin-top:100px;
`;

const GroupAv = styled(Image)`
  width: 50;
  height: 50;
  border-radius: 50;
  margin: 10px;
`;
const Room = styled(TouchableOpacity)`
  width: 100%;
  height: 80;
  background: rgba(0, 0, 0, 0.85);
  padding: 5px;
  border: 1px solid black;
  border-bottom-color: #5c96ac;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RoomText = styled(Text)`
  color: white;
  font-size: 18px;
`;





export default class Rooms extends Component {
  constructor(props) {
    super(props);
    console.log("Constructing  Rooms State");
    if (this.props.navigation.state.params) {
      this.socket = this.props.navigation.state.params.socket;
      this.image = this.props.navigation.state.params.avatar;
      this.username = this.props.navigation.state.params.username;
      this.token = this.props.navigation.state.params.token;
      this.keyPair = this.props.navigation.state.params.keyPair;
    } else {
      this.token = null;
      this.keyPair = null;
      this.socket = null;
    }

    if (this.token !== null && this.keyPair !== null && this.socket !== null) {
      this.socket.emit("getRooms", this.token);
      this.socket.emit("getRequests", this.token);
      // console.log("Constructor KeyPair", this.keyPair.username);
    } else {
      this.props.navigation.navigate("login", { socket: this.socket })
    }
    console.log("image", this.image)
    this.state = {
      socket: this.socket,
      keyPair: this.keyPair,
      username: this.username,
      image: this.image,
      token: this.token,
      rooms: [],
      room: null,
      decrypted: [{ roomName: "", chat: [] }],
      userRequests: [], //  roomLeader ==Invites==> User {roomName:string,leader:string}
      roomRequests: [], //  User ==Requests==> roomLeader [String(username)]
      request: { roomName: "", person: "" }, // Alert // PopUp // Data
      ///////////////////////////////
      dropdown: false,//////////////
      inRoom: false,///////////////
      form: false,////////////////
      refreshing: false,/////////
      decrypting: false,////////
      inUserRequests: false,///
      inRoomRequests: false,//
      handleRequest: false,//
      joinRequest: false,////
      /////////////////////
    };
  }

  options = {
    title: "Select Avatar",
    storageOptions: {
      skipBackup: true,
      path: "images"
    }
  };

  componentDidMount() {
    console.log("Mounting Rooms");
    console.log(this.state.image);
    const { socket, keyPair } = this.state;
    if (socket !== null && socket !== undefined && keyPair !== null && keyPair !== undefined) {
      console.log("KeyPairMounted", this.state.keyPair.username);
      socket.on("rooms", rooms => {
        console.log("Client received rooms")
        this.setState({ rooms, refreshing: false }, () => console.log(rooms));
      });
      socket.on("userRequests", requests => {
        if (requests !== null && requests !== undefined) {
          this.setState({ userRequests: requests, refreshing: false });
        }
      })
      socket.on("invitationAccepted", roomName => {
        let { userRequests } = this.state;
        let reqIndex = userRequests.findIndex(req => req.roomName === roomName);
        if (reqIndex !== -1) {
          userRequests.splice(reqIndex, 1);
          this.setState({
            handleRequest: false,
            request: { roomName: "", person: "" },
            userRequests
          })
          this.state.socket.emit("getRooms", this.state.token);
        } else {
          console.log("The Request doesn't Exist");
        }
      })
      socket.on("deletedUserRequest", async roomName => {
        let { userRequests } = this.state;
        let reqIndex = userRequests.findIndex(req => req.roomName === roomName);
        if (reqIndex !== -1) {
          userRequests.splice(reqIndex, 1);
          this.setState({
            handleRequest: false,
            request: { roomName: "", person: "" },
            userRequests
          })
        } else {
          console.log("The Request doesn't Exist");
        }
      })
      socket.on("Msg", data => {
        let { keyPair, decrypted, rooms } = this.state;
        let payload = data.to.find(payload => payload.publicKey === keyPair.public_key)
        if (payload !== undefined && payload !== null) {
          let now = new Date();
          let date = now.getDate() + "-" + now.getMonth() + 1 + "-" + now.getFullYear();
          let time = now.getHours() + ":" + now.getMinutes();
          let chatIndex = decrypted.findIndex(room => room.roomName === data.roomName);
          let roomIndex = rooms.findIndex(room => room.name === data.roomName);
          RSA.decrypt(payload.key, keyPair.private_key)
            .then(decryptedKey => {
              let dec = AES.decrypt(data.msg, decryptedKey,
                { iv: data.iv, mode: mode.CBC, padding: pad.Pkcs7 })
              let plainText = dec.toString(enc.Utf8);
              console.log(`Received Msg`, plainText)
              if (chatIndex !== -1) {
                decrypted[chatIndex].chat.push({ msg: plainText, date, time, from: data.from })
              } else {
                decrypted.push({
                  roomName: data.roomName,
                  chat: [{ msg: plainText, date, time, from: data.from }]
                });
              }
              rooms[roomIndex].chat.push({
                msg: data.msg, createdAt: now,
                iv: data.iv, from: data.from, to: data.to
              });
              this.setState({ decrypted, rooms });
            }).catch(err => console.log(err));
        } else {
          console.log("Payload is Null");
        }

      });
      socket.on("roomRequestAccepted", async (data) => {
        // Destructor the Data
        let { person, roomName, id } = data;
        // find the room index
        let roomIndex = this.state.rooms.findIndex(room => room.name === roomName);
        try {
          if (roomIndex !== -1) {
            // avoid mutation by copying the values into a new array
            let rooms = [...this.state.rooms];
            rooms[roomIndex].requests = [...this.state.rooms[roomIndex].requests];
            let requests = [...this.state.roomRequests];
            let reqIndex = requests.findIndex(req => req === person);
            if (reqIndex !== -1) {
              requests.splice(reqIndex, 1);
              // find the request index
              let requestIndex = rooms[roomIndex].requests.findIndex(req => req === person);
              if (requestIndex !== -1) {
                console.log("Deleting The Request");
                rooms[roomIndex].requests.splice(requestIndex, 1);
                console.log("Spliced The Requests");
                if (id) {
                  rooms[roomIndex].users = [...this.state.rooms[roomIndex].users];
                  console.log("Pushing a user");
                  rooms[roomIndex].users.push(id);
                }
                this.setState({ rooms, roomRequests: requests, handleRequest: false });
              } else {
                console.log("The Request Doesn't Exist");
                return;
              }
            } else {
              console.log("The Room Request Doesn't Exist");
              return;
            }

          } else {
            console.log("The Room Doesn't Exist");
            return;
          }
        } catch (err) {
          console.log(err);
        }

      })
      socket.on("roomCreated", room => {
        let { rooms } = this.state;
        console.log("Room has been created", room);
        if (rooms === null || rooms.length === 0) {
          setTimeout(() => {
            this.setState({
              rooms: [room],
              form: false,
            });
          }, 650);
        } else {
          setTimeout(() => {
            rooms.push(room);
            this.setState({
              rooms,
              form: false,
              error: null,
            });
          }, 650);
        }
      });
    } else {
      console.log("Something is Null !!");
    }
  }

  onPick = () => {
    ImagePicker.showImagePicker(this.options, response => {
      console.log(response.uri);
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else {
        // You can also display the image using data:
        // const source = { uri: 'data:image/jpeg;base64,' + response.data };
        if (this.state.socket !== null && this.state.socket !== undefined) {
          this.state.socket.emit("imageUp", response.data);
        }
        this.setState({
          avatarSource: { uri: "data:image/jpeg;base64," + response.data }
        });
      }
    });
  };

  getRoom = async room => {
    let { keyPair, decrypted } = this.state;
    // Find Decrypted Room Chat if it exists
    let Index = decrypted.findIndex(obj => obj.roomName === room.name);
    if (room.chat.length !== 0 && room.chat !== undefined && room.chat !== null) {
      this.setState({ decrypting: true, roomRequests: room.requests });
      // loop through the chat array in the room
      let decryptedChat = [];
      room.chat.forEach((chat, i) => {
        // get time & date
        console.log("date:", chat.createdAt);
        let now = new Date(chat.createdAt);
        let date = now.getDate() + "-" + now.getMonth() + 1 + "-" + now.getFullYear();
        let time = now.getHours() + ":" + now.getMinutes();
        // find my personal payload to decrypt
        let payload = chat.to.find(data => data.publicKey === keyPair.public_key);
        if (payload !== undefined && payload !== null) {
          // Decrypt the AES256 Key with the RSA private key
          RSA.decrypt(payload.key, keyPair.private_key)
            .then(key => {
              let dec = AES.decrypt(chat.msg, key,
                { iv: chat.iv, mode: mode.CBC, padding: pad.Pkcs7 })
              let msg = dec.toString(enc.Utf8);
              console.log(`MsG:{${i}}`, msg)
              decryptedChat.push({ msg, date, time, from: chat.from })
              if (Index !== -1) {
                decrypted[Index].chat = decryptedChat;
              } else {
                decrypted.push({ roomName: room.name, chat: decryptedChat });
              }
              if (decryptedChat.length === room.chat.length) {
                this.setState({ inRoom: true, form: false, decrypted, room, decrypting: false }, () => {
                  console.log("Room's Chat has been loaded")
                });
              }
            })
            .catch(err => console.log(err))
        } else {
          console.log("Payload is null");
          this.setState({ inRoom: true, form: false, decrypted, room, decrypting: false });
        }
      })
    } else {
      this.setState({ inRoom: true, form: false, room, decrypted, roomRequests: room.requests });
    }
  } // End of getRoom

  static navigationOptions = {
    header: null
  };

  toggleForm = () => setTimeout(() => this.setState(prevState => {
    return { form: !prevState.form, joinRequest: false }
  }), 250);

  requestToJoin = () => setTimeout(() => this.setState(prevState => {
    return { form: !prevState.form, joinRequest: !prevState.joinRequest }
  }), 250);


  leaveRoom = () => setTimeout(() => this.setState({
    inRoom: false, room: null,
    dropdown: false, form: false, inUserRequests: false
  }), 500);

  goInUserRequests = () => this.setState({ inUserRequests: true });
  goInRoomRequests = () => this.setState({ inRoomRequests: true });
  leaveRoomRequests = () => this.setState({ inRoomRequests: false });

  Refresh = () => {
    this.setState({ refreshing: true });
    if (this.state.inUserRequests) {
      this.state.socket.emit("getRequests", this.state.token);
    } else {
      this.state.socket.emit("getRooms", this.state.token);
    }
  };


  inviteToggle = () => {
    this.setState({ dropdown: false, invite: true });
  };

  pushAlert = (person, roomName) => {
    this.setState({
      request: { person, roomName },
      handleRequest: true
    })
  }
  popAlert = () => {
    this.setState({
      request: { person: "", roomName: "" },
      handleRequest: false
    })
  }

  dropDown = () => this.setState(prev => {
    if (this.state.inRoom === true) {
      return { dropdown: !prev.dropdown }
    }
  })

  navigateProfile = () => {
    this.props.navigation.navigate("profile", {
      socket: this.state.socket,
      avatar: this.state.image,
      token: this.state.token,
      username: this.state.username,
      keyPair: this.state.keyPair
    })
  }

  render() {
    console.log("Rendering Rooms");
    let body;
    if (this.state.inRoom) {
      if (this.state.inRoomRequests === false) {
        body = (
          <InRoom
            decChat={this.state.decrypted.find(obj => obj.roomName === this.state.room.name)}
            roomName={this.state.room.name}
            keyPair={this.state.keyPair}
            dropdown={this.state.dropdown}
            toggleForm={this.toggleForm.bind(this)}
            dropDown={this.dropDown.bind(this)}
            token={this.state.token}
            socket={this.state.socket}
          />
        )
      } else {
        body = (
          <RoomsContainer>
            {this.state.roomRequests.map((req, i) => {
              return (
                <Room key={i} onPress={this.pushAlert.bind(this, req, this.state.room.name)}>
                  <RoomText style={{ color: "#5c96ac" }}>{req}
                    <RoomText> requests you to join</RoomText>
                  </RoomText>
                  <RoomText style={{ fontSize: 20, color: "#ff01fb", marginLeft: "auto" }}>
                    {this.state.room.name}
                  </RoomText>
                </Room>
              )
            })}
          </RoomsContainer>
        )
      }
    } else {
      if (this.state.decrypting) {
        // Loading Indicator
        body = (
          <View>
            <Error>الرجاء الانتظار سوف يتم فك تشفير الرسائل </Error>
            <ActivityIndicator
              style={{ margin: 3 }}
              size={40}
              color="#5C96AC"
            />
          </View>
        )
      } else {
        body = (
          <RoomsContainer
            // Rooms List Refresh Controler
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.Refresh}
              />
            }

          >
            {/* List of Rooms */}
            {this.state.inUserRequests === false ?
              this.state.rooms.map((room, i) => {
                return (
                  <Room key={i} onPress={this.getRoom.bind(this, room)}>
                    <GroupAv source={room.avatar} />
                    <RoomText>{room.name}</RoomText>
                    <RoomText
                      style={{ position: "absolute", right: 5, margin: 5 }}
                    >{`{${room.users.length}}`}</RoomText>
                  </Room>
                );
              }) : this.state.userRequests.map((req, i) => {
                return <Room key={i} onPress={this.pushAlert.bind(this, req.leader, req.roomName)}>
                  <RoomText style={{ color: "#5c96ac" }}>{req.leader}
                    <RoomText> invites you to join</RoomText>
                  </RoomText>
                  <RoomText style={{ fontSize: 20, color: "#ff01fb", marginLeft: "auto" }}>
                    {req.roomName}
                  </RoomText>
                </Room>
              })
            }
          </RoomsContainer>
        )
      }
    }
    return (
      <MainContainer>
        {/* Top Bar */}
        <Bar navigateProfile={this.navigateProfile.bind(this)}
          toggleForm={this.toggleForm.bind(this)}
          dropDown={this.dropDown.bind(this)}
          leaveRoom={this.leaveRoom.bind(this)}
          username={this.state.username}
          roomName={this.state.room ? this.state.room.name : null}
          roomAvatar={this.state.room ? this.state.room.avatar : null}
          roomLeader={this.state.room ? this.state.room.leader : null}
          inRoom={this.state.inRoom}
          inUserRequests={this.state.inUserRequests}
          inRoomRequests={this.state.inRoomRequests}
          goInUserRequests={this.goInUserRequests.bind(this)}
          goInRoomRequests={this.goInRoomRequests.bind(this)}
          leaveRoomRequests={this.leaveRoomRequests.bind(this)}
          requestToJoin={this.requestToJoin.bind(this)}
          joinRequest={this.state.joinRequest}
          image={this.state.image}
          form={this.state.form}
          dropdown={this.state.dropdown}
        />

        {body}
        {/* PopUp Form (Room Creation|Invite a User) */}
        {this.state.form ? <PopForm toggleForm={this.toggleForm.bind(this)}
          socket={this.state.socket}
          joinRequest={this.state.joinRequest}
          requestToJoin={this.requestToJoin.bind(this)}
          token={this.state.token} roomName={this.state.room ? this.state.room.name : null}
          username={this.state.username} inRoom={this.state.inRoom}
        /> : null}

        {/* Alert to Handle User & Room Requests */}
        {this.state.handleRequest === true ?
          <Alert
            roomName={this.state.request.roomName}
            inRoomRequests={this.state.inRoomRequests}
            person={this.state.request.person}
            popAlert={this.popAlert.bind(this)}
            token={this.state.token}
            socket={this.state.socket}
          />
          : null}

      </MainContainer>
    );
  }
}
