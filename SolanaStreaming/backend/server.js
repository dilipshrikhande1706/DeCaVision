const express = require('express');
const path = require('path');
const { Connection, PublicKey } = require('@solana/web3.js');
const app = express();
const PORT = 3000;

const LAMPORTS_PER_SOL = 1000000000; // Number of lamports per SOL
const paymentTiers = {
  0.1: 60,  // Example tier: 0.1 SOL -> 60 seconds video
  0.5: 300, // Example tier: 0.5 SOL -> 300 seconds video
  1: 600    // Example tier: 1 SOL -> 600 seconds video
};

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Add a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Solana Streaming API! Use /pay for payment verification.');
});

// Handle payment verification
app.get('/pay', async (req, res) => {
  const { signature, amount } = req.query;

  // Log the received parameters for debugging
  console.log("Received signature:", signature);
  console.log("Received amount:", amount);

  // Validate required parameters
  if (!signature || !amount) {
    return res.status(400).json({ error: 'Missing required parameters: signature and amount' });
  }

  try {
    // Ensure amount is a float
    const solAmount = parseFloat(amount);

    if (isNaN(solAmount)) {
      return res.status(400).json({ error: 'Invalid amount format' });
    }

    // Fetch the transaction details using the signature
    const tx = await connection.getTransaction(signature, { commitment: 'confirmed' });

    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    // Ensure the transaction contains valid metadata
    if (!tx.meta || !tx.meta.postBalances || !tx.meta.preBalances) {
      return res.status(400).json({ error: 'Invalid transaction metadata' });
    }

    // Calculate the payment amount in SOL
    const paymentAmount = tx.meta.postBalances[1] - tx.meta.preBalances[1];
    const solAmountFromTx = paymentAmount / LAMPORTS_PER_SOL;

    // Check if the amount is valid
    if (!paymentTiers[solAmountFromTx]) {
      return res.status(400).json({
        error: 'Invalid payment amount',
        receivedAmount: solAmountFromTx,
        expectedAmounts: Object.keys(paymentTiers)
      });
    }

    // Select a video duration and URL based on the payment amount
    const duration = paymentTiers[solAmountFromTx];
    const videoUrl = `/videos/video${Math.floor(Math.random() * 4) + 1}.mp4`;

    // Respond with the video URL and duration
    res.json({ videoUrl, duration });
  } catch (error) {
    console.error("Error verifying transaction:", error);
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
