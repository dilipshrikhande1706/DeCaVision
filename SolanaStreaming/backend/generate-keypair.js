const { Keypair } = require('@solana/web3.js'); const keypair = Keypair.generate(); console.log('Receiver Public Key:', keypair.publicKey.toString());
