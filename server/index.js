const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const regValidation = require('./validation').regValidation;
const loginValidation = require('./validation').loginValidation;
const addContactValidation = require('./validation').addContactValidation;
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
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'group' }],
  groupRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'group' }],
})
const UserModel = new mongoose.model("user", UserSchema);
const GroupSchema = new mongoose.Schema({
  name: { type: String, max: 85, min: 5, required: true },
  admin: { type: String, max: 150, min: 5, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }],
  chat: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }],
});
const GroupModel = new mongoose.model("group", GroupSchema);
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
  console.log("validating",name);
  const user = await UserModel.findOne({ name })
  if (user) {
    return res.json({
      errors: ["The username has already been taken"],
      isValid: false
    });
  }
  return res.json({ errors: [], isValid: true });
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
///////////////////////////////////
///// Add a contact request //////
/////////////////////////////////
app.post('/addContact', async function (req, res) {
  if (!req.session.userData) {
    return res.json({ isValid: false, errors: ["You must be logged in"] });
  }
  const { name } = req.body;
  const { isValid, errors } = addContactValidation(name);
  const contactName = name;
  const userName = req.session.userData.name;
  // Form validation
  if (isValid === false) {
    return res.json({ isValid: false, errors });
  }
  // Prevent a user from adding him/herself
  if (contactName === userName) return res.json({ isValid: false, errors: ["You can't add yourself"] })
  // Get the contact from the database
  const contact = await UserModel.findOne({ name: contactName });
  // Check if the contact exists in the database
  if (!contact) return res.json({ isValid: false, errors: ["Contact doesn't exist"] })
  // Get the user that wants to add the contact from the database
  // I'm assuming that the user exists in the database because he/she is loged in
  const user = await UserModel.findOne({ name: userName });
  // Check if the contact already exists in the user's contact list
  const alreadyContact = user.contacts.includes(contactName);
  if (alreadyContact) return res.json({ isValid: false, errors: ["Contact already exists"] });
  // Check if the user already sent a friend / contact request
  const requestSent = contact.contactRequests.includes(userName);
  if (requestSent) return res.json({ isValid: false, errors: ["Request has been sent already"] });
  // If the user has a contact request from the contact add them auto
  const requestExists = user.contactRequests.includes(contactName);
  if (requestExists) {
    // Delete the contact / friend request
    const requestIndex = user.contactRequests.indexOf(contactName);
    user.contactRequests.splice(requestIndex, 1);
    // Add the contacts
    user.contacts.push(contactName);
    contact.contacts.push(userName);
    user.save(function (savedUser) {
      console.log("Added contact to user", savedUser);
      contact.save(function (savedContact) {
        console.log("Added contact to user", savedUser);
        return res.json({ isValid: true, errors: [], saved });
      })
    })
  }
  // If everything is Okay push a contact / friend request and save the contact
  contact.contactRequests.push(userName);
  contact.save(function (saved) {
    return res.json({ isValid: true, errors: [], saved });
  })
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
