let express = require('express');
let body = require('express-validator').body;
let validationResult = require('express-validator').validationResult;
let router = express.Router();
let UserModel = require('./models').UserModel;
let RoomModel = require('./models').RoomModel;

router.post("/createRoom", [
  body('data').notEmpty().withMessage("The room name is required to create a room")
    .isAlphanumeric().withMessage("The room name must be alphanumeric")
    .isLength({ min: 5, max: 30 }).withMessage("The room name must be 5~30 characters"),
], async (req, res) => {
  try {
    console.log(req.session.userId, "CREATING ROOM");
    let errors = validationResult(req);
    if (!req.session.userId) return res.json({ error: "Restricted route" });
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    let user = await UserModel.findById(req.session.userId);
    if (!user) res.json({ error: "Restricted route" })
    let room = new RoomModel({
      name: req.body.data,
      admin: user._id,
      users: [user._id]
    })

    let roomSaved = await room.save();
    user.rooms.push(roomSaved._id);
    let userSaved = await user.save();
    console.log(roomSaved);
    return res.json({ room: roomSaved })
  } catch (err) { console.log(err) }
})

module.exports = router;