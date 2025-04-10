// handle authentication-related task, signup-validation,checking and creating new user.
const { validateRegisterInput } = require('../controllers/auth.validation');
const { AuthModel } = require('../models/auth.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    // finding user by email
    const user = await AuthModel.findOne({ email: req.body.email });
    if(!user) return res.status(401).send('Invalid credentials');
    
    // verifying password/assuming its hashed
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    //generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h'});
    res.status({ message: 'User logged in successfully', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    // may call validation call here before saving them
    // e.g: const errors = validateRegisterInput(req.body); if (object.keys(errors).length) {...}
    const errors = validateRegisterInput(req.body);
    if (object.key(errors).length > 0) {
      return res.status(400).json({ message: 'Validation failed',errors })
    }

    const newUser = new AuthModel(req.body);

    // hashing password before saving/if not done in a pre-save hook
    newUser.password = await bcrypt.hash(newUSer.password, 10);

    await newUser.save();
    res.status({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'User registration failed' });
  }
}; 