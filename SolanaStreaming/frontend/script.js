document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded!");

  // Ensure solanaWeb3 is properly loaded from the browser
  const solanaWeb3 = window.solanaWeb3js?.default || window.solanaWeb3 || window.web3;

  if (!solanaWeb3) {
    console.error("Solana Web3.js is not loaded. Check your script import.");
    return;
  }

  const payButton5 = document.getElementById("payButton5");
  const payButton60 = document.getElementById("payButton60");
  const videoPlayer = document.getElementById("videoPlayer");

  async function payAndStream(amount) {
    console.log(`Attempting to pay ${amount} SOL...`);

    if (!window.solana || !window.solana.isPhantom) {
      alert("Please install Phantom Wallet");
      return;
    }

    try {
      await window.solana.connect();
      const senderPublicKey = window.solana.publicKey;
      console.log(`Connected to Phantom: ${senderPublicKey.toString()}`);

      // FIX: Ensure solanaWeb3 is being accessed correctly
      const transaction = new solanaWeb3.Transaction();
      transaction.add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: new solanaWeb3.PublicKey("2FBMXoq7f7Ky2uYEsEMaDuWEyRpUWKM7fMtpYGHV3ufw"),
          lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
        })
      );

      console.log("Transaction created:", transaction);

      const { signature } = await window.solana.signAndSendTransaction(transaction);
      console.log(`Transaction sent! Signature: ${signature}`);

      const response = await fetch(`http://localhost:3000/pay?signature=${signature}&amount=${amount}`);
      const data = await response.json();

      if (!data.videoUrl) {
        console.error("Error: No video URL received", data);
        alert("Payment successful, but failed to load video.");
        return;
      }

      videoPlayer.src = data.videoUrl;
      videoPlayer.style.display = "block";
      videoPlayer.play();
      setTimeout(() => videoPlayer.pause(), data.duration * 1000);

      console.log("Video started playing...");
    } catch (error) {
      console.error("Payment or video error:", error);
      alert("Transaction failed. Please try again.");
    }
  }

  payButton5.addEventListener("click", () => {
    console.log("Button for 0.1 SOL clicked");
    payAndStream(0.1);
  });

  payButton60.addEventListener("click", () => {
    console.log("Button for 0.3 SOL clicked");
    payAndStream(0.3);
  });

  console.log("Event listeners added.");
});
