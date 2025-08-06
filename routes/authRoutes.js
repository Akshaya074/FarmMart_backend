// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    console.log("Signup request received with:", req.body); // Log the incoming data
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Signup error:", error); // Log any errors
    res.status(500).json({ message: 'Failed to register user' });
  }
});

// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(403).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
//       expiresIn: '1h',
//     });

//     res.json({ message: 'Login successful', token, role: user.role });
//   } catch (error) {
//     res.status(500).json({ message: 'Login failed' });
//   }
// }); 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare the password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ message: 'Invalid credentials' });

    // Create JWT token with user ID, role, and name (to be used on the frontend)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.username // Include the user's name in the token payload
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send the response with token, role, and name
    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      name: user.name // Include the name in the response
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ message: 'Login failed' });
  }
});


router.put('/profile', async (req, res) => {
  const { name, location, profileImage } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(req.userId, { name, location, profileImage }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});

module.exports = router;
