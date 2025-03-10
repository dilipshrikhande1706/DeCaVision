const express = require('express');
const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const path = require('path'); // Add this for file paths
const app = express();
const port = 3000;

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const receiverPublicKey = new PublicKey('2FBMXoq7f7Ky2uYEsEMaDuWEyRpUWKM7fMtpYGHV3ufw');

const paymentTiers = {
  0.1: 5 * 60,
  0.3: 60 * 60
};

// Serve static video files
app.use('/videos', express.static('../videos'));

// Serve frontend folder
app.use(express.static('../frontend')); // Add this line
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html')); // Serve index.html at root
});

// Payment verification endpoint
app.get('/pay', async (req, res) => {
  const { signature, amount } = req.query;
  try {
    const tx = await connection.getTransaction(signature, { commitment: 'confirmed' });
    if (!tx) return res.status(400).json({ error: 'Transaction not found' });

    const paymentAmount = tx.meta.postBalances[1] - tx.meta.preBalances[1];
    const solAmount = paymentAmount / LAMPORTS_PER_SOL;

    if (!paymentTiers[solAmount]) return res.status(400).json({ error: 'Invalid payment amount' });

    const duration = paymentTiers[solAmount];
    const videoUrl = `/videos/video${Math.floor(Math.random() * 4) + 1}.mp4`;
    res.json({ videoUrl, duration });
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));