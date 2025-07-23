// src/app/success/loading.js

export default function SuccessLoading() {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Loading Payment Details...</h1>
        <p style={styles.message}>Please wait while we verify your order.</p>
        <div style={styles.spinner}></div>
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
      fontSize: '2em',
      color: '#007bff',
      marginBottom: '20px',
    },
    message: {
      fontSize: '1.1em',
      color: '#555',
      marginBottom: '30px',
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