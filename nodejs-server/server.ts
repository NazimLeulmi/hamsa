import * as express from "express";
import * as mongoose from "mongoose";
import * as morgan from "morgan";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import { config } from "dotenv";
import * as IO from "socket.io";
import { isEmpty } from "lodash";
import * as http from "http";
import { genSalt, hash, compare } from "bcryptjs";
import Usr from "./models/User.js";
import Session from "./models/Session.js";
import Room from "./models/Room.js";
import { randomBytes, createCipheriv, publicEncrypt, createCipher } from "crypto";
import { mode, AES, enc, pad } from "crypto-js";
import { readFileSync } from "fs";
var constants = require("constants");
console.log(constants);
// Read Images
let images = [];
images.push({
  name: "Av1",
  uri:
    "data:image/jpeg;base64," +
    readFileSync("./assets/avatar1.jpeg", "base64")
});
images.push({
  name: "Av2",
  uri:
    "data:image/jpeg;base64," +
    readFileSync("./assets/avatar2.jpeg", "base64")
});
images.push({
  name: "Av3",
  uri:
    "data:image/jpeg;base64," +
    readFileSync("./assets/avatar3.jpeg", "base64")
});
images.push({
  name: "Av4",
  uri:
    "data:image/jpeg;base64," +
    readFileSync("./assets/avatar4.jpeg", "base64")
});
images.push({
  name: "Av5",
  uri:
    "data:image/jpeg;base64," +
    readFileSync("./assets/avatar5.jpeg", "base64")
});
// Extra Images
let imgs = [];
imgs.push({
  name: "group",
  uri:
    "data:image/png;base64," +
    readFileSync("./assets/group.png", "base64")
});
imgs.push({
  name: "noAv",
  uri:
    "data:image/jpeg;base64," +
    readFileSync("./assets/noavatar.jpeg", "base64")
});

// loads .env into process.env
config();
// // load keys
// const pkey = readFileSync('key.pem').toString("ascii");
// const sig = createSign("RSA-SHA256");

// instantiating our server
const app: express.Application = express();

// protection layer
app.use(helmet());
// connect to mongoose / mongodb , returns a promise
mongoose
  .connect(
    "mongodb://localhost:27017/Chat",
    { useNewUrlParser: true }
  )
  .then(() => console.log(`${process.env.USER} Connected to MongoDB `))
  .catch(err => console.log(err));

// parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// cross-origin resource sharing
app.use(cors());
// prod mode
app.use(compression());
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.json({ home: "Key generation route" });
});
app.get("**", (req, res) => {
  res.json({ success: "Hello world from express" });
});

type User = {
  username?: string;
  password?: string;
  passwordc?: string;
  public_key?: string;
};

const server = http.createServer(app);
const io = IO(server);
server.listen(process.env.PORT, () => {
  console.log(`Express Server on port: ${process.env.PORT}`);
});

// Form Validation Function
const validateInputs = (data: User) => {
  // Destructuring for better readability
  const { username, password, passwordc } = data;
  // initialize an errors object
  let errors: User = { username: "", password: "", passwordc: "" };
  // validate the username
  if (username === null || username === undefined || username === "") {
    errors.username = "the username is a required field";
  } else if (username.length < 3 || username.length > 35) {
    errors.username = "يجب على الاسم أن يتكون من 3~35 حرف";
  }
  // validate the password
  if (password === null || password === undefined || password === "") {
    errors.password = "the password is a required field";
  } else if (password.length < 8 || password.length > 35) {
    errors.password = "the password must be 8~35 characters";
  } else if (
    passwordc !== undefined &&
    passwordc !== null &&
    passwordc !== password
  ) {
    errors.passwordc = "the two passwords must be equal";
  }
  // if the input form doesn't have password confirmation , delete the error
  if (passwordc === null || passwordc === undefined) {
    delete errors.passwordc;
    if (errors.password + errors.username === "") {
      return { isValid: true, errors };
    } else {
      return { isValid: false, errors };
    }
  }

  if (errors.password + errors.passwordc + errors.username === "") {
    return { isValid: true, errors };
  } else {
    return { isValid: false, errors };
  }
};

