function checkSubscription(req, res, next) {
  if (req.user && req.user.isSubscribed) {
      return next();
  }
  res.redirect('/subscribe'); // Redirect if the user is not subscribed
}

module.exports = { checkSubscription };
