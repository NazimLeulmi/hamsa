let express = require("express");
let isAlphanumeric = require("validator").isAlphanumeric;
let isLength = require("validator").isLength;
let isEmpty = require("validator").isEmpty;

let UserModel = require("./models").UserModel;
let router = express.Router();

function validation(req, res, next) {
  let token = req.params.token;
  if (token === undefined || token === null || isEmpty(token)) {
    return res.json({ error: "The token is required to activate the account" });
  } else if (!isAlphanumeric(token)) {
    return res.json({ error: "The token must be alphanumeric" });
  } else if (!isLength(token, { min: 96, max: 96 })) {
    return res.json({ error: "The token must be 96 characters" });
  }
  next();
}

// Activate User Account
router.get("/activate/:token", validation, async (req, res) => {
  try {
    let user = await UserModel.findOneAndUpdate(
      { token: req.params.token },
      { token: null, active: true }
    );
    if (!user) return res.json({ error: "The token is invalid" });
    console.log(`${user._id} has been activated`);
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
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
