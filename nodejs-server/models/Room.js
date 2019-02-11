import mongoose from "mongoose";
const RoomSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    unique: true,
    required: true,
    minlength: 3,
    maxlength: 35
  },
  requests: { type: [String], default: [] },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  leader: String,
  chat: {
    type: [
      {
        iv: String, // Hex encoded Initialization vector
        msg: String, // base64 encoded , AES 256 Encrypted cipher text
        from: String, // sender
        to: [{
          publicKey: String, // RSA public key string/pem
          username: String,
          key: String, // Base64 encoded ,AES 256 Encrypted Key
        }],
        isImg: Boolean,
        createdAt: { type: Date, default: Date.now }
      }
    ],
    default: []
  }
});

export default mongoose.model("Room", RoomSchema);
