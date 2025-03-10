const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Solana DEVNET connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const receiverPublicKey = new PublicKey('YOUR_DEVNET_PUBLIC_KEY'); // Same as backend

async function payAndStream(amount) {
  // Assume Phantom wallet is installed
  const provider = window.solana;
  if (!provider) return alert('Please install Phantom wallet');

  await provider.connect();
  const senderPublicKey = provider.publicKey;

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: receiverPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  const { signature } = await provider.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signature);

  // Verify payment and get video details
  const response = await fetch(`http://localhost:3000/pay?signature=${signature}&amount=${amount}`);
  const { videoUrl, duration } = await response.json();

  // Play video
  const video = document.getElementById('videoPlayer');
  video.src = videoUrl;
  video.style.display = 'block';
  video.play();

  // Stop after duration
  setTimeout(() => video.pause(), duration * 1000);
}

// Event listeners
document.getElementById('payButton').addEventListener('click', () => payAndStream(0.1));
document.getElementById('payButton60').addEventListener('click', () => payAndStream(0.3));