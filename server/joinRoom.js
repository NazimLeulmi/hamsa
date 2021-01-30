let express = require('express');
let router = express.Router();
let UserModel = require('./models').UserModel;
let RoomModel = require('./models').RoomModel;
let body = require('express-validator').body;
let validationResult = require('express-validator').validationResult;


router.post("/joinRoom", [
  body('data').notEmpty().withMessage("The room ID is required to join a room")
    .isAlphanumeric().withMessage("The room ID must be alphanumeric")
    .isLength({ min: 24, max: 24 }).withMessage("The room ID is invalid"),
], async (req, res) => {
  try {
    // Check if the user is signed in
    if (!req.session.userId) return res.json({ error: "Restricted route" });
    // Check if the User entry exists in the database
    let user = await UserModel.findById(req.session.userId);
    // if the user entry doesn't exist return an error
    if (!user) return res.json({ error: "Restricted Route" });
    // Room ID validation errors
    let errors = validationResult(req);
    // if the room ID is invalid return an error to the client
    if (!errors.isEmpty()) return res.json({ error: errors.array()[0].msg });
    // Check if the room entry exists
    let room = await RoomModel.findById(req.body.data);
    // if the room entry doesn't exist return an error to the client
    if (!room) return res.json({ error: "The room doesn't exist" });
    // Check if the user isn't in this room already
    for (let i = 0; i < room.users.length; i++) {
      if (String(room.users[i]._id) === String(user._id)) {
        return res.json({ error: "You are already in this group" });
      }
    }
    // Find the room admin user entry
    let roomAdmin = await UserModel.findById(room.admin);
    // if the room admin user entry doesn't exist return an error to the client
    if (!roomAdmin) return res.json({ error: "The room admin doesn't exist" });
    // Check if the user didnt send a request to the admin already
    let nots = roomAdmin.notifications;
    for (let i = 0; i < nots.length; i++) {
      if (String(nots[i].userId) === String(user._id) && String(nots[i].roomName) === String(room.name)) {
        return res.json({ error: "You already sent a request to the admin" });
      }
    }
    // Push the user's request to the group admin
    roomAdmin.notifications.push({
      userId: user._id, userName: user.name,
      roomName: room.name, roomId: room._id
    })
    let adminSaved = await roomAdmin.save();
    console.log(adminSaved.notifications, `${user._id} wants to join ${room.name} room`)
    return res.json({ success: true });
  } catch (err) { console.log(err) }
})

module.exports = router;