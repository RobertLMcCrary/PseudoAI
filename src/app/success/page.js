// src/app/success/page.js (No significant change needed for this part, but reinforcing understanding)
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verifying your payment...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        .then(response => {
          if (!response.ok) {
            // This catches HTTP errors (e.g., 500 from your API)
            throw new Error('Network response was not ok.');
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            setMessage('Payment Successful! Thank you for your purchase.');
            // You might want to display more details from `data.session` here
            // e.g., order ID if your webhook returned it
          } else {
            setMessage(data.message || 'Payment not yet confirmed.');
            setError(data.error || 'There was an issue verifying your payment. Please contact support.');
          }
        })
        .catch(err => {
          console.error('Error fetching session verification:', err);
          setMessage('An error occurred.');
          setError('Could not verify payment status. Please contact support.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setMessage('No session ID found in URL. Invalid access.');
      setLoading(false);
      setError('Please return to the checkout page and try again.');
    }
  }, [searchParams, router]);

  // ... (rest of the component, including styling)
  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Payment Status</h1>
        <p style={styles.message}>{message}</p>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{error ? 'Payment Issue' : 'Payment Success!'}</h1>
      <p style={styles.message}>{message}</p>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <button onClick={() => router.push('/')} style={styles.button}>
        Go to Homepage
      </button>
    </div>
  );
}

const styles = { /* ... (your existing styles) */
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5em',
    color: '#28a745', // Green for success
    marginBottom: '20px',
  },
  message: {
    fontSize: '1.2em',
    color: '#333',
    marginBottom: '30px',
  },
  errorMessage: {
    fontSize: '1.1em',
    color: '#dc3545', // Red for error
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: '20px',
  },
  spinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeftColor: '#007bff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginTop: '20px',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  }
};