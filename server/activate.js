let express = require('express');
let param = require('express-validator').param;
let validationResult = require('express-validator').validationResult;
let router = express.Router();
let UserModel = require('./models').UserModel;


// Activate User Account
router.get('/activate/:token', [
  param('token').notEmpty().withMessage("The token is required to activate the account")
    .isAlphanumeric().withMessage("The token must be alphanumeric")
    .isLength({ min: 96, max: 96 }).withMessage("Invalid token"),
], async (req, res) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    let user = await UserModel.findOneAndUpdate({ token: req.params.token },
      { token: null, active: true });
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
  } catch (err) { console.log(err) }
})

module.exports = router;