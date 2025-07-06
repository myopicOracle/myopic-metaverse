import React, { useState } from 'react';
import { siweApi } from '../lib/siweApi';

interface AuthScreenProps {
  onLoginSuccess: (address: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await siweApi.signIn();
      if (result && result.address) {
        onLoginSuccess(result.address);
      }
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassLogin = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onLoginSuccess('0xGuest...Account');
  };

  const colors = {
    darkNavy: '#101726',
    cardNavy: '#1d283d',
    teal: '#49deb5',
    darkerTeal: '#3acba0',
    lightGray: '#a0aec0',
    borderGray: '#2a3b5a',
    mutedTeal: '#318e77',
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      background: colors.darkNavy,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
    },
    card: {
      background: colors.cardNavy,
      padding: '40px',
      borderRadius: '15px',
      textAlign: 'center',
      maxWidth: '400px',
      border: `1px solid ${colors.borderGray}`,
      boxShadow: `0 0 25px rgba(73, 222, 181, 0.1)`,
    },
    button: {
      background: colors.teal,
      color: colors.darkNavy,
      border: 'none',
      padding: '15px 30px',
      borderRadius: '8px',
      marginTop: '20px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'background-color 0.3s',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: colors.teal,
    },
    description: {
      fontSize: '16px',
      lineHeight: 1.6,
      color: colors.lightGray,
    },
    footer: {
      position: 'absolute',
      bottom: '30px',
      width: '100%',
      textAlign: 'center',
      color: colors.lightGray,
      fontSize: '14px',
    },
    footerLink: {
      color: colors.teal,
      textDecoration: 'none',
      fontWeight: 'bold',
    },
    bypassLink: {
      color: colors.lightGray,
      textDecoration: 'underline',
      fontSize: '13px',
      cursor: 'pointer',
      opacity: 0.7,
      transition: 'color 0.3s, opacity 0.3s',
    },
  };
  
  const buttonStyle = { ...styles.button };
  if (isLoading) {
    buttonStyle.background = colors.mutedTeal;
    buttonStyle.color = colors.lightGray;
    buttonStyle.cursor = 'not-allowed';
  }

  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome to Web3 Metaverse</h1>
          <h1 style={styles.title}>🧠</h1>
          <p style={styles.description}><em>A_MyopicMetaverse_Project</em></p>
          <button 
            onClick={handleLogin} 
            disabled={isLoading} 
            style={buttonStyle}
            onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = colors.darkerTeal; }}
            onMouseOut={e => { if (!isLoading) e.currentTarget.style.background = colors.teal; }}
          >
            {isLoading ? 'Connecting...' : 'Sign-In with Ethereum'}
          </button>
          <div style={{ marginTop: '20px' }}>
            <a 
              href="#" 
              onClick={handleBypassLogin} 
              style={styles.bypassLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.color = colors.teal;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
                e.currentTarget.style.color = colors.lightGray;
              }}
            >
              Don't have a Metamask Wallet?
            </a>
          </div>
        </div>
        <div style={styles.footer}>
          © 2025 <a href="https://github.com/myopicOracle" target="_blank" rel="noopener noreferrer" style={styles.footerLink}>@myopicOracle</a>. All rights reserved.
        </div>
      </div>
    </>
  );
};

export default AuthScreen;