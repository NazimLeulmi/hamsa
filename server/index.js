const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const validateRegister = require('./validation').validateRegister;
const publicEncrypt = require("crypto").publicEncrypt;

// Database connection
mongoose.connect('mongodb://localhost/hamsa',
  { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to MongoDB")
});
// Database modelsa
const UserSchema = new mongoose.Schema({
  name: { type: String, max: 150, min: 5,required:true },
  password: { type: String, max: 150, min: 10,required:true},
  publicKey: { type: String, max: 150, min: 5 ,required:true},
  authToken: { type: String, max: 150, min: 5 ,required:false}
})
const UserModel = new mongoose.model("user", UserSchema);
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
io.origins('*:*') // for latest version
io.on('connection', (socket) => {
  console.log("socket connected:", socket.id)
  /////////////////////////////////////////////////
  ///// User Registeration : Data Validation /////
  ///////////////////////////////////////////////
  socket.on("validate", async function (data) {
    const { name, password, passwordc, answer, a, b } = data;
    const { isValid, errors } = validateRegister(
      name, password, passwordc, answer, a, b
    )
    if (isValid == false) {
      socket.emit("validated", { errors, isValid })
      return;
    }
    const user = await UserModel.findOne({ name: data.name })
    if (user) {
      errors.push("The username has already been taken");
      socket.emit("validated", { errors, isValid: false })
      return;
    }
    socket.emit("validated", { errors: [], isValid: true })
  })
  ///////////////////////////////////////////////
  ///// User Registeration : User Creation /////
  /////////////////////////////////////////////
  socket.on("createUser", async function (data) {
    console.log("Creating user");
    const { name,password,publicKey } = data;
    try{
      const genSalt = require("bcryptjs").genSalt;
      const genHash = require("bcryptjs").hash;
      const salt = await genSalt(10);
      const hash = await genHash(password,salt)
      const user = new UserModel({name,password:hash,publicKey});
      const savedUser = await user.save();
      console.log(`${name} has been registered`,savedUser);
      socket.emit("registered");
    }catch(err){
      console.log(err);
    }
  })
  socket.on('disconnect', () => {
    console.log("socket disconnected:", socket.id)
  });
});

http.listen(3001, () => {
  console.log('listening on *:3001');
});
