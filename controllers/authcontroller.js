// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Sign up
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error signing up user' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error logging in user' });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { name, email, password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, password },
      { new: true }
    );
    return res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating user' });
  }
};
