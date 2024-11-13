const express = require('express');
const { checkSubsctiption } = require('../middleware/checkSub');

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
      const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription', // For recurring payments
          line_items: [
              {
                  price: 'price_1QKbFCP74NFXqpmxZF6idnMt',
                  quantity: 1,
              },
          ],
          success_url: `${process.env.ROOT_URL}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.ROOT_URL}/pay/cancelled`,
      });

      res.json({ sessionId: session.id });
  } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).send('Server error');
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.sendStatus(400);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Update user subscription status in the database here
  }

  res.sendStatus(200);
});

router

module.exports = router;
