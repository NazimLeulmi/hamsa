const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const regValidation = require('./validation').regValidation;
const loginValidation = require('./validation').loginValidation;
const nameValidation = require('./validation').nameValidation;
const publicEncrypt = require('crypto').publicEncrypt;
const genSalt = require('bcryptjs').genSalt;
const genHash = require('bcryptjs').hash;
const compare = require('bcryptjs').compare;
//////////////////////////////////////////////
///// Database: MongoDB connection /////////
////////////////////////////////////////////
mongoose.connect('mongodb://localhost/hamsa',
  { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to MongoDB")
});
//////////////////////////////////////////////
///// Data Models: MongoDB models ///////////
////////////////////////////////////////////
const UserSchema = new mongoose.Schema({
  name: { type: String, max: 150, min: 5, required: true },
  password: { type: String, max: 60, min: 60, required: true },
  publicKey: { type: String, max: 786, min: 786, required: true },
  contacts: [{ type: String, max: 150, min: 5, ref: 'user' }],
  contactRequests: [{ type: String, max: 150, min: 5, ref: 'user' }],
  rooms: [{
    name: { type: String, max: 85, min: 5, ref: 'room' },
    roomId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'room' }],
  }],
  roomInvitations: [{
    name: { type: String, max: 150, min: 5, ref: 'room' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'room' },
  }]
})

