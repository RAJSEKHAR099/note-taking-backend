const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./user");
const Note = require("./note");
const verifyToken = require("./jwtMiddleware");
const sendOtpEmail = require("./mailer");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB
mongoose.connect("mongodb+srv://noteUser:notePass123@cluster0.wpurrgq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Mongo Error: ", err));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend running!");
});

// ✅ Signup - takes name, dob, email, sends OTP to email
app.post("/signup", async (req, res) => {
  try {
    const { name, dob, email } = req.body;

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let user = await User.findOne({ email });

    if (user) {
      // if already exists → update OTP only
      user.otp = otp;
      await user.save();
    } else {
      // create new user
      user = new User({ name, dob, email, otp });
      await user.save();
    }

    // send OTP via email
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Verify OTP → generate token
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ Mark user verified
    user.isVerified = true;
    user.otp = null; // optional: clear OTP
    await user.save();

    // OTP valid → JWT token
    const token = jwt.sign(
      { email: user.email },
      "SECRET123",
      { expiresIn: "1h" }
    );

    // ✅ Return name + email + token
    res.json({ 
      message: "Login successful", 
      token, 
      name: user.name, 
      email: user.email 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create a new note
app.post("/notes", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = new Note({
      userEmail: req.user.email,
      title,
      content,
    });

    await note.save();
    res.json({ message: "Note created successfully", note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch notes (also return user info)
app.get("/notes", verifyToken, async (req, res) => {
  try {
    const notes = await Note.find({ userEmail: req.user.email });
    const user = await User.findOne({ email: req.user.email });

    res.json({ 
      notes, 
      name: user?.name || "User", 
      email: req.user.email 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete note
app.delete("/notes/:id", verifyToken, async (req, res) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userEmail: req.user.email,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found or not authorized" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

