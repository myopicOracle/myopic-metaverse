import React, { useState, useCallback } from 'react';
import AuthScreen from './components/AuthScreen';
import MetaversePage from './components/MetaversePage';

function App() {
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const handleLoginSuccess = useCallback((address: string) => {
    setUserAddress(address);
  }, []);

  const handleLogout = useCallback(() => {
    setUserAddress(null);
    // You might want to add logic to clear session storage or cookies here
  }, []);

  return (
    <>
      {userAddress ? (
        <MetaversePage onLogout={handleLogout} />
      ) : (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;
