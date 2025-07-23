// src/app/api/stripe/verify-session/route.js (Modified)

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia'
});

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Session ID is missing.' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // This endpoint is primarily for client-side display.
    // The actual order fulfillment should be handled by the webhook.
    if (session.payment_status === 'paid') {
      // You can retrieve more details if needed for display, e.g., line items
      // const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
      // console.log('Line items:', lineItems.data);

      return NextResponse.json({ success: true, message: 'Payment confirmed for display.', session: session });
    } else {
      // Payment is not yet 'paid'
      return NextResponse.json({ success: false, message: `Payment status: ${session.payment_status}. Waiting for confirmation.` }, { status: 200 });
    }
  } catch (error) {
    console.error('Error retrieving Stripe session for display:', error);
    // If the session doesn't exist (e.g., invalid ID, or user navigated directly),
    // Stripe might throw an error.
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}