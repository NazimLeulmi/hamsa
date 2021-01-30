let express = require('express');
let body = require('express-validator').body;
let validationResult = require('express-validator').validationResult;
let compare = require('bcrypt').compare;
let router = express.Router();
let UserModel = require('./models').UserModel;

// // SIGN IN POST ROUTdeep house mixdeep house mixE
router.post('/signIn', [
  body('email').notEmpty().withMessage("The email is required to submit the form")
    .isEmail().withMessage("The email is invalid")
    .normalizeEmail(),
  body('password').notEmpty().withMessage("The password is required to submit the form")
    .isAlphanumeric().withMessage("Invalid password")
    .isLength({ min: 8, max: 100 }).withMessage("Invalid password")
], async (req, res) => {
  try {
    let errors = validationResult(req);
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    let user = await UserModel.findOne({ email: req.body.email }).populate({
      path: 'rooms',
      populate: {
        path: 'chat',
        model: 'Message'
      }
    });
    if (!user) return res.json({ error: "Invalid email or password" });
    const isCorrect = await compare(req.body.password, user.pass);
    if (!isCorrect) return res.json({ error: "Invalid email or password" });
    if (user.active === false) return res.json({ error: "The account has to be activated" });
    req.session.userId = user._id;
    console.log(user, "SIGN IN");
    return res.json({ user })
  } catch (err) { throw err }
})

module.exports = router;