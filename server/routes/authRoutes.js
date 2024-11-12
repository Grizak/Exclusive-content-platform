// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const nodeMailer = require('nodemailer');

require('dotenv').config();

const transporter = new nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
// Register Route
router.get('/register', (req, res) => {
    res.render('pages/register', { user: req.user, title: "Register" });
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send('User already exists');

        const verificationToken = crypto.randomBytes(64).toString('hex')

        const newUser = new User({ 
            email,
            password,
            verificationToken: verificationToken,
        });
        await newUser.save();

        const root = process.env.ROOT_URL;

        const URL = `${root}/auth/verifyemail?token=${verificationToken}`

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your email",
            "text": "Click the link to confirm your email",
            "html": `
                <p>Verify Your Email by clicking the link</p>
                <a href="${URL}">Verify</a>
            `
        })

        res.sendFile(path.join(__dirname, '../../public/html/veryfiEmail.html'))
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.get('/verifyemail', async (req, res) => {
    try {
        const token = req.params.token;

        
    } catch (err) {
        console.error(err);
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
