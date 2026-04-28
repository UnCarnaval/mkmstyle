import "server-only"

import Stripe from "stripe"

// Make Stripe optional - only initialize if API key is present
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null
