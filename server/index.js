const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const regValidation = require('./validation').regValidation;
const loginValidation = require('./validation').loginValidation;
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
})
const UserModel = new mongoose.model("user", UserSchema);
const RoomSchema = new mongoose.Schema({
  name: { type: String, max: 85, min: 5, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }],
  chat: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }]
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
  console.log("Validating form data");
  const { name, password, passwordc, answer, a, b } = req.body;
  const { isValid, errors } = regValidation(name, password, passwordc, answer, a, b);
  if (isValid == false) {
    return res.json({ errors, isValid: false });
  }
  const user = await UserModel.findOne({ name })
  if (user) {
    return res.json({
      errors: ["The username has already been taken"],
      isValid: true
    });

  }
  return res.json({ errors: [], isValid: true });
})
///////////////////////////////////////////////
///// User Registeration : User Creation /////
/////////////////////////////////////////////
app.post("/register", async function (req, res) {
  console.log("Creating user");
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
  console.log('User Logging In');
  const { name, password } = req.body;
  const { isValid, errors } = loginValidation(name, password);
});
///////////////////////////////////////////////
/////  User Login : Check Authentication  ////
/////////////////////////////////////////////
app.get('/checkAuth', async function (req, res) {
  console.log('User Logging In');
  console.log(req.session, "session");
  if (req.session.userData.name) {
    return res.json({ auth: true });
  }
  return res.json({ auth: false });
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
