(async () => {
  if (typeof window.Buffer === "undefined") {
    const bufferModule = await import("https://cdn.jsdelivr.net/npm/buffer@6.0.3/+esm");
    window.Buffer = bufferModule.Buffer;
    console.log("Buffer polyfill loaded.");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded!");
  console.log("Buffer is defined:", typeof window.Buffer !== "undefined");

  if (typeof solanaWeb3 === "undefined") {
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

      const connection = new solanaWeb3.Connection("https://api.devnet.solana.com", "confirmed");
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const transaction = new solanaWeb3.Transaction({
        recentBlockhash: blockhash,
        feePayer: senderPublicKey,
      });

      // Add compute budget to prioritize the transaction
      transaction.add(solanaWeb3.ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }));
      transaction.add(solanaWeb3.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 }));

      transaction.add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: new solanaWeb3.PublicKey("Bj15jk2AUmGtTsFrBKpZcoVAxtjWQBQs2wCfjSe6fXkn"),
          lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
        })
      );

      console.log("Transaction created:", transaction);
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      console.log(`Transaction sent! Signature: ${signature}`);

      // Confirm transaction with block height strategy
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");

      if (confirmation.value.err) {
        throw new Error("Transaction confirmation failed: " + JSON.stringify(confirmation.value.err));
      }
      console.log("Transaction confirmed!");

      const response = await fetch(`http://localhost:3000/pay?signature=${signature}&amount=${amount}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }
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
      alert("Transaction failed. Please try again. Details: " + error.message);
    }
  }

  payButton5.addEventListener("click", () => {
    console.log("Button for 0.1 SOL clicked");
    payAndStream(0.1);
  });

  payButton60.addEventListener("click", () => {
    console.log("Button for 0.5 SOL clicked");
    payAndStream(0.5);
  });

  console.log("Event listeners added.");
});