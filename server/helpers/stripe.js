const Stripe = require("stripe");

const getStripe = () => {
    return Stripe(process.env.STRIPE_SECRET_KEY);
};

module.exports = getStripe;