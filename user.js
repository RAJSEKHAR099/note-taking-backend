const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isVerified: { type: Boolean, default: false },
  otp: { type: String }  // will act like password
});

module.exports = mongoose.model("User", userSchema);
