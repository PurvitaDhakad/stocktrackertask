const express = require('express');
const router = express.Router();
const { signup } = require('../middleware/auth'); // your signup function

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await signup(username, password);
        res.json({ message: 'Account created successfully', user });
    } catch (err) {
        console.log('Signup error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
