// src/app/cancel/page.js
'use client'; // This page can be a client component if you want client-side routing

import { useRouter } from 'next/navigation';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Payment Cancelled</h1>
      <p style={styles.message}>
        Your payment was not completed. You can try again or contact support if you encountered any issues.
      </p>
      <button onClick={() => router.push('/pricing')} style={styles.button}>
        Return to Pricing
      </button>
      <button onClick={() => router.push('/')} style={styles.secondaryButton}>
        Go to Homepage
      </button>
    </div>
  );
}

const styles = {
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
    color: '#dc3545', // Red for cancel
    marginBottom: '20px',
  },
  message: {
    fontSize: '1.2em',
    color: '#333',
    marginBottom: '30px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#ffc107', // Orange for warning/retry
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: '20px',
    marginRight: '10px',
  },
  secondaryButton: {
    padding: '10px 20px',
    fontSize: '1em',
    backgroundColor: '#6c757d', // Grey for secondary action
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
    marginTop: '20px',
  }
};