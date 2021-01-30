let mongoose = require('mongoose');
let Schema = require('mongoose').Schema;

let User = new mongoose.Schema({
  name: { type: String, minlength: 5, maxlength: 25, required: true },
  email: { type: String, minlength: 8, maxlength: 50, required: true },
  token: { type: String, minlength: 96, maxlength: 96 },
  pass: { type: String, required: true },
  key: { type: String, required: true },
  active: { type: Boolean, required: true, default: false },
  rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  notifications: [{
    userName: String, userId: Schema.Types.ObjectId,
    roomName: String, roomId: Schema.Types.ObjectId
  }]
}, { timestamps: true })

let Room = new mongoose.Schema({
  name: { type: String, minlength: 5, maxlength: 25, required: true },
  admin: Schema.Types.ObjectId,
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  chat: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
}, { timestamps: true })

let Message = new mongoose.Schema({
  msg: { type: String, required: true },
  user: Schema.Types.ObjectId,
}, { timestamps: true })

let UserModel = mongoose.model('User', User);
let RoomModel = mongoose.model('Room', Room);
let MessageModel = mongoose.model('Message', Message);

module.exports = { UserModel, RoomModel, MessageModel };