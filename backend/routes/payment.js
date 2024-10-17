const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe('your_stripe_secret_key');

router.post('/create-checkout-session', async (req, res) => {
  const { cartItems } = req.body;
  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100, // Price in cents
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).send('Payment processing error');
  }
});

module.exports = router;
