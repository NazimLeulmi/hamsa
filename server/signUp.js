const express = require('express');
const router = express.Router();


router.post('/signUp', [
  body('name').notEmpty().withMessage("The name is required to submit the form")
    .isAlphanumeric().withMessage("The name must be alphanumeric")
    .isLength({ min: 5, max: 30 }).withMessage("The name must be 5~30 characters"),
  body('email').notEmpty().withMessage("The email is required to submit the form")
    .isLength({ min: 8, max: 50 }).withMessage("The email must be 8~50 characters")
    .isEmail().withMessage("The email is invalid")
    .normalizeEmail(),
  body('password').notEmpty().withMessage("The password is required to submit the form")
    .isAlphanumeric().withMessage("The password must be alphanumeric")
    .isLength({ min: 8, max: 100 }).withMessage("The password must be 8~100 characters")
    .custom((value, { req }) => value === req.body.passwordc).withMessage("password confirmation doesn't match")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ error: errors.array()[0].msg });
  }
  let q = `SELECT * FROM users WHERE email=?`
  db.query(q, req.body.email, async (err, results) => {
    if (err) throw err;
    if (results.length !== 0) {
      return res.json({ error: "The email address is taken" });
    }
    const hashed = await hash(req.body.password, 10);
    const buffer = await randomBytes(48);
    const token = buffer.toString('hex');
    const user = {
      name: req.body.name, password: hashed, activision_token: token,
      email: req.body.email, public_key: req.body.publicKey
    }
    q = `INSERT INTO users SET ?`;
    db.query(q, user, (err, results) => {
      if (err) throw err;
    })
    await sendMail(user.email,
      `http://192.168.2.97:3000/activate/${user.activision_token}`)
    return res.json({ success: true, token: user.activision_token })
  })

})

module.exports = router;