/**
 *@user controller 
 */

const { UserModel } = require('../models/user.model');

//fecthing single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)
        .populate('bookings')
        .lean();
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching user' });
    }
};

// Fetch multiple users with filtering,pagination and sorting
exports.getAllUsers = async (req, res) => {
    try {
    // Desstracture and parse query parameter
    let { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', name } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    
    // Building query filter
    const query = {};
    if (name) {
        query.name = { $regex: name, $options: 'i' }; //case-insensitive search
    }

    // counting all users matching the query
    const totalUsers = await UserModel.countDocuments(query);

    // Fetching users with pagination, sorting and populating books
    const users = await UserModel.find(query)
    .populate('bookings')
    .sort({ [sortBy]:  order === 'desc' ? -1 : 1 })
    .skip((page -1) * limit)
    .limit(limit)
    .lean();

   res.json({
    users,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: page,
   }); 
    } catch (error) {
        res.status(400).json({ error: 'Error fetching users' });
    }
};

// creating a user
exports.createUser = async (req, res) => {
    try {
        const newUser = new UserModel(req.body);
        await newUser.save();
        res.status(200).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(400).json({ error: 'error.message' });
    }
}

//updating a user by ID
exports.updateUser = async (req, res) => {
    try {
        const updateUser = await UserModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updateUser) return res.status(404).send({ error: 'User not found' });
        res.json(updateUser);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
}; 


// getme 
// will be removing this
exports.getMe = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  };

//   Update
exports.updateMe = async (req, res, next) => {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /update-password',
          400
        )
      );
    }
  
    // 2) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email', 'phone', 'avatar');
  
    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  };

//   Deactivate
exports.deactivateMe = async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
  
    res.status(204).json({
      status: 'success',
      data: null
    });
  };
  
  // Helper function to filter object fields
  const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };

// Deleting a user by ID
exports.deleteUser = async (req, res ) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};