// src/app/checkout/page.js
'use client'; // This is a client component

import { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';

export default function CheckoutPage() {
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!stripe) {
      console.error('Stripe.js has not loaded yet.');
      return;
    }

    setLoading(true);

    try {
      // Call your backend API to create the checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            { name: 'Pro Plan', price: 1, quantity: 1 }, // Example item
            // Add more items as needed
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Error redirecting to Stripe Checkout:', error.message);
        alert(error.message);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Product Checkout</h1>
      <button onClick={handleCheckout} disabled={!stripe || loading}>
        {loading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
}