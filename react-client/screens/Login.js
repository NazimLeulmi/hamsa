import React, { PureComponent } from "react";
import styled from "styled-components/native";
import {
  ScrollView,
  AsyncStorage,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  ImageBackground,
  Text,
  View,
  Keyboard
} from "react-native";
import LoginBg from "../assets/login.jpg";
import IO from "socket.io-client/dist/socket.io";
import icon from "react-native-vector-icons/Feather";
import { RSA } from "react-native-rsa-native";
export const Touch = styled(TouchableOpacity)`
  width: 80%;
  padding: 10px;
  background: ${props =>
    props.blue ? "rgba(238, 130, 238, 0.45)" : "rgba(255, 255, 255, 0.45)"};
  /* border: ${props => (props.blue ? "1px solid #5c96ac" : "1px solid #ff01fb")}; */
  margin: 5px;
  border-radius:3px;
`;
export const H1 = styled.Text`
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-align: center;
  margin: 5px;
  text-align: right;
`;
export const P = styled.Text`
  font-size: 20;
  font-weight: normal;
  color: white;
  text-align: center;
`;
export const BtnTxt = styled(P)`
  color: black ;
  font-weight: 800;
  font-size: 22px;
`;

export const Input = styled.TextInput`
  text-align: ${props => (props.isRTL ? "right" : "left")};
  width: 80%;
  height: 100%;
  font-size: 20px;
  color: white;
  padding-right: 10px;
`;
export const Error = styled.Text`
  font-size: 14;
  color: white;
  text-align: left;
  width: 80%;
`;
export const Container = styled(ScrollView)`
  background-color: #333333;
  position: relative;
`;
export const GrayFilter = styled.View`
  position: absolute;
  background: rgba(0, 0, 0, 0.65);
  width: 100%;
  height: 100%;
`;
export const Avoid = styled(KeyboardAvoidingView)`
  margin-top: 20px;
  margin-bottom: 20px;
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const FormGrp = styled.View`
  position: relative;
  width: ${props => (props.w ? props.w : "80%")};
  height: ${props => (props.h ? props.h : "60px")};
  border: 1px solid #ff01fb;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  border-bottom-color: ${props => (props.isFocused ? "#5c96ac" : "white")};
  margin: 5px;
`;

export const Icon = styled(icon)`
  position: absolute;
  left: 5px;
