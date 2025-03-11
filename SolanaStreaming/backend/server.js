const express = require('express');
const path = require('path');
const { Connection, PublicKey, SystemProgram } = require('@solana/web3.js');
const bs58 = require('bs58'); // Now resolves to bs58@4.0.1
const app = express();
const PORT = 3000;

const LAMPORTS_PER_SOL = 1000000000;
const paymentTiers = {
  0.1: 60,  // 0.1 SOL -> 60 seconds
  0.5: 300, // 0.5 SOL -> 300 seconds
  1: 600    // 1 SOL -> 600 seconds
};

const EXPECTED_RECEIVER = new PublicKey("Bj15jk2AUmGtTsFrBKpZcoVAxtjWQBQs2wCfjSe6fXkn");

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.send('Welcome to the Solana Streaming API! Use /pay for payment verification.');
});

app.get('/pay', async (req, res) => {
  const { signature, amount } = req.query;

  console.log("Received signature:", signature);
  console.log("Received amount:", amount);

  if (!signature || !amount) {
    return res.status(400).json({ error: 'Missing required parameters: signature and amount' });
  }

  try {
    const solAmount = parseFloat(amount);
    if (isNaN(solAmount)) {
      return res.status(400).json({ error: 'Invalid amount format' });
    }

    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    console.log("Transaction details:", JSON.stringify(tx, null, 2));

    const instructions = tx.transaction.message.instructions;
    if (!instructions || instructions.length === 0) {
      return res.status(400).json({ error: 'No instructions found in transaction' });
    }

    instructions.forEach((instr, index) => {
      console.log(`Instruction ${index}: programIdIndex = ${instr.programIdIndex}, programId = ${tx.transaction.message.accountKeys[instr.programIdIndex].toString()}`);
    });

    const transferInstruction = instructions.find((instr) => {
      const programId = tx.transaction.message.accountKeys[instr.programIdIndex];
      return programId && programId.equals(SystemProgram.programId);
    });

    if (!transferInstruction) {
      return res.status(400).json({ error: 'No valid SystemProgram.transfer instruction found' });
    }

    let parsedData = transferInstruction.data;
    if (!parsedData || (typeof parsedData === 'string' && parsedData.length === 0)) {
      return res.status(400).json({ error: 'Invalid instruction data' });
    }

    // Convert string to Buffer using bs58
    if (typeof parsedData === 'string') {
      console.log("Converting string data to Buffer:", parsedData);
      if (typeof bs58.decode !== 'function') {
        console.error("bs58.decode is not a function. bs58 export:", bs58);
        throw new Error("bs58 library is not correctly imported");
      }
      parsedData = Buffer.from(bs58.decode(parsedData));
    }

    if (!Buffer.isBuffer(parsedData) || parsedData.length < 12) {
      console.error("parsedData is not a valid Buffer:", typeof parsedData, parsedData);
      return res.status(500).json({ error: 'Invalid data format for parsing lamports' });
    }

    const lamports = parsedData.readBigUInt64LE(4);
    const solAmountFromTx = Number(lamports) / LAMPORTS_PER_SOL;

    const toPubkeyIndex = transferInstruction.accounts[1];
    const toPubkey = tx.transaction.message.accountKeys[toPubkeyIndex];
    if (!toPubkey.equals(EXPECTED_RECEIVER)) {
      return res.status(400).json({
        error: 'Invalid receiver address',
        receivedReceiver: toPubkey.toString(),
        expectedReceiver: EXPECTED_RECEIVER.toString()
      });
    }

    if (!paymentTiers[solAmountFromTx] || solAmountFromTx !== solAmount) {
      return res.status(400).json({
        error: 'Invalid payment amount',
        receivedAmount: solAmountFromTx,
        expectedAmounts: Object.keys(paymentTiers),
      });
    }

    const duration = paymentTiers[solAmountFromTx];
    const videoUrl = '/videos/video1.mp4';

    res.json({ videoUrl, duration });
  } catch (error) {
    console.error("Error verifying transaction:", error);
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});