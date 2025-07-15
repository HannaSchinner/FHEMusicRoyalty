# Privacy-Preserving Music Royalty Distribution System

A privacy-preserving music royalty distribution platform built with Fully Homomorphic Encryption (FHE) technology. This system enables music creators to fairly and transparently distribute royalties while protecting the privacy of financial information.

## Overview

This project leverages Fully Homomorphic Encryption to enable confidential on-chain computations for music royalty distribution. Unlike traditional blockchain contracts where all data is publicly visible, FHE allows mathematical operations to be performed on encrypted data without ever decrypting it.

## Key Features

### Privacy Protection
- **FHE Encryption**: Royalty shares and payment amounts encrypted using Zama fhEVM
- **Confidential Computing**: Revenue distribution calculations without exposing specific amounts
- **Selective Decryption**: Only rights holders can decrypt their own payment information

### Rights Management
- **Rights Holder Registration**: Creators, producers, and distributors can register as verified rights holders
- **Track Registration**: On-chain music work registration with metadata storage
- **Flexible Share Allocation**: Configure encrypted royalty shares for each rights holder

### Revenue Distribution
- **Royalty Pool Creation**: Create distribution pools for music tracks
- **Automatic Allocation**: Automatically calculate payments based on encrypted shares
- **Secure Withdrawal**: Rights holders can securely claim their earnings

## Technology Stack

- **Blockchain**: Ethereum-compatible networks
- **Privacy Layer**: Zama fhEVM (Fully Homomorphic Encryption)
- **Development Framework**: Hardhat
- **Smart Contracts**: Solidity 0.8.24
- **Frontend**: Vanilla JavaScript with Ethers.js

## Project Structure

```
privacy-preserving-music-royalty/
├── contracts/
│   └── PrivateMusicRoyalty.sol    # Main FHE-enabled smart contract
├── scripts/
│   ├── deploy.js                   # Deployment script
│   ├── verify.js                   # Contract verification script
│   ├── interact.js                 # Interaction script
│   └── simulate.js                 # Full workflow simulation
├── deployments/                    # Deployment information
├── public/                         # Frontend files
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Project dependencies
└── DEPLOYMENT.md                  # Deployment documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd privacy-preserving-music-royalty
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Edit the `.env` file with your settings:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Run Simulation

```bash
npm run simulate
```

This will run a complete workflow simulation demonstrating:
- Contract deployment
- Rights holder registration and verification
- Track registration with encrypted shares
- Royalty pool creation and distribution
- Privacy-preserving payment claims

## Deployment

### Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

### Deploy to Zama Testnet

```bash
npm run deploy:zama
```

### Verify Contract

```bash
npm run verify:sepolia
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Contract Functions

### Rights Holder Management

- `registerRightsHolder()` - Register as a rights holder
- `verifyRightsHolder(address)` - Verify rights holder (owner only)
- `getRightsHolderInfo(address)` - Get rights holder information

### Track Management

- `registerTrack(metadataURI, holders[], shares[])` - Register track with encrypted shares
- `getTrackInfo(trackId)` - Get track information
- `deactivateTrack(trackId)` - Deactivate a track

### Royalty Distribution

- `createRoyaltyPool(trackId)` - Create royalty pool with ETH
- `distributeRoyalties(poolId)` - Calculate encrypted payments
- `claimRoyalty(poolId)` - Claim individual payment
- `getPoolInfo(poolId)` - Get pool information

## How It Works

### 1. Track Registration
Music tracks are registered with encrypted royalty share percentages for each rights holder. Shares are represented as integers from 0-10000 (representing 0.00% to 100.00%).

### 2. Royalty Pool Creation
When royalties are received, a pool is created containing the total amount to be distributed. This amount is encrypted on-chain.

### 3. Distribution Calculation
The contract performs FHE multiplication to calculate each rights holder's payment:
```
Encrypted Payment = Encrypted Total Amount × Encrypted Share / 10000
```

### 4. Secure Claiming
Rights holders request decryption of their payment amount through Zama's decryption oracle, then claim their funds. Only the intended recipient can decrypt and claim their specific payment.

## Privacy Features

### Encrypted Data Types
- `euint32` - Royalty share percentages
- `euint64` - Payment amounts

### Privacy Guarantees
- Individual share percentages remain encrypted on-chain
- Payment amounts are calculated on encrypted values
- Only rights holders can decrypt their own payments
- Third parties cannot observe distribution details

## Network Information

### Sepolia Testnet
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io

### Zama Testnet
- **Chain ID**: 8009
- **RPC URL**: https://devnet.zama.ai

## Scripts Reference

```bash
npm run compile          # Compile contracts
npm test                 # Run tests
npm run deploy:sepolia  # Deploy to Sepolia
npm run deploy:zama     # Deploy to Zama testnet
npm run verify:sepolia  # Verify on Etherscan
npm run interact:sepolia # Interact with deployment
npm run simulate        # Run full simulation
npm run clean           # Clean artifacts
```

## Security Considerations

### Smart Contract Security
- Comprehensive input validation
- Access control mechanisms
- Proper state management
- Emergency controls

### Privacy Security
- FHE encryption for sensitive data
- Access Control List implementation
- Asynchronous decryption mechanism
- Secure key management

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License

## Disclaimer

This is a demonstration project showcasing FHE technology for privacy-preserving music royalty distribution. Conduct thorough security audits before using in production environments.

## Resources

- [Zama Documentation](https://docs.zama.ai)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Documentation](https://ethereum.org/developers)

**Built with Zama FHE Technology**
