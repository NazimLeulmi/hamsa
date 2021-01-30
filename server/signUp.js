let express = require('express');
let body = require('express-validator').body;
let hash = require('bcrypt').hash;
let randomBytes = require('crypto').randomBytes;
let sendMail = require("./mail");
let validationResult = require('express-validator').validationResult;
let router = express.Router();
let UserModel = require('./models').UserModel;

router.post('/signUp', [
  body('name').notEmpty().withMessage("The name is required to submit the form")
    .isAlphanumeric().withMessage("The name must be alphanumeric")
    .isLength({ min: 5, max: 30 }).withMessage("The name must be 5~25 characters"),
  body('email').notEmpty().withMessage("The email is required to submit the form")
    .isLength({ min: 8, max: 50 }).withMessage("The email must be 8~50 characters")
    .isEmail().withMessage("The email is invalid")
    .normalizeEmail(),
  body('password').notEmpty().withMessage("The password is required to submit the form")
    .isAlphanumeric().withMessage("The password must be alphanumeric")
    .isLength({ min: 8, max: 100 }).withMessage("The password must be 8~100 characters")
    .custom((value, { req }) => value === req.body.passwordc).withMessage("password confirmation doesn't match")
], async (req, res) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) return res.json({ error: "The email address is taken" });
    let hashed = await hash(req.body.password, 10);
    let buffer = await randomBytes(48);
    let token = buffer.toString('hex');
    user = new UserModel({
      name: req.body.name, email: req.body.email, pass: hashed,
      key: req.body.publicKey, token: token,
    })
    let userSaved = await user.save();
    console.log(userSaved);
    let url = 'http://192.168.2.97:3000/activate/' + token
    let mailres = await sendMail(req.body.email, url);
    return res.json({ success: true })
  } catch (err) { throw err }
})
module.exports = router;