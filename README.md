# DeCaVision - Solana Video Streaming PoC

A proof-of-concept for a video streaming service on Solana Testnet. Users pay SOL to stream videos, with duration tied to payment (e.g., 0.1 SOL = 5 mins, 0.3 SOL = 60 mins).

## Structure
- `smart_contract/`: Rust-based Solana program.
- `backend/`: Express.js server for payments and streaming.
- `frontend/`: React app with Phantom Wallet integration.
- `videos/`: Sample video files.

## Setup
1. **Smart Contract**:
   - `cd smart_contract`
   - `anchor init video_streaming` (if not already initialized)
   - `anchor build && anchor deploy`
2. **Backend**:
   - `cd backend`
   - `npm install && npm start`
3. **Frontend**:
   - `cd frontend`
   - `npm install && npm run build`
4. Add videos to `videos/` (e.g., `video1.mp4`).
5. Open `http://localhost:3001`.

## Testnet Setup
- Install Phantom Wallet, switch to Testnet, and request SOL from a faucet.
- Update `PROGRAM_PUBLIC_KEY` in `backend/index.js` and `frontend/src/App.js`.