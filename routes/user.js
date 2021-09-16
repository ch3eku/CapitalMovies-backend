const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config()
const isLoggedIn = require("../isLoggedIn");

// Create TOKEN_KEY
// require('crypto').randomBytes(64).toString('hex')

// Get the favourite movies
router.get('/user/:uid/favourite', async (req, res) => {
    const user = await User.findById(req.params.uid);
    res.send(user.favourite);
})

// Add to favourite
router.post('/user/:uid/favourite/:mid', async (req, res) => {
    try {
        const user = await User.findById(req.params.uid);

        user.favourite.push(req.params.mid);
        await user.save();
        res.send(user.favourite);
    }
    catch (e) {
        console.log(e);
    }
});

// Remove from favourite
router.delete('/user/:uid/favourite/:mid', async (req, res) => {
    try {
        const { uid, mid } = req.params;
        await User.findByIdAndUpdate(uid, { $pull: { favourite: mid } })
        const user = await User.findById(req.params.uid);
        res.send(user.favourite);
    } catch (r) {
        console.log(e);
    }
})

// Register
router.post("/user/signup", async(req, res) => {
    // our register logic goes here...
    try {
        // Get user input
        const { username, email, password } = req.body;

        // Validate user input
        if (!(email && password && username)) {
            return res.status(400).json({
                error: 'All fields are required.'
            });
        }

        // check if user already exist in our database
        // Validate if user exist 
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).json({
                error: 'User Already Exist. Please Login!'
            });
        }

        //Encrypt user password
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        // Create user in our database
        const user = await User.create({
            username: username,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword
        });

        res.status(200).json({
            success: 'Registration Successful :)'
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            error: 'Registration Failed!'
        });
    }

});

// Login
router.post("/user/login", async(req, res) => {
    // our login logic goes here
    try {
        // Get user input
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            return res.status(400).json({
                error: 'All fields are required.'
            });
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const accessToken = jwt.sign({ _id: user._id, username: user.username }, process.env.TOKEN_KEY);

            // save user token
            user.token = accessToken;
            user.save();

            return res.status(200).json({
                success: 'Login Successful :)',
                token: accessToken
            });
        }
        res.status(401).json({
            error:'Invalid Credentials :('
        });
    }
    catch (err) {
        console.log(err);
        res.status(400).json({
            error:'Login Failed!'
        });
    }
});

module.exports = router;