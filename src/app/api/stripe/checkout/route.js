// src/app/api/stripe/checkout/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia'
});

export async function POST(req) {
  try {
    const { items } = await req.json();

    // Transform items into Stripe's line_items format for subscriptions
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          // images: [item.image], // Optional: if you have product images
        },
        unit_amount: item.price * 100, // Amount in cents
        recurring: {
          interval: 'month', // Can be 'day', 'week', 'month', or 'year'
          // interval_count: 1, // Optional: defaults to 1
        },
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
      // Optional: Add customer email if you have it
      // customer_email: 'customer@example.com',
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}