`;

export const ImgBg = styled(ImageBackground)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;
export function isRTL(s) {
  var ltrChars =
    "A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF" +
    "\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF",
    rtlChars = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC",
    rtlDirCheck = new RegExp("^[^" + ltrChars + "]*[" + rtlChars + "]");

  return rtlDirCheck.test(s);
}
export default class Login extends PureComponent {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    console.log("Constructing Login's Component State");
    if (this.props.navigation.state.params) {
      this.socket = this.props.navigation.state.params.socket;
    } else {
      this.socket = IO("http://192.168.0.166:5000");
    }


    this.state = {
      socket: this.socket,
      username: "",
      password: "",
      userFocus: false,
      passFocus: false,
      usernameRTL: true,
      passwordRTL: true,
      errors: { username: "", passwordc: "", password: "" },
      generating: null,
      token: this.token,
      keyPair: null
    };
  }

  checkToken = async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      if (token) {
        console.log("Found a token");
        this.state.socket.emit("validateToken", token); // wait for validToken
      } else {
        console.log("No Auth Token");
      }
    } catch (err) {
      console.log(err);
      return;
    }
  }
  componentDidMount() {
    const { socket } = this.state;
    console.log("Mounting Login");
    if (socket !== undefined && socket !== null) {
      // if the client has a token validate it for auto-login
      this.checkToken();
      // validate KeyPair when the server verifies the token
      socket.on("validToken", async data => {
        // Token has been verified by the server
        console.log("Found a valid token");
        let { username, avatar, token, publicKey } = data;
        this.keyValidation(publicKey, avatar, username, token);
      });

      // The server emits this when the server assigns a new keyPair onLogin
      socket.on("keyPairAssigned", data => {
        this.setState({ generating: false });
        let { username, avatar, token } = data;
        let navigationData = {
          socket, username,
          token, avatar,
          keyPair: this.state.keyPair,
        }
        if (avatar.name === "noAv" && avatar.name) {
          this.props.navigation.navigate("profile", navigationData);
        } else {
          this.props.navigation.navigate("rooms", navigationData);
        }
      });

      socket.on("connect", () => {
        console.log("Connected From Login");
      });
      socket.on("status", status => {
        if (status.errors) {
          this.setState({ errors: status.errors });
        }
        console.log(status);
      });
      socket.on("token", async data => {
        let { publicKey, username, avatar, token } = data;
        try {
          // store the token in the persistent storage
          await AsyncStorage.setItem("token", token);
          // RSA KeyPair Validation
          this.keyValidation(publicKey, avatar, username, token);
        } catch (err) {
          console.log(err);
          return;
        }
      });
    }
  }


  keyValidation = async (publicKey, avatar, user, token) => {
    const { socket } = this.state;
    try {
      let stringified = await AsyncStorage.getItem("keys");
      // The Key Pairs Array exists
      if (stringified) {
        // If the array exists , parse the stringified array
        let array = await JSON.parse(stringified);
        // Try to Find the current user's key pair if it exists
        let keyPairIndex = await array.findIndex(
          pair => pair.username === user && pair.public_key === publicKey
        );
        if (keyPairIndex !== -1) {
          // The key pair exists & its valid
          // Redirect
          let navigationData = {
            socket: this.state.socket, keyPair: array[keyPairIndex],
            username: user, publicKey, avatar, token
          }
          if (avatar.name && avatar.name === "noAv") {
            this.props.navigation.navigate("profile", navigationData)
          } else {
            this.props.navigation.navigate("rooms", navigationData)
          }
        } else {
          // (the key pair exists & invalid) || (key pair doesn't exist)
          this.setState({ generating: true });
          // Generate a new RSA Key Pair
          let keys = await RSA.generateKeys(4096);
          let pairIndex = await array.findIndex(pair => pair.username === user);
          if (pairIndex !== -1) {
            // The key pair exists but the keys are invalid
            // Replace the Invalid Keys in the array (Mutate)
            array[pairIndex].public_key = keys.public;
            array[pairIndex].private_key = keys.private;
          } else {
            // the key pair doesn't exist
            await array.push({
              username: user,
              public_key: keys.public,
              private_key: keys.private
            })
          }
          // Store the replaced data
          this.setState({
            keyPair: {
              username: user,
              public_key: keys.public,
              private_key: keys.private,
            }
          })
          await AsyncStorage.setItem("keys", JSON.stringify(array));
          socket.emit("assignKey", { token, username: user, publicKey: keys.public });
          return;
        }
      } else {
        // The Key Pairs Array doesn't exist
        this.setState({ generating: true })
        let keys = await RSA.generateKeys(4096);
        let array = [{
          username: user,
          public_key: keys.public,
          private_key: keys.private
        }]

        this.setState({
          keyPair: {
            username: user,
            public_key: keys.public,
            private_key: keys.private,
          }
        })
        AsyncStorage.setItem("keys", JSON.stringify(array));
        socket.emit("assignKey", { token, username: user, publicKey: keys.public });
      }
    } catch (err) {
      console.log(err);
      return;
    }
  };

  onSubmit = () => {
    Keyboard.dismiss();
    const { socket, username, password, generating } = this.state;
    if (socket !== null && socket !== undefined) {
      if (generating === null || generating === false) {
        socket.emit("loginRequest", { username, password });
        console.log("login Request from client");
      }
    }
  };

  onRegister = () => {
    const { socket, generating } = this.state;
    Keyboard.dismiss();
    if (generating === false || generating === null) {
      this.props.navigation.navigate("register", { socket });
    }
  };

  onUsername = username => {
    let isR2L;
    if (username === "") isR2L = true;
    else {
      isR2L = isRTL(username);
    }
    this.setState({ username, usernameRTL: isR2L });
    console.log(this.state.username, this.state.usernameRTL);
  };

  onPassword = password => {
    let isR2L;
    if (password === "") isR2L = true;
    else {
      isR2L = isRTL(password);
    }
    this.setState({ password, passwordRTL: isR2L });
    console.log(this.state.password, this.state.passwordRTL);
  };

  render() {
    const { errors } = this.state;
    return (
      <ImgBg ImageResizeMode="center" source={LoginBg}>
        <GrayFilter />
        <Avoid>
          <H1>
            تسجيل <Text style={{ color: "#5c96ac" }}>الدخول</Text>{" "}
          </H1>
          <FormGrp isFocused={this.state.userFocus}>
            <Input
              placeholder="اسمك"
              placeholderTextColor="white"
              onChangeText={this.onUsername}
              autoCorrect={false}
              spellCheck={false}
              onFocus={() => this.setState({ userFocus: true })}
              onBlur={() => this.setState({ userFocus: false })}
              selectionColor="white"
              isRTL={this.state.usernameRTL}
              value={this.state.username}
            />
            <Icon
              name="user"
              size={30}
              color={this.state.userFocus ? "white" : "#5C96AC"}
            />
          </FormGrp>
          {errors.username !== null &&
            errors.username !== "" &&
            errors.username !== undefined ? (
              <Error>{errors.username}</Error>
            ) : null}
          <FormGrp isFocused={this.state.passFocus}>
            <Input
              placeholder="الكلمة السرية"
              placeholderTextColor="white"
              onChangeText={this.onPassword}
              secureTextEntry={true}
              onFocus={() => this.setState({ passFocus: true })}
              onBlur={() => this.setState({ passFocus: false })}
              selectionColor="white"
              isRTL={this.state.passwordRTL}
              value={this.state.password}
            />
            <Icon
              name="lock"
              size={30}
              color={this.state.passFocus ? "white" : "#5C96AC"}
            />
          </FormGrp>
          {errors.password !== null &&
            errors.password !== "" &&
            errors.password !== undefined ? (
              <Error>{errors.password}</Error>
            ) : null}
          <Touch onPress={this.onSubmit}>
            <BtnTxt>الدخول</BtnTxt>
          </Touch>
          <Touch blue onPress={this.onRegister}>
            <BtnTxt >تسجيل حساب</BtnTxt>
          </Touch>
          <Touch blue onPress={async () => await AsyncStorage.clear()}>
            <BtnTxt >Clear Storage</BtnTxt>
          </Touch>
        </Avoid>
        {this.state.generating === true ? (
          <View>
            <Error>الرجاء الانتظار سوف يتم توليد مفاتيح التشفير</Error>
            <ActivityIndicator
              style={{ margin: 3 }}
              size={40}
              color="#5C96AC"
            />
          </View>
        ) : null}
        {this.state.generating === false ? (
          <View>
            <Error style={{ color: "#5C96AC", fontSize: 18 }}>
              تم الدخول بنجاح
            </Error>
            <ActivityIndicator size={40} color="#5C96AC" />
          </View>
        ) : null}
      </ImgBg>
    );
  }
}
