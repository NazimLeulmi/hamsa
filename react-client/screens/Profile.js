import React, { Component, createRef } from "react";
import { Container, Touch, Error } from "./Login";
import {
  ActivityIndicator, Image, AsyncStorage,
  TouchableOpacity, Text, Alert
} from "react-native";
import styled from "styled-components";
import ImagePicker from "react-native-image-picker";
import noAv from "../assets/noavatar.jpeg";
import { isEmpty } from "lodash";

const Avatar = styled(Image)`
  width: 200;
  height: 200;
  border-radius: 200;
  margin: 5px;
`;
const AvContainer = styled(TouchableOpacity)`
  height: 100%;
  width: 20%;
  position: relative;
  border: ${props =>
    props.src === props.selected ? "2px solid white" : "0px"};
  margin-left: 2px;
`;
const Av = styled(Image)`
  width: 100%;
  height: 100%;
`;

const AvatarList = styled.View`
  width: 100%;
  height: 100px;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin-top: 5px;
  margin-bottom: 5px;
`;

export const Uploader = styled(Touch)`
  border: ${props => (props.blue ? "2px solid white" : "2px solid black")};
  background: ${props => (props.blue ? "#5c96ac" : "white")};
  border-radius: 10px;
`;

export default class Profile extends Component {
  constructor(props) {
    super(props);
    console.log("Constructing Profile");
    this.AvatarRef = createRef();
    if (this.props.navigation.state.params) {
      console.log("Params exist");
      this.socket = this.props.navigation.state.params.socket;
      this.username = this.props.navigation.state.params.username;
      this.token = this.props.navigation.state.params.token;
      this.avatar = this.props.navigation.state.params.avatar;
      this.keyPair = this.props.navigation.state.params.keyPair;
    } else {
      this.socket = IO("http://192.168.0.166:5000");
      this.username = null;
      this.token = null;
      this.avatar = null;
      this.keyPair = null;
    }
    // Get Images Array
    if (this.socket === null || this.username === null || this.token === null || this.keyPair === null) {
      this.props.navigation.navigate("login");
    } else {
      console.log("Fetching Images From Profile");
      this.socket.emit("getImagesArray", { username: this.username, token: this.token });
    }
    this.state = {
      socket: this.socket,
      avatarSource: { uri: this.avatar.uri },
      downSource: null,
      avSelected: null,
      username: this.username,
      images: null,
      token: this.token,
      keyPair: this.keyPair
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
    const { socket, token, username } = this.state;
    console.log(token);
    if (
      socket !== null &&
      socket !== undefined &&
      token !== null &&
      username !== null
    ) {
      // handle getImagesArray response from server
      socket.on("imagesArray", array => {
        console.log("Received Images Array");
        this.setState({ images: array });
      });

      socket.on("logedout", () => {
        this.props.navigation.navigate("login", { socket });
      });

      socket.on("profileSaved", data => {
        const navigationData = {
          socket,
          token: data.token,
          username: data.username,
          avatar: data.avatar,
          keyPair: this.state.keyPair
        };
        this.props.navigation.navigate("rooms", navigationData);
      });
    } else {
      this.props.navigation.navigate("login", socket ? { socket } : null);
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
          avatarSource: { uri: "data:image/jpeg;base64," + response.data },
          avSelected: { uri: "data:image/jpeg;base64," + response.data }
        });
      }
    });
  };
  onSelect = name => {
    const { images } = this.state;
    let picked = null;
    for (let i in images) {
      if (images[i].name === name) {
        picked = images[i];
        break;
      }
    }
    this.setState({ avSelected: { uri: picked.uri }, avatarSource: { uri: picked.uri } });
    return;
  };
  static navigationOptions = {
    header: null
  };

  saveProfile = () => {
    const { socket, token, username } = this.state;
    if (token !== null && socket !== null) {
      socket.emit("saveProfile", { token, avatar: this.state.avatarSource });
    }
  };

  logOut = () => {
    Alert.alert(
      "الخروج من الحساب",
      "هل تريد أن تخرج من حسابك ؟",
      [
        {
          text: "اخْرج من الحساب",
          onPress: () => {
            AsyncStorage.removeItem("token", err => {
              if (err) {
                console.log(err);
                return;
              } else {
                console.log("Deleted Token ~ Logging out");
                this.state.socket.emit("logout", { token: this.state.token, username: this.state.username });
              }
            });
          }
        },
        {
          text: "تراجع عن الخروج",
          onPress: () => console.log("Cancel Pressed"),
        }
      ],
      { cancelable: false }
    );
  };
  render() {
    console.log("Profile Avatar", this.state.avatarSource);
    return (
      <Container
        contentContainerStyle={{ alignItems: "center", position: "relative" }}
      >
        <Text style={{ color: "white", fontSize: 22, margin: 5 }}>
          الملف
          <Text style={{ color: "#5c96ac" }}>الشخصي</Text>
        </Text>
        <AvatarList>
          {this.state.images ? (
            this.state.images.map((img, i) => {
              return (
                <AvContainer
                  selected={this.state.avSelected}
                  src={{ uri: img.uri }}
                  onPress={this.onSelect.bind(this, img.name)}
                  key={i}
                >
                  <Av source={{ uri: img.uri }} />
                </AvContainer>
              );
            })
          ) : (
              <ActivityIndicator style={{ margin: 3 }} size={40} color="black" />
            )}
        </AvatarList>
        <Text style={{ color: "white", fontSize: 18 }}>
          {this.props.navigation.state.params
            ? this.props.navigation.state.params.username
            : null}
          <Text style={{ color: "#5c96ac" }}> : الاسم</Text>
        </Text>
        <Avatar source={this.state.avatarSource} />
        <Uploader blue onPress={this.onPick}>
          <Text style={{ color: "white", textAlign: "center", fontSize: 20 }}>
            صوّر أو استعمل صورة من ملفاتك
          </Text>
        </Uploader>
        <Uploader
          onPress={this.saveProfile}
          style={{ border: "2px solid black" }}
        >
          <Text style={{ textAlign: "center", fontSize: 20 }}>
            حفظ الملف الشخصي
          </Text>
        </Uploader>
        <Uploader
          onPress={this.logOut}
          style={{ backgroundColor: "rgba(0,0,0,.5)" }}
        >
          <Text style={{ color: "#5c96ac", textAlign: "center", fontSize: 20 }}>
            اخْرج من الحساب
          </Text>
        </Uploader>
      </Container>
    );
  }
}
