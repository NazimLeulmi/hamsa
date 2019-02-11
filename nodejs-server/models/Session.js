import mongoose from "mongoose";
const SessionSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "1d"
  },
  token: {
    type: String,
    unique: true
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Session", SessionSchema);
