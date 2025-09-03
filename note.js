const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },   // which user owns this note
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Note", noteSchema);
