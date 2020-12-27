const express = require('express')
const mongoose = require('mongoose');
const app = express();
const hash = require('bcrypt').hash;
const randomBytes = require('crypto').randomBytes;
const body = require('express-validator').body;
const validationResult = require('express-validator').validationResult;
const UserModel = require('./models').UserModel;
const sendMail = require('./mail');
const port = 3000

// Parse data from http requests
app.use(express.json());

// Connect to Mongo Data Base
mongoose.connect('mongodb://localhost/hamsa', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Mongo connection error:"));
db.once('open', () => console.log("Connected to Mongo Database"));

app.post('/signUp', [
  body('name').notEmpty().withMessage("The name is required to submit the form")
    .isAlpha().withMessage("The name must be alphanumeric")
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
    const newUser = new UserModel({
      name: req.body.name, password: hashed,
      email: req.body.email, publicKey: req.body.publicKey
    })
    const savedUser = await newUser.save();
    await sendMail(savedUser.email,
      `http://192.168.177.93:3000/activate/${savedUser.activisonToken}`)
    return res.json({ success: true, id: savedUser._id })
  } catch (err) { console.log(err) }
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})