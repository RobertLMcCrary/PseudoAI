// src/components/StripeProviderWrapper.js
'use client'; // This must be a client component

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Load Stripe outside of a component’s render to avoid recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function StripeProviderWrapper({ children }) {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set.");
    // Optionally render a fallback UI or throw an error
    return <div>Error: Stripe is not configured.</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}