const UserModel = new mongoose.model("user", UserSchema);
const RoomSchema = new mongoose.Schema({
  name: { type: String, max: 150, min: 5, required: true },
  admin: { type: String, max: 150, min: 5, required: true },
  users: [{
    name: { type: String, ref: 'user', max: 150, min: 5, required: true },
    publicKey: { type: String, ref: "user", max: 786, min: 786, required: true }
  }],
  chat: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }],
});
const RoomModel = new mongoose.model("room", RoomSchema);
//////////////////////////////////////////////////
///// User Authorization: express-session ///////
////////////////////////////////////////////////
// enable same-origin requests
app.use(session({
  name: "hamsa",
  secret: "my-secret",
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 12, // 12 hours
    httpOnly: true,
    sameSite: true, // strict
    secure: false,
  }
}));
// parse application/json
app.use(bodyParser.json());
/////////////////////////////////////////////////////
///// User Registeration : Data Validation /////////
///////////////////////////////////////////////////
app.post("/validate", async function (req, res) {
  const { name, password, passwordc, answer, a, b } = req.body;
  const { isValid, errors } = regValidation(name, password, passwordc, answer, a, b);
  if (isValid == false) {
    return res.json({ errors, isValid: false });
  }
  console.log("validating", name);
  try {
    const user = await UserModel.findOne({ name })
    if (user) {
      return res.json({
        errors: ["The username has already been taken"],
        isValid: false
      });
    }
    return res.json({ errors: [], isValid: true });
  } catch (err) { return console.log(err) }
})
///////////////////////////////////////////////
///// User Registeration : User Creation /////
/////////////////////////////////////////////
app.post("/register", async function (req, res) {
  const { name, password, publicKey } = req.body;
  try {
    const salt = await genSalt(10);
    const hash = await genHash(password, salt)
    const user = new UserModel({ name, password: hash, publicKey });
    const savedUser = await user.save();
    console.log(`${name} has been registered`, savedUser);
    return res.json({ registered: true });
  } catch (err) {
    console.log(err);
    return res.json({ registered: false });
  }
})
///////////////////////////////////////////////
/////  User Login : User Authentication  /////
/////////////////////////////////////////////
app.post('/login', async function (req, res) {
  const { name, password } = req.body;
  const { isValid, errors } = loginValidation(name, password);
  if (isValid === false) {
    return res.json({ isValid: false, errors });
  }
  const user = await UserModel.findOne({ name });
  if (!user) return res.json({
    isValid: false,
    errors: ["The name or password is incorrect"]
  });
  const isCorrect = await compare(password, user.password);
  if (isCorrect === false) return res.json({
    isValid: false,
    errors: ["The name or password is incorrect"]
  });
  req.session.userData = { name: user.name };
  return res.json({ isValid: true, errors: [], name: user.name })
});
///////////////////////////////////////////////
/////  User Login : Check Authentication  ////
/////////////////////////////////////////////
app.get('/checkAuth', async function (req, res) {
  if (req.session.userData && req.session.userData.name) {
    return res.json({ auth: true, user: req.session.userData.name });
  }
  return res.json({ auth: false });
});
///////////////////////////
///// Get Contacts  //////
/////////////////////////
app.get('/contacts', async function (req, res) {
  console.log("Getting Contacts");
  if (!req.session.userData || !req.session.userData.name) {
    console.log("Restricted request");
    return res.json({ auth: false, error: "Restricted request" });
  }
  const user = await UserModel.findOne({ name: req.session.userData.name });
  return res.json({ contacts: user.contacts });
});
///////////////////////////////////
///// Add a contact request //////
/////////////////////////////////
app.post('/addContact', async function (req, res) {
  if (!req.session.userData) {
    return res.json({ isValid: false, errors: ["You must be logged in"] });
  }
  const { name } = req.body;
  const error = nameValidation(name);
  const contactName = name;
  const userName = req.session.userData.name;
  // Form validation
  if (error !== "") {
    return res.json({ isValid: false, error });
  }
  // Prevent a user from adding him/herself
  if (contactName === userName) return res.json({ isValid: false, error: "You can't add yourself" })
  // Get the contact from the database
  const contact = await UserModel.findOne({ name: contactName });
  // Check if the contact exists in the database
  if (!contact) return res.json({ isValid: false, error: "Contact doesn't exist" })
  // Get the user that wants to add the contact from the database
  // I'm assuming that the user exists in the database because he/she is loged in
  const user = await UserModel.findOne({ name: userName });
  // Check if the contact already exists in the user's contact list
  const alreadyContact = user.contacts.includes(contactName);
  if (alreadyContact) return res.json({ isValid: false, error: "Contact already exists" });
  // Check if the user already sent a friend / contact request
  const requestSent = contact.contactRequests.includes(userName);
  if (requestSent) return res.json({ isValid: false, error: "Request has been sent already" });
  // If the user has a contact request from the contact add them auto
  const requestExists = user.contactRequests.includes(contactName);
  if (requestExists) {
    // Delete the contact / friend request
    const requestIndex = user.contactRequests.indexOf(contactName);
    user.contactRequests.splice(requestIndex, 1);
    // Add the contacts
    user.contacts.push(contactName);
    contact.contacts.push(userName);
    const savedUser = await user.save();
    const savedContact = await contact.save();
    return res.json({ isValid: true, error: "" });
  }
  // If everything is Okay push a contact / friend request and save the contact
  contact.contactRequests.push(userName);
  const savedContact = await contact.save();
  return res.json({ isValid: true, error: "" });
});
//////////////////////////////////
///// Get Contact Requests //////
////////////////////////////////
app.get('/contactRequests', async function (req, res) {
  console.log("Getting Contacts");
  if (!req.session.userData || !req.session.userData.name) {
    console.log("Restricted request");
    return res.json({ auth: false, error: "Restricted request" });
  }
  const user = await UserModel.findOne({ name: req.session.userData.name });
  console.log(user.contactRequests);
  return res.json({ requests: user.contactRequests });
});
/////////////////////////////////////
///// Confirm Contact Request //////
///////////////////////////////////
app.post('/confirmContact', async function (req, res) {
  if (!req.session.userData || !req.session.userData.name) {
    console.log("Restricted request");
    return res.json({ auth: false, error: "Restricted request" });
  }
  const { name } = req.body;
  const error = nameValidation(name);
  if (error !== "") {
    return res.json({ error });
  }
  const user = await UserModel.findOne({ name: req.session.userData.name });
  // double checking
  if (user.contactRequests.includes(name) === false) {
    return res.json({ error: "The request doesn't exist" });
  } else if (user.contacts.includes(name)) {
    return res.json({ error: "You already have this contact" });
  }
  const target = await UserModel.findOne({ name });
  if (!target) return res.json({ error: "Contact doesn't exist" });
  target.contacts.push(user.name);
  user.contacts.push(target.name);
  const requestIndex = user.contactRequests.indexOf(name);
  user.contactRequests.splice(requestIndex, 1);
  const savedUser = await user.save();
  const savedTarget = await target.save();
  console.log("Confirmed contact request");
  return res.json({ success: true });
});
/////////////////////////////////////
///// Reject Contact Request ///////
///////////////////////////////////
app.post('/rejectContact', async function (req, res) {
  if (!req.session.userData || !req.session.userData.name) {
    console.log("Restricted request");
    return res.json({ auth: false, error: "Restricted request" });
  }
  const { name } = req.body;
  const { isValid, errors } = nameValidation(name);
  if (isValid === false || errors.length !== 0) {
    return res.json({ errors });
  }
  const user = await UserModel.findOne({ name: req.session.userData.name });
  // double checking
  if (user.contactRequests.includes(name) === false) {
    return res.json({ errors: ["The request doesn't exist"] });
  }
  const requestIndex = user.contactRequests.indexOf(name);
  user.contactRequests.splice(requestIndex, 1);
  const result = await user.save();
  console.log("Rejected contact request");
  return res.json({ success: true });
});
/////////////////////////
///// Create Room //////
///////////////////////
app.post('/createRoom', async function (req, res) {
  if (!req.session.userData || !req.session.userData.name) {
    console.log("Restricted request");
    return res.json({ error: "Restricted request" });
  }
  const { name } = req.body;
  const { isValid, errors } = nameValidation(name);
  if (isValid === false || errors.length !== 0) {
    return res.json({ isValid: false, errors });
  }
  const user = await UserModel.findOne({ name: req.session.userData.name });
  for (let i = 0; i < users.rooms.length; i++) {
    if (user.rooms[i].name === name) {
      return res.json({ isValid: false, errors: [`You are already a member of ${name}`] });
    }
  }
  const newRoom = new RoomModel({
    name: user.name, admin: user.name,
    users: [{ name: user.name, publicKey: user.publicKey }]
  })
  const savedRoom = await newRoom.save();
  return res.json({ isValid: true, errors: [], room: savedRoom });
});
io.origins('*:*') // for latest version
io.on('connection', (socket) => {
  console.log("socket connected:", socket.id)
  socket.on('disconnect', () => {
    console.log("socket disconnected:", socket.id)
  });
});

http.listen(3001, () => {
  console.log('listening on *:3001');
});
