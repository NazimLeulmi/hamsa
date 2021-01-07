const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  publicKey: { type: String, required: true },
  activated: { type: Boolean, default: false },
  activisionToken: { type: String, unique: true },
  date: { type: Date, default: Date.now },
  groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
  notifications: [{ from: Schema.Types.ObjectId, name: String, groupName: String }]
});
const groupSchema = new Schema({
  name: { type: String, required: true },
  admin: Schema.Types.ObjectId,
  date: { type: Date, default: Date.now },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});


const GroupModel = mongoose.model('Group', groupSchema);
const UserModel = mongoose.model('User', userSchema);

module.exports = { GroupModel, UserModel };