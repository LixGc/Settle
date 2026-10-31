const Stripe = require("stripe");

// Connects to Stripe with the secret key from .env
const getStripe = () => {
    return Stripe(process.env.STRIPE_SECRET_KEY);
};

module.exports = getStripe;