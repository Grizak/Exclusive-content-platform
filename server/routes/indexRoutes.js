const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('pages/index', { user: req.user, title: "Home", header: true });
});

router.get('/subscribe', (req, res) => {
  res.render('pages/subscribe', { user: req.user, title: "Subscribe", header: true });
});

module.exports = router;