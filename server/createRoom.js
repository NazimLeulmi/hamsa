const express = require('express');
const router = express.Router();

// // CREATE A GROUP RESTRICTED POST ROUTE
app.post("/createRoom", [
  body('data').notEmpty().withMessage("The room name is required to create a room")
    .isAlphanumeric().withMessage("The room name must be alphanumeric")
    .isLength({ min: 5, max: 30 }).withMessage("The room name must be 5~30 characters"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!req.session.userId) return res.json({ error: "Restricted route" });
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    let q = 'SELECT * FROM users WHERE id=?';
    db.query(q, req.session.userId, async (err, results) => {
      if (err) throw err;
      if (results.length === 0) res.json({ error: "Restricted route" })
      const room = { name: req.body.data, admin: results[0].id, created: Date.now() };
      q = 'INSERT INTO rooms SET ?';
      db.query(q, room, async (error, insertResult) => {
        if (error) throw error;
        console.log(insertResult);
        let userRooms = { room: insertResult.insertId, user: results[0].id }
        let query = 'INSERT into user_rooms SET ?'
        db.query(query, userRooms, async (e, res) => {
          if (e) throw e;
          return res.json(res);
        })
      })
    })

  } catch (err) { console.log(err) }
})