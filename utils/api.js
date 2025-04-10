const express = require('express');
const multer = require('multer');
const app = express();

// Multer configuration
const upload = multer();

app.post('/api/signup', upload.none(), async (req, res) => {
    try {
        const { password, userRole, email, username } = req.body;

        // Validate incoming data
        if (!password || !userRole || !email || !username) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Simulate the signup logic
        const result = await signup({ password, userRole, email, username });
        res.status(200).json(result);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            message: 'An unexpected error occurred during signup',
            details: error.message 
        });
    }
});

// Dummy signup function
const signup = async ({ password, userRole, email, username }) => {
    // Replace this with your actual signup logic
    return { message: 'Signup successful', user: { username, email, userRole } };
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
