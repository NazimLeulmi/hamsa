import React, { Component } from "react";
import {
  Icon,
  Input,
  H1,
  FormGrp,
  Touch,
  BtnTxt,
  ImgBg,
  Avoid,
  GrayFilter,
  Error,
  isRTL
} from "./Login";
import {
  ActivityIndicator,
  Text,
  AsyncStorage,
  Keyboard,
  View
} from "react-native";
import RegPic from "../assets/register.jpg";
import { RSA } from "react-native-rsa-native";

class Register extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);
    console.log("Constructing Register's State");
    let socket;
    if (this.props.navigation.state.params) {
      socket = this.props.navigation.state.params.socket;
    } else {
      socket = null;
    }
    this.state = {
      socket: socket,
      username: "",
      password: "",
      passwordc: "",
      userFocus: false,
      passFocus: false,
      pascFocus: false,
      usernameRTL: true,
      passwordRTL: true,
      passwordcRTL: true,
      errors: { username: "", passwordc: "", password: "" },
      generating: null,
      keyPair: {},
      images: null
    };
  }
  componentDidMount() {
    console.log("Mounting Register");
    const { socket } = this.state;
    if (socket === null || socket === undefined) {
      this.props.navigation.navigate("login");
    }
    socket.on("status", status => {
      if (status.errors) {
        this.setState({ errors: status.errors });
      }
      console.log(status);
    });
    socket.on("registered", () => {
      console.log("Registered from client");
      this.setState({ generating: false });
      setTimeout(() => {
        this.props.navigation.navigate("login", { socket });
      }, 2000);
    });
    socket.on("validatedInput", async (username) => {
      console.log("Validated Input");
      this.setState({ generating: true });
      // generate a keypair
      let keys = await RSA.generateKeys(4096);
      // New RSA keyPair to save in the persistent AsyncStorage
      let keyPair = {
        username: username,
        public_key: keys.public,
        private_key: keys.private
      };
      // Registeration Data after the validation
      let data = {
        username: this.state.username,
        password: this.state.password,
        publicKey: keys.public
      };
      // Check if the "keys" array exists locally
      try {
        let keysArray = await AsyncStorage.getItem("keys");
        // The Array Exists ==> Parse the array
        if (keysArray) {
          let parsedArray = await JSON.parse(keysArray);
          // Push the KeyPair to the parsed array
          await parsedArray.push(keyPair);
          // Store the the mutated array
          AsyncStorage.setItem("keys", await JSON.stringify(parsedArray));
        } else {
          // Create a new Array and save it locally
          AsyncStorage.setItem("keys", await JSON.stringify([keyPair]));
        }
        socket.emit("register", data);
        this.setState({ keyPair })
        console.log("data", data)
      } catch (err) {
        console.log(err);
        return;
      }
    })
  }


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
  onPasswordc = passwordc => {
    let isR2L;
    if (passwordc === "") isR2L = true;
    else {
      isR2L = isRTL(passwordc);
    }
    this.setState({ passwordc, passwordcRTL: isR2L });
    console.log(this.state.passwordc, this.state.passwordcRTL);
  };

  onRegister = () => {
    Keyboard.dismiss();
    let { socket, username, password, passwordc, generating } = this.state;
    if (generating === null || generating === false) {
      console.log(generating)
      socket.emit("validateRegister", { username, password, passwordc });
    }
  };
  onLogin = () => {
    Keyboard.dismiss();
    const { socket, generating } = this.state;
    if (generating === null || generating === false) {
      this.props.navigation.navigate("login", { socket });
    }
  };

  render() {
    const { errors } = this.state;
    return (
      <ImgBg ImageResizeMode="cover" source={RegPic}>
        <GrayFilter />
        <Avoid>
          <H1>
            تسجيل <Text style={{ color: "#5c96ac" }}>الحساب</Text>{" "}
          </H1>
          <FormGrp isFocused={this.state.userFocus}>
            <Input
              placeholder="اسمك"
              placeholderTextColor="white"
              onChangeText={this.onUsername}
              isRTL={this.state.usernameRTL}
              autoCorrect={false}
              spellCheck={false}
              onFocus={() => this.setState({ userFocus: true })}
              onBlur={() => this.setState({ userFocus: false })}
              selectionColor="white"
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
              isRTL={this.state.passwordRTL}
              secureTextEntry={true}
              onFocus={() => this.setState({ passFocus: true })}
              onBlur={() => this.setState({ passFocus: false })}
              selectionColor="white"
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
          <FormGrp isFocused={this.state.pascFocus}>
            <Input
              placeholder="تأكد من الكلمة السرية"
              onChangeText={this.onPasswordc}
              isRTL={this.state.passwordcRTL}
              placeholderTextColor="white"
              secureTextEntry={true}
              onFocus={() => this.setState({ pascFocus: true })}
              onBlur={() => this.setState({ pascFocus: false })}
              selectionColor="white"
              value={this.state.passwordc}
            />
            <Icon
              name="lock"
              size={30}
              color={this.state.pascFocus ? "white" : "#5C96AC"}
            />
          </FormGrp>
          {errors.passwordc !== null &&
            errors.passwordc !== "" &&
            errors.passwordc !== undefined ? (
              <Error>{errors.passwordc}</Error>
            ) : null}
          <Touch onPress={this.onRegister}>
            <BtnTxt>سجل</BtnTxt>
          </Touch>
          <Touch blue onPress={this.onLogin}>
            <BtnTxt >استخدم حسابي</BtnTxt>
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
              تم التسجيل بنجاح
            </Error>
            <ActivityIndicator size={40} color="#5C96AC" />
          </View>
        ) : null}
      </ImgBg>
    );
  }
}

export default Register;
