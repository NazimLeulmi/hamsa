const mongoose = require('mongoose');
const hash = require('bcrypt').hash;
const compare = require('bcrypt').compare;
const randomBytes = require('crypto').randomBytes;
const session = require('express-session')
const body = require('express-validator').body;
const param = require('express-validator').param;
const validationResult = require('express-validator').validationResult;
const UserModel = require('./models').UserModel;
const GroupModel = require('./models').GroupModel;
const sendMail = require('./mail');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3000


// express session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}))
// Parse data from http requests
app.use(express.json());
// Public assets
app.use(express.static('public'));
// Connect to Mongo Data Base
mongoose.connect('mongodb://localhost/hamsa', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Mongo connection error:"));
db.once('open', () => console.log("Connected to Mongo Database"));

// SIGN UP POST ROUTE
app.post('/signUp', [
  body('name').notEmpty().withMessage("The name is required to submit the form")
    .isAlphanumeric().withMessage("The name must be alphanumeric")
    .isLength({ min: 5, max: 100 }).withMessage("The name must be 5~100 characters"),
  body('email').notEmpty().withMessage("The email is required to submit the form")
    .isEmail().withMessage("The email is invalid")
    .normalizeEmail(),
  body('password').notEmpty().withMessage("The password is required to submit the form")
    .isAlpha().withMessage("The password must be alphanumeric")
    .isLength({ min: 8, max: 100 }).withMessage("The password must be 8~100 characters")
    .custom((value, { req }) => value === req.body.passwordc).withMessage("password confirmation doesn't match")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array()[0].msg });
    }
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) return res.json({ error: "The email address has been taken" });
    const hashed = await hash(req.body.password, 10);
    const buffer = await randomBytes(48);
    const token = buffer.toString('hex');

    const newUser = new UserModel({
      name: req.body.name, password: hashed, activisionToken: token,
      email: req.body.email, publicKey: req.body.publicKey
    })
    const savedUser = await newUser.save();
    await sendMail(savedUser.email,
      `http://192.168.61.93:3000/activate/${savedUser.activisionToken}`)
    return res.json({ success: true, token: savedUser.activisionToken })
  } catch (err) { console.log(err) }
})
// ACTIVATE ACCOUNT GET ROUTE
app.get('/activate/:token', [
  param('token').notEmpty().withMessage("The token is required to activate the account")
    .isAlphanumeric().withMessage("The token must be alphanumeric")
    .isLength({ min: 96, max: 96 }).withMessage("Invalid token"),
], async (req, res) => {
  console.log(req.params.token);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ error: errors.array()[0].msg });
  }
  const user = await UserModel.findOne({ activisionToken: req.params.token });
  if (!user) return res.json({ error: "the user doesn't exist" });
  user.activisionToken = '';
  user.activated = true;
  const savedUser = await user.save();
  let s1 = "display:flex;align-items:center;justify-content:center;";
  let s2 = "background:#F3E9DC;height:100%;flex-direction:column;";
  let style = s1 + s2;
  return res.send(`
    <html>
    <body style="margin:0;height:100%;">
    <div style=${style} >
      <img src="/whisper.png" height="150"/>
      <h1 style="font-size:3rem;">Activated</h1>
    </div>
    </body>
    </html> 
  `);
})
// SIGN IN POST ROUTE
app.post('/signIn', [
  body('email').notEmpty().withMessage("The email is required to submit the form")
    .isEmail().withMessage("The email is invalid")
    .normalizeEmail(),
  body('password').notEmpty().withMessage("The password is required to submit the form")
    .isAlpha().withMessage("Invalid password")
    .isLength({ min: 8, max: 100 }).withMessage("Invalid password")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array()[0].msg });
    }
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.json({ error: "Invalid email or password" });
    const isCorrect = await compare(req.body.password, user.password);
    if (!isCorrect) return res.json({ error: "Invalid email or password" });
    if (user.activated === false) return res.json({ error: "The account has to be activated" });
    req.session.userId = user._id;
    return res.json({ success: true })
  } catch (err) { console.log(err) }
})
// CHECK AUTH GET ROUTE
app.get("/checkAuth", async (req, res) => {
  if (!req.session.userId) return res.json({ success: false });
  const user = await UserModel.findById(req.session.userId).exec();
  if (user) return res.json({ success: true, user: user })
  return res.json({ success: false })
})
// CREATE A GROUP RESTRICTED POST ROUTE
app.post("/createGroup", [
  body('data').notEmpty().withMessage("The group name is required to create a group")
    .isAlphanumeric().withMessage("The group name must be alphanumeric")
    .isLength({ min: 5, max: 30 }).withMessage("The group name must be 5~30 characters"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!req.session.userId) return res.json({ error: "Restricted route" });
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    const user = await UserModel.findById(req.session.userId).exec();
    if (!user) return res.json({ error: "User doesn't exist" });
    const group = new GroupModel({
      name: req.body.data,
      admin: user._id,
      users: [user._id]
    })
    const newGroup = await group.save();
    user.groups.push(newGroup._id)
    const newUser = await user.save();
    return res.json({ newGroup });
  } catch (err) { console.log(err) }
})
// JOIN A GROUP RESTRICTED POST ROUTE
app.post("/joinGroup", [
  body('data').notEmpty().withMessage("The group ID is required to join a group")
    .isAlphanumeric().withMessage("The group ID must be alphanumeric")
    .isLength({ min: 24, max: 24 }).withMessage("The group ID is invalid"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!req.session.userId) return res.json({ error: "Restricted route" });
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    const user = await UserModel.findById(req.session.userId).exec();
    if (!user) return res.json({ error: "User doesn't exist" });
    const group = await GroupModel.findById(req.body.data).exec();
    if (!group) return res.json({ error: "Group doesn't exist" });
    const groupAdmin = await UserModel.findById(group.admin).exec();
    groupAdmin.notifications.push({
      from: user._id,
      name: user.name,
      groupName: group.name
    })
    const saved = await groupAdmin.save();
    console.log(saved)
    return res.json({ success: true });
  } catch (err) { console.log(err) }
})
// GET ALL GROUPS
app.get('/groups', async (req, res) => {
  if (!req.session.userId) return res.json({ error: "Restricted route" });
  const user = await UserModel.findById(req.session.userId).populate('groups').lean().exec();
  if (!user) return res.json({ error: "Restricted route" });
  const id = String(user._id);
  const groups = await user.groups.map(grp => {
    const admin = String(grp.admin);
    return { ...grp, isAdmin: admin === id ? true : false }
  })
  return res.json({ groups: groups });
})
// GET ALL NOTIFICATIONS
app.get('/notifications', async (req, res) => {
  if (!req.session.userId) return res.json({ error: "Restricted route" });
  const user = await UserModel.findById(req.session.userId).lean().exec();
  if (!user) return res.json({ error: "Restricted route" });
  return res.json({ notifications: user.notifications });
})
io.on('connection', (socket) => {
  console.log('a user connected');
});

http.listen(port, () => {
  console.log('listening on *:3000');
});