const express = require('express');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001; // Changed to 3001 to avoid conflicts
const connection = new Connection('https://api.devnet.solana.com', 'confirmed'); // Devnet connection
const PROGRAM_PUBLIC_KEY = new PublicKey('YOUR_PROGRAM_ID_HERE'); // Replace with your deployed Program ID

app.use(express.json());
app.use(express.static('../frontend/build')); // Serve React frontend

// Default route (optional, for testing)
app.get('/', (req, res) => {
  res.send('DeCaVision Backend Running');
});

// Verify payment and return streaming duration
app.post('/api/verify-payment', async (req, res) => {
  const { transactionSignature } = req.body;
  try {
    const tx = await connection.getParsedTransaction(transactionSignature);
    if (!tx || tx.meta.err) {
      return res.status(400).json({ success: false, message: 'Transaction failed or not found' });
    }

    // Check if the transaction involves the program
    const receiverAccount = tx.transaction.message.accountKeys.find(
      key => key.pubkey.toBase58() === PROGRAM_PUBLIC_KEY.toBase58()
    );
    if (!receiverAccount) {
      return res.status(400).json({ success: false, message: 'Invalid receiver' });
    }

    const amount = tx.meta.postBalances[receiverAccount.index] - tx.meta.preBalances[receiverAccount.index];
    const solAmount = amount / LAMPORTS_PER_SOL;

    // Payment-to-duration mapping (configurable)
    const PAYMENT_MAP = {
      0.1: 5 * 60,   // 5 mins in seconds
      0.3: 60 * 60   // 60 mins in seconds
    };

    const duration = PAYMENT_MAP[solAmount];
    if (duration) {
      res.json({ success: true, duration });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Stream video endpoint
app.get('/api/stream/:videoId', (req, res) => {
  const videoId = req.params.videoId;
  const videoPath = path.join(__dirname, '../videos', `video${videoId}.mp4`);

  if (!fs.existsSync(videoPath)) {
    return res.status(404).send('Video not found');
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});