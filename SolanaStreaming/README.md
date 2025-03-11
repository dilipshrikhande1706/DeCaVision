
# Solana Video Streaming

A simple web application that allows users to pay with SOL on the Solana Devnet to stream a video for a specified duration. The project uses Solana's `SystemProgram.transfer` for payments, `@solana/web3.js` for blockchain interactions, and Express.js to serve the frontend and handle payment verification.

## Features
- Pay 0.1 SOL to stream a video for 1 minute.
- Pay 0.5 SOL to stream a video for 5 minutes.
- Frontend built with HTML/CSS/JavaScript.
- Backend powered by Node.js and Express.js.
- Solana Devnet integration with Phantom Wallet for payments.

## Project Structure
```
SolanaStreaming/
├── backend/
│   ├── node_modules/
│   ├── package.json
│   └── server.js
├── public/
│   ├── videos/
│   │   └── video1.mp4
│   ├── index.html
│   └── script.js
└── README.md
```

- `backend/`: Contains the Node.js server (`server.js`) and dependencies.
- `public/`: Serves static files, including the frontend (`index.html`, `script.js`) and videos (`videos/video1.mp4`).
- `README.md`: This file.

## Prerequisites
To run this project, you'll need the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or later recommended; tested with v23.7.0).
- [npm](https://www.npmjs.com/) (comes with Node.js).
- A browser with the [Phantom Wallet](https://phantom.app/) extension installed.
- A test video file (e.g., `video1.mp4`) in `.mp4` format (H.264 recommended for browser compatibility).

## Setup Instructions

### 1. Clone the Repository
Clone or download this project to your local machine:
```bash
git clone <repository-url>
cd SolanaStreaming
```
If you don’t have a repository, you can manually create the directory structure and copy the files (`server.js`, `script.js`, `index.html`, `video1.mp4`) into their respective locations.

### 2. Install Backend Dependencies
Navigate to the `backend` directory and install the required Node.js packages:
```bash
cd backend
npm install express @solana/web3.js bs58
```
- `express`: For the server and serving static files.
- `@solana/web3.js`: For Solana blockchain interactions.
- `bs58`: For decoding base58-encoded instruction data.

### 3. Prepare the Video File
Place a video file named `video1.mp4` in the `public/videos` directory:
```bash
mkdir -p public/videos
cp /path/to/your/video.mp4 public/videos/video1.mp4
```
- Ensure `video1.mp4` is a valid `.mp4` file (H.264 codec recommended).
- If you use a different filename, update `server.js` to reflect the new path in the `videoUrl` variable (e.g., `const videoUrl = '/videos/your-video.mp4';`).

### 4. Fund Your Phantom Wallet (Devnet)
- Open your browser and ensure the Phantom Wallet extension is installed.
- Switch Phantom to **Devnet** mode (Settings > Network > Devnet).
- Fund your wallet with Devnet SOL (free SOL - by airdropping them):
  - Visit [Solana Faucet](https://faucet.solana.com/).
  - Enter your Phantom wallet’s public key and request 1-2 SOL.
- Verify your wallet has funds (you’ll see 1-2 SOL in Devnet balance).

### 5. Start the Server
Run the backend server:
```bash
cd backend
node server.js
```
- The server will start on `http://localhost:3000`.
- You should see: `Server is running on http://localhost:3000`.

### 6. Access the Application
- Open your browser (with Phantom Wallet installed).
- Navigate to `http://localhost:3000`.
- You’ll see two buttons: "Pay 0.1 SOL for 1 min" and "Pay 0.5 SOL for 5 mins".
- Click a button to initiate a payment via Phantom Wallet.
- Approve the transaction in Phantom.
- If successful, the video (`video1.mp4`) will play for the specified duration (1 or 5 minutes).

## Files Overview

### `backend/server.js`
The backend server handles payment verification and serves the frontend:
- Listens on port `3000`.
- Serves static files from the `public` directory.
- Verifies Solana transactions via the `/pay` endpoint.
- Returns a video URL and duration upon successful payment.

### `public/index.html`
The frontend UI:
- Displays two payment buttons.
- Includes a video player (`<video>` element).
- Loads `script.js` for payment logic.

### `public/script.js`
Handles client-side logic:
- Connects to Phantom Wallet.
- Creates and sends a Solana transaction for payment.
- Fetches the video URL from the server after confirmation.
- Plays the video for the specified duration.

### `public/videos/video1.mp4`
The video file served to the client after payment.

## Troubleshooting
- **Transaction Fails or Times Out**:
  - Ensure Phantom Wallet is on Devnet and has sufficient SOL.
  - Check the Solana Explorer (https://explorer.solana.com/?cluster=devnet) with your transaction signature for details.
  - If devnet is slow, transactions may take longer—wait a bit and retry.
- **404 Error for Video**:
  - Verify `video1.mp4` is in `public/videos`.
  - Check the file path: `http://localhost:3000/videos/video1.mp4` should return the video.
- **Video Doesn’t Play**:
  - Ensure `video1.mp4` is a valid `.mp4` file with H.264 encoding (test it in your browser directly).
- **Server Errors**:
  - Check the terminal logs for errors.
  - Ensure all dependencies are installed (`npm install` in `backend`).

## Known Limitations
- Only supports Devnet; for Mainnet, update the connection URL in `server.js` and `script.js` to `https://api.mainnet-beta.solana.com`.
- Hardcoded receiver public key (`Bj15jk2AUmGtTsFrBKpZcoVAxtjWQBQs2wCfjSe6fXkn`). Replace it with your own in both `server.js` and `script.js` if needed.
- Single video (`video1.mp4`). Add more videos and update logic in `server.js` to support multiple files.

## Future Improvements
- Add error handling for video format issues.
- Support multiple videos with dynamic selection.
- Implement Mainnet compatibility with proper fee handling.
- Add user authentication for secure access.

## License
This project is for educational purposes. Feel free to modify and distribute as needed.

---

### For Your Reference
Here are the exact file paths and setup commands for your machine (already done):
- Video file: `/Users/dilipshrikhande/Documents/DeCaVision/SolanaStreaming/public/videos/video1.mp4`
- Backend: `/Users/dilipshrikhande/Documents/DeCaVision/SolanaStreaming/backend`
- Start command: `cd /Users/dilipshrikhande/Documents/DeCaVision/SolanaStreaming/backend && node server.js`

 In order to run this, adjust paths based on your local setup, but the instructions above should work universally. 