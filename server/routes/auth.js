import express from "express"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


const router = express.Router();



router.post("/register", async(req, res) => {
    const {name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await User.create({name, email, password: hashedPassword});
        res.json(user);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send token and user info back
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



export default router