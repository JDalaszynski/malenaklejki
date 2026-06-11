import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'dummy_stripe_key_for_build';

export const stripe = new Stripe(stripeKey, {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
});

