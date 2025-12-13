export const BLOCKCHAINS = {
  tron: {
    rpc: 'https://api.trongrid.io',            // Tron FullNode RPC
    usdtContract: 'TXYZ...USDTContract',      // TRC20 USDT контракт
    usddContract: 'TXYZ...USDDContract',      // TRC20 USDD контракт
  },
  ethereum: {
    rpc: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    usdtContract: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // ERC20 USDT
    usdcContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // ERC20 USDC
  },
  bsc: {
    rpc: 'https://bsc-dataseed.binance.org/',
    usdtContract: '0x55d398326f99059fF775485246999027B3197955',
    usdcContract: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  },
  solana: {
    rpc: 'https://api.mainnet-beta.solana.com',
    usdtMint: 'Es9vMFrzaCER...', // USDT SPL Token Mint
    usdcMint: 'Aq4mZ5...',       // USDC SPL Token Mint
  },
  btc: {
    rpc: 'https://btc-mainnet.example.com', // Можно заменить на свой node или API
  },
  ton: {
    rpc: 'https://toncenter.com/api/v2/jsonRPC', // TON RPC endpoint
  },
  // Добавляй другие сети по аналогии
};
