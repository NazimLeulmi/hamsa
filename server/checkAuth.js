const express = require('express');
const router = express.Router();

// // CHECK AUTH GET ROUTE
app.get("/checkAuth", async (req, res) => {
  if (!req.session.userId) return res.json({ success: false });
  let q = 'SELECT * FROM users WHERE id=?';
  db.query(q, req.session.userId, async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.json({ auth: false });
    return res.json({ user: results[0] })
  })
})


