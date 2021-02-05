let express = require("express");
let compare = require("bcrypt").compare;
let isAlphanumeric = require("validator").isAlphanumeric;
let isEmail = require("validator").isEmail;
let isLength = require("validator").isLength;
let isEmpty = require("validator").isEmpty;

let UserModel = require("./models").UserModel;
let router = express.Router();

function validation(req, res, next) {
  let { email, password } = req.body;
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
  } else if (!isAlphanumeric(password)) {
    return res.json({ error: "The password must be alphanumeric" });
  } else if (!isLength(password, { min: 8, max: 100 })) {
    return res.json({ error: "The password must be 8~100 characters" });
  }
  next();
}
// SIGN IN POST ROUTE

router.post("/signIn", validation, async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email }).populate({
      path: "rooms",
      populate: {
        path: "chat",
        model: "Message",
      },
    });
    if (!user) return res.json({ error: "Invalid email or password" });
    const isCorrect = await compare(req.body.password, user.pass);
    if (!isCorrect) return res.json({ error: "Invalid email or password" });
    if (user.active === false)
      return res.json({ error: "The account has to be activated" });
    req.session.userId = user._id;
    console.log(user, "SIGN IN");
    return res.json({ user });
  } catch (err) {
    throw err;
  }
});

module.exports = router;
