const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_replace_me");
const Order = require("../models/Order");

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;

  try {
    if (!endpointSecret) {
      // In case webhook secret is not configured, just acknowledge to avoid failing deployments.
      return res.status(200).send();
    }

    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: "Paid" }
      );
    }
  } catch (err) {
    console.error("Error handling webhook event:", err.message);
  }

  res.json({ received: true });
};

