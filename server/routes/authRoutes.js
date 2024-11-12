// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Register Route
router.get('/register', (req, res) => {
    res.render('pages/register');
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send('User already exists');

        const newUser = new User({ email, password });
        await newUser.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Login Route
router.get('/login', (req, res) => {
    res.render('pages/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Route
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

module.exports = router;