io.on("connection", socket => {
  console.log(`socket: ${socket.id} connected`);

  // ~~~ User Registeration Validation ~~~ //
  socket.on("validateRegister", async (data: User) => {
    // Server Side Validation Function
    let { errors, isValid } = validateInputs(data);
    // Check if the input form is valid
    if (isValid) {
      try {
        // Check If The User Exists
        let user = await Usr.findOne({ username: data.username });
        if (user) {
          errors.passwordc = `${user.username} is used by another user`;
          io.to(socket.id).emit("status", {
            status: `${user.username} is used by another user`,
            errors
          })
          return
        } else {
          // Emit to the client that the form is valid.. 
          // to generate the RSA keyPair on the client
          io.to(socket.id).emit("validatedInput", data.username);
          return;
        }
      } catch (err) {
        console.log(err);
        return;
      }
    } else {
      io.to(socket.id).emit("status", {
        status: `${socket.id}'s reg-form is invalid`,
        errors
      });
      console.log({
        authRefused: `${socket.id}'s reg-form is invalid`,
        errors
      });
    }
  }); // End of User Registeration Validation <===

  //  Handle User Registeration after the... 
  //  Server Validation + Client RSA Key Generation
  socket.on("register", async (data) => {
    let { password, username, publicKey } = data;
    // At this point we assume that the inputs are valid
    // Generate a salt ==> hash the password ==> create a new user
    try {
      let salt = await genSalt(10);
      let passHashed = await hash(password, salt)
      const userModel = new Usr({
        username: username,
        password: passHashed,
        publicKey: publicKey,
        avatar: imgs[await imgs.findIndex(img => img.name === "noAv")]
      });
      await userModel.save();
      io.to(socket.id).emit("registered");
    } catch (err) {
      console.log(err);
      return;
    }

  });

  // Manage Login Requests
  socket.on("loginRequest", async data => {
    let { username, password } = data;
    console.log(`${username} is trying to login`);
    const { isValid, errors } = validateInputs(data);
    // first validation
    if (isValid) {
      try {
        let user = await Usr.findOne({ username });
        if (user) {
          // The user exists , compare the password with the saved hash
          let passValid = await compare(password, user.password);
          if (passValid) {
            // The password is valid = The user is authenticated
            // Generate Authentication Token
            let token = await randomBytes(32).toString("hex");
            // Create a new Session Model to store the new token
            let session = await new Session({
              token,
              user: user._id
            })
            // Mutate the User's Model to add the new Session's Id
            user.session = session._id;
            // Save The mutated/new Models
            let newSession = await session.save();
            let newUser = await user.save();
            // Emit data to the client
            io.to(socket.id).emit("token", {
              token: newSession.token,
              publicKey: newUser.publicKey,
              avatar: newUser.avatar,
              username: newUser.username,
            })
          } else {
            // The password is Invalid 
            errors.password = "The password is invalid";
            io.to(socket.id).emit("status", { status: "The password is Invalid", errors })
            return;
          }
        } else {
          // The user doesn't exist in the database
          errors.password = "The user doesn't exist"
          console.log("the user doesn't exist");
          io.to(socket.id).emit("status", { status: "The user doesn't exist", errors })
          return;
        }

      } catch (err) {
        console.log(err)
      }
    } else {
      // The Registeration Form is Invalid
      io.to(socket.id).emit("status", { status: "invalid registeration form", errors })
      return;
    }
  })


  // Assigning new public key's to current users
  socket.on("assignKey", async data => {
    console.log("Assigning a new key");
    let { token, username, publicKey } = data;
    try {
      let session = await Session.findOne({ token });
      if (session) {
        // The Session Exists
        let user = await Usr.findById(session.user);
        if (user) {
          user.publicKey = publicKey;
          let newUser = await user.save();
          io.to(socket.id).emit("keyPairAssigned", {
            token: session.token,
            username: newUser.username,
            avatar: newUser.avatar
          })
        } else {
          console.log("The User Doesn't Exist");
          return;
        }
      } else {
        console.log("The Session Doesn't Exist");
        return;
      }
    } catch (err) {
      console.log(err);
    }
  });

  // Handle Token Validation requests
  socket.on("validateToken", async token => {
    console.log("token", token);
    let session = await Session.findOne({ token });
    if (session) {
      console.log("The Session Exists");
      let user = await Usr.findById(session.user);
      if (user) {
        console.log("Token is Valid");
        // The Token is still Valid ===Emit(validToken)===> Client to validate the keyPair
        let data = {
          token: session.token,
          avatar: user.avatar,
          username: user.username,
          publicKey: user.publicKey
        }
        // next step is RSA key validation
        io.to(socket.id).emit("validToken", data)
        return;
      } else {
        console.log("The User Doesn't Exist");
        return;
      }
    } else {
      console.log("TokenValidation:||:The Session Doesn't Exist");
      return;
    }

  });
  // Send an Array of Images to the Profile page
  socket.on("getImagesArray", data => {
    if (images.length === 5) {
      Session.findOne({ token: data.token }, (err, session) => {
        if (err) {
          console.log(err);
          return;
        } else if (session !== null && session !== undefined) {
          Usr.findById(session.user, (err, usr) => {
            if (err) {
              console.log(err);
              return;
            } else if (usr !== null && usr !== undefined) {
              io.to(socket.id).emit("imagesArray", images);
            }
          });
        }
      });
    }
  });
  // Handle Profile Save
  socket.on("saveProfile", data => {
    console.log("Received Image data");
    Session.findOne({ token: data.token }, (err, foundSession) => {
      if (err) console.log(err);
      else if (foundSession !== undefined && foundSession !== null) {
        Usr.findById(foundSession.user, (err, foundUser) => {
          if (err) {
            console.log(err);
            return;
          } else if (foundUser !== null && foundUser !== undefined) {
            const payload = {
              token: foundSession.token,
              username: foundUser.username,
              avatar: foundUser.avatar
            };
            if (data.avatar === foundUser.avatar) {
              io.to(socket.id).emit("profileSaved", payload);
              return;
            } else {
              foundUser.avatar = data.avatar;
              foundUser.save((err, savedUser) => {
                if (err) console.log(err);
                else if (savedUser !== null && savedUser !== null) {
                  const param = {
                    token: foundSession.token,
                    username: savedUser.username,
                    avatar: savedUser.avatar
                  };
                  console.log("Saved profile");
                  io.to(socket.id).emit("profileSaved", param);
                }
              });
            }
          }
        });
      }
    });
  }); // End of Saving Profile

  // Handle Room Creation
  socket.on("createRoom", async data => {
    let { token, name } = data; // roomName + token from the form
    // Form Data Validation
    if (name === null || name === undefined || name === "") {
      io.to(socket.id).emit("groupFormError", "اكتب اسم المجموعة");
    } else if (name.length < 3 || name.length > 35) {
      io.to(socket.id).emit("groupFormError", "يجب على الاسم ان يتكون من 3~35 حرف");
    } else {
      try {
        // The form is Authenticated
        let session = await Session.findOne({ token });
        if (session) {
          let user = await Usr.findById(session.user);
          if (user) {
            let room = await Room.findOne({ name });
            if (room) {
              io.to(socket.id).emit("groupFormError", "the room name is taken");
            } else {
              // Create a new Room Model
              let newRoom = new Room({
                name,
                leader: user.username,
                users: [user._id],
              })
              // Push the room to the user's rooms array
              await user.rooms.push(newRoom._id);
              // Save the models
              let savedRoom = await newRoom.save();
              let savedUser = await user.save();
              socket.to(socket.id).emit("roomCreated", savedRoom);

            }
          } else {
            io.to(socket.id).emit("groupFormError", "failed to get the user for room creation");
          }
        } else {
          io.to(socket.id).emit("groupFormError", "failed to get the session for room creation");
        }
      } catch (err) {
        console.log(err);
        return;
      }
    }
  });
  // Handle Fetching/joining the rooms
  socket.on("getRooms", token => {
    console.log(token);
    Session.findOne({ token: token }, (err, foundSession) => {
      if (err) {
        console.log(err);
        return;
      } else if (foundSession === null || foundSession === undefined) {
        console.log("The Session Doesn't Exists");
        return;
      } else {
        Usr.findById(foundSession.user, ["rooms", "username"])
          .then(foundUser => {
            foundUser.populate("rooms", (err, populated) => {
              populated.rooms.forEach((room, i) => {
                console.log(room);
                socket.join(room.name);
                console.log("Joined", room.name);
              });
              io.to(socket.id).emit("rooms", populated.rooms);
            });
          })
          .catch(err => console.log(err));
      }
    });
  });
  // Handle Logout , Delete Session
  socket.on("logout", data => {
    console.log(`${data.username} is logging out`);
    Session.findOne({ token: data.token }, (err, foundSession) => {
      if (err) {
        console.log(err);
        return;
      } else if (foundSession === null || foundSession === undefined) {
        console.log("The Session Doesn't Exist");
        return;
      } else {
        foundSession.remove();
        console.log("The Session is Removed");
        io.to(socket.id).emit("logedout");
      }
    });
  });

  // Handle New Text Msgs
  socket.on("newMsg", data => {
    const { msg, token, roomName } = data;
    Session.findOne({ token: token }, (err, foundSession) => {
      if (err) {
        console.log(err);
        return;
      } else if (foundSession === null || foundSession === undefined) {
        console.log("the token is expired");
      } else {
        Usr.findById(foundSession.user)
          .then(foundUser => {
            if (foundUser === null || foundUser === undefined) {
              console.log("The User Doesn't Exist");
              return;
            } else {
              Room.findOne({ name: roomName })
                .populate("users", ["publicKey", "username"])
                .then(foundRoom => {
                  if (foundRoom === null || foundRoom === undefined) {
                    console.log("the room doesn't exist");
                    return;
                  } else {
                    // Initialization vector
                    let iv = randomBytes(8).toString("hex");
                    // Symmetric encryption key AES 256bit/32bytes
                    let key = randomBytes(32).toString("hex");
                    // Encrypted Bytes
                    let encrypted = AES.encrypt(msg, key, { iv: iv, mode: mode.CBC, padding: pad.Pkcs7 })
                    // CipherText
                    let cipherText = encrypted.toString();
                    console.log("cipher-text", cipherText);
                    let payloads = []; // each user in the room has an encrypted payload
                    let buff = Buffer.from(key);
                    let from = foundUser.username;
                    let to = []; // array of 
                    foundRoom.users.forEach((user, i) => {
                      let EncryptedKey = publicEncrypt(
                        {
                          key: user.publicKey,
                          padding: constants.RSA_PKCS1_PADDING
                        },
                        buff
                      ).toString("base64");
                      payloads.push({
                        roomName: foundRoom.name,
                        from: foundUser.username,
                        msg: cipherText,
                        key: EncryptedKey,
                        publicKey: user.publicKey,
                        iv
                      });
                      to.push({
                        publicKey: user.publicKey,
                        key: EncryptedKey,
                        username: user.username
                      });
                    });
                    if (
                      foundRoom.chat === null ||
                      foundRoom.chat === undefined ||
                      foundRoom.chat.length === 0
                    ) {
                      foundRoom.chat = [
                        { from, to, msg: cipherText, isImage: false, iv }
                      ];
                    } else {
                      foundRoom.chat.push({
                        from, to, msg: cipherText, isImg: false, iv
                      });
                    }
                    foundRoom.save()
                      .then(savedRoom => {
                        console.log("Saved Room", savedRoom.name);
                        console.log(payloads);
                        io.to(savedRoom.name).emit("Msg", payloads);
                      })
                      .catch(err => console.log(err));

                  }
                })
                .catch(err => console.log(err));
            }
          })
          .catch(err => console.log(err));
      }
    });
  });

  // Handle Group Invitations ( group/room Leader ==Invites==> User)
  socket.on("invite", data => {
    const { room, user, username } = data;
    if (user === null || user === undefined || user === "") {
      io.to(socket.id).emit("groupFormError", "اكتب اسم الشحص");
    } else if (user.length < 3 || user.length > 30) {
      io.to(socket.id).emit("groupFormError", "يجب على الاسم أن يتكون من 3~35 حرف");
    } else {
      Usr.findOne({ username: user }, (err, foundUser) => {
        if (err) {
          console.log(err);
          return;
        } else if (foundUser === null || foundUser === undefined) {
          io.to(socket.id).emit("groupFormError", "لا يوجد هذا الشخص");
        } else {
          Room.findOne({ name: room }, (err, foundRoom) => {
            if (err) {
              console.log(err);
              return;
            } else if (foundRoom === null || foundRoom === undefined) {
              console.log("The Room doesn't Exist");
            } else {
              if (foundRoom.leader === username) {
                // The user is not in the room already
                if (foundUser.rooms.indexOf(foundRoom._id) === -1) {
                  // foundUser.rooms.push(foundRoom._id);
                  // foundRoom.users.push(foundUser._id);
                  let requestIndex = foundUser.requests.findIndex(request => request.roomName === foundRoom.name);
                  if (requestIndex === -1) {
                    foundUser.requests.push({ roomName: foundRoom.name, leader: foundRoom.leader })
                    foundUser.save((err, savedUser) => {
                      if (err) {
                        console.log(err);
                        return;
                      } else {
                        io.to(socket.id).emit("invited");
                        console.log(`Invited ${foundUser.username} ==room==> ${foundRoom.name} `);
                      }
                    });
                  } else {
                    io.to(socket.id).emit("groupFormError", "انتظر الشخص لكي يستجيب لدعوتك");
                  }

                } else {
                  io.to(socket.id).emit("groupFormError", "هذا الشخص عضو في المجموعة");
                }
              } else {
                console.log("you have to be the leader of the room to invite");
              }
            }
          });
        }
      });
    }
  });
  // User Requests (Group Invitations from Group Leaders)
  socket.on("getRequests", token => {
    Session.findOne({ token })
      .then(session => {
        if (session === null || session === undefined) {
          console.log("The Session is Expired");
          return;
        } else {
          Usr.findById(session.user)
            .then(user => {
              if (user === null || user === undefined) {
                console.log("The User is unavailable");
                return;
              } else {
                io.to(socket.id).emit("userRequests", user.requests);
                console.log(`Sent userRequests to ${user.username}`, user.requests);
                return;
              }
            })
        }
      }).catch(err => console.log(err))
  })

  // Accept Invitation Requests to join a room
  socket.on("acceptUserRequest", data => {
    let { token, roomName } = data;
    Session.findOne({ token })
      .then(session => {
        if (session === null || session === undefined) {
          console.log("The Session is Expired");
          return;
        } else {
          Usr.findById(session.user)
            .then(user => {
              if (user === null || user === undefined) {
                console.log("The User is unavailable");
                return;
              } else {
                Room.findOne({ name: roomName })
                  .then(room => {
                    if (room === null || room === undefined) {
                      console.log("The Room is unavailable");
                    } else {
                      // Check if the user is already a member in the group/room
                      let roomRefIndex = user.rooms.indexOf(room._id);
                      console.log("refIndex", roomRefIndex);
                      if (roomRefIndex === -1) {
                        // the user doesn't exist in the room
                        room.users.push(user._id);
                        user.rooms.push(room._id);
                        let reqIndex = user.requests.findIndex(req => req.roomName === roomName);
                        user.requests.splice(reqIndex, 1);
                        room.save()
                          .then(savedRoom => {
                            user.save()
                              .then(savedUser => {
                                console.log(`${savedUser.username} joined ${savedRoom.name}`);
                                socket.join(savedRoom.name);
                                io.to(socket.id).emit("invitationAccepted", savedRoom.name);
                              }).catch(err => console.log(err));
                          })
                          .catch(err => console.log(err))
                      } else {
                        console.log("you are a member of this group")
                      }
                    }
                  })
                  .catch(err => console.log(err))
              }
            })
        }
      }).catch(err => console.log(err))
  })
  // Refuse / Delete Invitation Request
  socket.on("refuseUserRequest", async (data) => {
    let { token, roomName } = data;
    try {
      let session = await Session.findOne({ token });
      if (session === null || session === undefined) {
        console.log("The Session Doesn't Exist");
        return
      } else {
        let user = await Usr.findById(session.user);
        if (user === null || user === undefined) {
          console.log("The User Doesn't Exist");
          return
        } else {
          let reqIndex = await user.requests.findIndex(req => req.roomName === roomName);
          await user.requests.splice(reqIndex, 1);
          let savedUser = await user.save();
          console.log(`A User Invitation Has Been Deleted`, savedUser.requests);
          io.to(socket.id).emit("deletedUserRequest", roomName);
        }
      }
    } catch (err) {
      console.log(err);
    }
  })
  // Refuse / Delete Room Request (Requests sent from Users ===> Room Leaders)
  socket.on("refuseRoomRequest", async (data) => {
    let { token, roomName, person } = data;
    try {
      let session = await Session.findOne({ token });
      if (session === null || session === undefined) {
        console.log("The Session Doesn't Exist");
        return
      } else {
        let user = await Usr.findById(session.user);
        if (user === null || user === undefined) {
          console.log("The User Doesn't Exist");
          return
        } else {
          let room = await Room.findOne({ name: roomName });
          if (room) {
            let requestIndex = room.requests.indexOf(person);
            if (requestIndex !== -1) {
              await room.requests.splice(requestIndex, 1);
              await room.save();
              io.to(socket.id).emit("roomRequestAccepted", { person, roomName });
            } else {
              console.log("The Request Doesn't exist");
              return;
            }
          } else {
            console.log("The room doesn't exist");
            return;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  })
  // (Users Ask (Request) Room/Group Leader to join)
  socket.on("joinRequest", async (data) => {
    const { token, name } = data;
    // Input Validation
    if (name === null || name === undefined || name === "") {
      io.to(socket.id).emit("groupFormError", "اكتب اسم المجموعة");
    } else if (name.length < 3 || name.length > 35) {
      io.to(socket.id).emit("groupFormError", "يجب على اسم المجموعة أن تتكون من 3~35 حرف");
    } else {
      try {
        let session = await Session.findOne({ token });
        if (session === null || session === undefined) {
          console.log("The Session is Expired");
          return;
        } else {
          let user = await Usr.findById(session.user);
          if (user === null || user === undefined) {
            console.log("The User doesn't exist");
            return;
          } else {
            let room = await Room.findOne({ name });
            if (room === null || room === undefined) {
              console.log("The Room doesn't exist");
              io.to(socket.id).emit("groupFormError", "لا توجد هذه مجموعة");
              return;
            } else {
              let reqIndex = await room.requests.indexOf(user.username);
              let userIndex = await room.users.indexOf(user._id);
              if (userIndex !== -1) {
                io.to(socket.id).emit("groupFormError", "أنت عضو في هذه المجموعة");
              } else if (reqIndex === -1) {
                await room.requests.push(user.username);
                let savedRoom = await room.save();
                console.log(`${user.username} ==Requests==> ${savedRoom.leader} to join ${savedRoom.name}`);
                io.to(socket.id).emit("requestSent");
              } else {
                console.log("The Request already exists");
                io.to(socket.id).emit("groupFormError", "انتظر الرد على طلب الدخول");
              }
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
  })

  // Accept Room  Requests to join ( Normal User ==Requests== Room Leader)
  socket.on("acceptRoomRequest", async (data) => {
    let { token, roomName, person } = data;
    try {
      // get the session by token
      let session = await Session.findOne({ token });
      if (!session) {
        console.log("The Session Doesn't Exist");
        return
      } else {
        // check if the user exists
        let user = await Usr.findById(session.user);
        if (!user) {
          console.log("The User Doesn't Exist");
          return
        } else {
          // get the person that you want to add to the room
          let pers = await Usr.findOne({ username: person }); // person to add to the room
          if (pers) {
            // get the room by room name
            let room = await Room.findOne({ name: roomName });
            if (room) {
              // Check if the user already exists in the room (This might never happen)
              let personIndex = await room.users.indexOf(pers._id);
              if (personIndex === -1) {
                // the user doesn't exist in the room
                await room.users.push(pers._id);
                // find the request index to delete it
                let reqIndex = await room.requests.indexOf(pers.username);
                if (reqIndex !== -1) {
                  await room.requests.splice(reqIndex, 1)
                } else {
                  console.log("The Request Doesn't Exist");
                }
                let savedRoom = await room.save();
                await pers.rooms.push(savedRoom._id);
                pers.save();
                console.log(`${savedRoom.leader} accepted ${pers.username}'s request to join ${room.name}`);
                io.to(socket.id).emit("roomRequestAccepted", { person: pers.username, roomName: savedRoom.name, id: pers._id });
              } else {
                console.log(`${pers.username} already exists in ${room.name}`);
                return;
              }
            } else {
              console.log("The Room Doesn't Exist");
              return;
            }
          } else {
            // this happpens when an account is deleted 
            console.log("The Person you want to invite doesn't exist")
            return;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  })
  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} disconnected!!`);
    console.log(`reason`, reason);
  });
});
