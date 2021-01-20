const express = require('express');
const router = express.Router();

// // SIGN IN POST ROUTdeep house mixdeep house mixE
app.post('/signIn', [
  body('email').notEmpty().withMessage("The email is required to submit the form")
    .isEmail().withMessage("The email is invalid")
    .normalizeEmail(),
  body('password').notEmpty().withMessage("The password is required to submit the form")
    .isAlphanumeric().withMessage("Invalid password")
    .isLength({ min: 8, max: 100 }).withMessage("Invalid password")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ error: errors.array()[0].msg });
  }
  let q = 'SELECT * FROM users where email=?';
  db.query(q, req.body.email, async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.json({ error: "Invalid email or password" });
    const isCorrect = await compare(req.body.password, results[0].password);
    if (!isCorrect) return res.json({ error: "Invalid email or password" });
    if (results[0].activated === 0) return res.json({ error: "The account has to be activated" });
    req.session.userId = results[0].id;
    return res.json({ user: results[0] })
  })
})