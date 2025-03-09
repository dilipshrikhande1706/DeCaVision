import React, { useState } from 'react';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    const { solana } = window;
    if (solana && solana.isPhantom) {
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
    } else {
      alert('Please install Phantom Wallet!');
    }
  };

  return (
    <div>
      <h1>DeCaVision</h1>
      <button onClick={connectWallet}>
        {walletAddress ? `Connected: ${walletAddress}` : 'Connect Phantom Wallet'}
      </button>
    </div>
  );
}

export default App;