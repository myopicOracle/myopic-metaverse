// A simplified SIWE implementation for demonstration purposes.

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const siweApi = {
  signIn: async (): Promise<{ address: string } | null> => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to continue.");
        return null;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect to MetaMask.");
      }
      const address = accounts[0];
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      // 1. Create a message to sign
      const messageToSign = `Welcome to the Brain Metaverse!\n\nClick to sign in and accept the terms of service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour wallet address:\n${address}\n\nChain ID: ${parseInt(chainId, 16)}`;

      // 2. Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [messageToSign, address],
      });

      // 3. In a real app, we'd verify the signature on the backend.
      // Here, we'll just assume success if the user signs.
      if (signature) {
        return { address };
      }
      
      return null;
    } catch (error: any) {
      console.error("Authentication failed:", error);
      alert(`Authentication failed: ${error.message || 'User rejected the request.'}`);
      return null;
    }
  },
};
