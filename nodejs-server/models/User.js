import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 35
  },
  password: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    required: true,
    unique: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: false
  },
  avatar: {},
  rooms: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    default: []
  },
  requests: { type: [{ roomName: String, leader: String }], default: [] },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("User", UserSchema);
