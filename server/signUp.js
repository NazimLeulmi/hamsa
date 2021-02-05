let express = require("express");
let hash = require("bcrypt").hash;
let randomBytes = require("crypto").randomBytes;
let sendMail = require("./mail");
let isAlphanumeric = require("validator").isAlphanumeric;
let isEmail = require("validator").isEmail;
let isLength = require("validator").isLength;
let isEmpty = require("validator").isEmpty;

let UserModel = require("./models").UserModel;
let router = express.Router();

function validation(req, res, next) {
  let { name, email, password, passwordc } = req.body;
  // 1) Name Validation
  if (name === undefined || name === null || isEmpty(name)) {
    return res.json({ error: "The name is required to sign up" });
  } else if (!isAlphanumeric(name)) {
    return res.json({ error: "The name must be alphanumeric" });
  } else if (!isLength(name, { min: 5, max: 25 })) {
    return res.json({ error: "The name must be 5~25 characters" });
  }
  // 2) Email Validation
  if (email === undefined || email === null || isEmpty(email)) {
    return res.json({ error: "The email is required to sign up" });
  } else if (!isEmail(email)) {
    return res.json({ error: "The email is invalid" });
  } else if (!isLength(email, { min: 8, max: 50 })) {
    return res.json({ error: "The email must be 8~50 characters" });
  }
  // 3) Password Validation
  if (password === undefined || password === null || isEmpty(password)) {
    return res.json({ error: "The password is required to sign up" });
  } else if (passwordc === undefined || isEmpty(passwordc)) {
    return res.json({ error: "The password confirmation is required" });
  } else if (!isAlphanumeric(password)) {
    return res.json({ error: "The password must be alphanumeric" });
  } else if (!isLength(password, { min: 8, max: 100 })) {
    return res.json({ error: "The password must be 8~100 characters" });
  } else if (password !== passwordc) {
    return res.json({ error: "The password confirmation doesn't match" });
  }
  next();
}

router.post("/signUp", validation, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) return res.json({ error: "The email address is taken" });
    let hashed = await hash(req.body.password, 10);
    let buffer = await randomBytes(48);
    let token = buffer.toString("hex");
    user = new UserModel({
      name: req.body.name,
      email: req.body.email,
      pass: hashed,
      key: req.body.publicKey,
      token: token,
    });
    let userSaved = await user.save();
    console.log(userSaved);
    let url = "http://192.168.83.93:3000/activate/" + token;
    let mailres = await sendMail(req.body.email, url);
    return res.json({ success: true });
  } catch (err) {
    throw err;
  }
});
module.exports = router;
