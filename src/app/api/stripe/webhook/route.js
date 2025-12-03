// src/app/api/stripe/webhook/route.js

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia' // Use the latest API version or one consistent with your Stripe account
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    let event;

    // Read the request body as text for webhook signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!webhookSecret) {
        console.error('Stripe webhook secret not set.');
        return NextResponse.json({ error: 'Stripe webhook secret not configured.' }, { status: 500 });
    }

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            webhookSecret
        );
    } catch (err) {
        console.error(`⚠️ Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log('✅ Checkout Session Completed:', session.id);

            // This is the CRUCIAL point for order fulfillment!
            //
            // 1. Retrieve information needed for fulfillment:
            //    - session.metadata (if you passed custom data during session creation)
            //    - session.customer_details.email
            //    - session.amount_total (in cents)
            //    - session.currency
            //    - session.line_items (requires `expand: ['line_items']` during session creation,
            //      or retrieve them separately using `stripe.checkout.sessions.listLineItems(session.id)`)
            //
            // 2. Perform your fulfillment logic:
            //    - Update your database: Mark the order as paid, create a new order record.
            //    - Send confirmation emails: To the customer, and possibly to your team.
            //    - Grant access: If selling digital products or subscriptions.
            //    - Decrease inventory: For physical products.
            //    - Handle any other business logic.
            //
            // IMPORTANT: Idempotency
            // Webhooks can be retried by Stripe. Ensure your fulfillment logic is idempotent,
            // meaning it can be run multiple times without causing duplicate orders or issues.
            // A common way is to check if the order/session ID already exists in your database
            // before processing it.

            // Example placeholder for fulfillment logic:
            console.log(`Fulfilling order for customer: ${session.customer_details?.email || 'N/A'}`);
            console.log(`Amount paid: ${session.amount_total / 100} ${session.currency.toUpperCase()}`);

            // In a real application, you would call a service or directly interact with your DB here.
            // Example: await db.orders.create({
            //    stripeSessionId: session.id,
            //    userId: session.metadata?.userId, // If you passed user ID in metadata
            //    status: 'paid',
            //    amount: session.amount_total,
            //    currency: session.currency,
            //    customerEmail: session.customer_details?.email,
            //    // ... other relevant details
            // });
            // Example: await emailService.sendOrderConfirmation(session.customer_details?.email, orderDetails);

            break;

        // You might want to handle other events too, e.g., for subscriptions:
        // case 'customer.subscription.created':
        //   console.log('Subscription created:', event.data.object.id);
        //   break;
        // case 'invoice.payment_succeeded':
        //   console.log('Invoice payment succeeded:', event.data.object.id);
        //   break;
        // case 'payment_intent.succeeded':
        //   const paymentIntent = event.data.object;
        //   console.log('Payment Intent Succeeded:', paymentIntent.id);
        //   // This event is also useful if you're using Payment Intents directly
        //   // rather than just Checkout Sessions.
        //   break;
        // case 'payment_intent.payment_failed':
        //   console.log('Payment Intent Failed:', event.data.object.id);
        //   // Handle failed payments, potentially notify customer
        //   break;

        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
}
