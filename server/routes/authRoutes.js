// server/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();
const crypto = require('crypto');
const nodeMailer = require('nodemailer');

require('dotenv').config();

const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Register Route
router.get('/register', (req, res) => {
    res.render('pages/register', { user: req.user, title: "Register", header: true });
});

router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).send('User already exists');

        const verificationToken = crypto.randomBytes(64).toString('hex');

        const newUser = new User({ 
            name: {
                first: firstName,
                last: lastName,
            },
            email,
            password,
            verificationToken: verificationToken,
        });
        await newUser.save();

        const root = process.env.ROOT_URL;
        const URL = `${root}/auth/verifyemail?token=${verificationToken}`;

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your email",
            text: `Click the link to verify your email, 
                ${URL}
            `,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f6f6f6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        }
                        .header {
                            text-align: center;
                            padding: 10px 0;
                        }
                        .header h1 {
                            color: #333;
                        }
                        .content {
                            padding: 20px;
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        .button {
                            display: inline-block;
                            padding: 10px 20px;
                            color: #ffffff;
                            background-color: #007bff;
                            text-decoration: none;
                            border-radius: 4px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            font-size: 12px;
                            color: #999;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>

                <div class="container">
                    <div class="header">
                        <h1>Verify Your Email Address</h1>
                    </div>

                    <div class="content">
                        <p>Hello [User's Name],</p>
                        <p>Thank you for registering on [Your Website/Service Name]! To complete your registration, please verify your email address by clicking the button below:</p>

                        <p style="text-align: center;">
                            <a href="${URL}" class="button">Verify My Email Address</a>
                        </p>

                        <p>If the button doesn’t work, please copy and paste the following link into your browser:</p>
                        <p><a href="${URL}">${URL}</a></p>

                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn’t request this email, please ignore it. Your account will not be activated until you complete the verification.</p>
                    </div>

                    <div class="footer">
                        <p>Thank you,<br>The [Your Website/Service Name] Team</p>
                    </div>
                </div>

                </body>
                </html>

            `
        }, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send('Error sending verification email');
            }
            console.log('Verification email sent:', info.response);
            const redirectURL = `/auth/verify?email=${email}`

            res.redirect(`${redirectURL}`);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.get('/verify', (req, res) => {
    const email = req.query.email;
    res.render('pages/verifyEmail', { title: "Verify Email", email: email, header: false });
});

// Verification Route
router.get('/verifyemail', async (req, res) => {
    try {
        const token = req.query.token;

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).send({ message: "Invalid or expired token" });
        }

        user.isVerified = true;

        await user.save();

        res.status(200).render('pages/emailverified', { title: "Your email has been verified", user: req.user, header: false });

        const root = process.env.ROOT_URL;

        const loginURL = `${root}/auth/login`

        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Welcome to our website",
            text: `Welcome to our website, now that you have registerd an account, you can sign up on the link, ${loginURL}`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to [Your Website Name]</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            background-color: #f9f9f9;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #fff;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                        }
                        h1 {
                            color: #4CAF50;
                            font-size: 24px;
                            text-align: center;
                        }
                        p {
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        a {
                            color: #4CAF50;
                            text-decoration: none;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 14px;
                            color: #888;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Welcome to My Exclusive Content Platform, ${user.name.first}!</h1>

                        <p>We’re excited to have you join our community and can't wait to help you explore everything our platform has to offer. Here’s a quick overview to help you get started:</p>
                        
                        <ul>
                            <li><strong>Get early access to my content:</strong> You can make a subscription and get access to all exclusive behind the scenes content and early access to my youtube content.</li>
                            <li><strong>[Feature #2]:</strong> Share another key feature or benefit.</li>
                            <li><strong>[Helpful Resource or Guide]:</strong> Provide links to any resources, guides, or community spaces they might find useful.</li>
                        </ul>

                        <p>To get the most out of your experience, we recommend logging into your account, exploring the features, and joining in on any discussions with fellow members.</p>

                        <p>If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>. We’re here to help!</p>

                        <p>Thank you for choosing My Exclusive Content Platform. Let’s make this journey incredible together!</p>

                    </div>
                </body>
                </html>
            `
        })

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

// Polling for the verification status
router.get('/checkverification', async (req, res) => {
    try {
        const email = req.params.email;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        };

        res.json( user.isVerified );
    } catch (err) {
        console.error(err);
    }
});

// Login Route
router.get('/login', (req, res) => {
    res.render('pages/login', { title: "Login", user: req.user, header: true });
});

router.post('/login', (req, res, next) => {
    if (fetch('/auth/checkverification')) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: false
    })}(req, res, next);
});

// Logout Route
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) return next(err);
        res.redirect('/');
    });
});

module.exports = router;
