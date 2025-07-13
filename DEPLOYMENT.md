# Deployment Guide

This guide provides comprehensive instructions for deploying and managing the Privacy-Preserving Music Royalty smart contract.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Compilation](#compilation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Verification](#verification)
- [Network Information](#network-information)

## Prerequisites

Before deploying the contract, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Git

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
REPORT_GAS=false
```

**Security Warning**: Never commit your `.env` file to version control.

## Compilation

Compile the smart contracts:

```bash
npm run compile
```

## Testing

Run the test suite:

```bash
npm test
```

## Deployment

### Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

### Deploy to Zama Testnet

```bash
npm run deploy:zama
```

### Deployment Output

The deployment information is saved in `deployments/[network]-deployment.json`.

## Verification

### Verify on Etherscan (Sepolia)

```bash
npm run verify:sepolia
```

## Network Information

### Sepolia Testnet

- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

### Zama Testnet

- **Chain ID**: 8009
- **RPC URL**: https://devnet.zama.ai

## Contract Features

The contract uses Fully Homomorphic Encryption (FHE) for privacy-preserving royalty distribution.

## Scripts Reference

```bash
npm run compile          # Compile contracts
npm test                 # Run tests
npm run deploy:sepolia  # Deploy to Sepolia
npm run verify:sepolia  # Verify on Etherscan
npm run interact:sepolia # Interact with deployment
npm run simulate        # Run simulation
```

**Contract Version**: 1.0.0  
**Solidity Version**: 0.8.24
