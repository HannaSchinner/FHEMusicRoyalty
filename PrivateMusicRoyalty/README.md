# 🎵 Private Music Royalty Distribution System

A privacy-preserving music royalty distribution platform built on Zama FHE (Fully Homomorphic Encryption) technology. This system enables music creators to fairly and transparently distribute copyright revenue while protecting the privacy of revenue information.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://private-music-royalty.vercel.app/)
[![GitHub](https://img.shields.io/badge/github-repository-blue)](https://github.com/HannaSchinner/PrivateMusicRoyalty)

---

## 🎯 Core Concepts

### FHE Smart Contract Technology

This project leverages **Fully Homomorphic Encryption (FHE)** provided by Zama's fhEVM to enable confidential on-chain computations. Unlike traditional blockchain contracts where all data is publicly visible, FHE allows mathematical operations to be performed on encrypted data without ever decrypting it.

**Key FHE Features:**
- **Encrypted State Variables**: Revenue shares and payment amounts are stored as encrypted integers (`euint32`, `euint64`)
- **Confidential Computation**: Calculate royalty distributions without exposing individual share percentages
- **Privacy Preservation**: Only rights holders can decrypt and view their own payment information
- **On-Chain Privacy**: Maintain blockchain transparency while protecting sensitive financial data

### Confidential Music Revenue Distribution

Traditional music royalty systems expose sensitive financial information to all parties. Our system introduces **confidential revenue distribution** where:

1. **Private Share Allocation**: Each rights holder's percentage share is encrypted on-chain
2. **Hidden Revenue Amounts**: Total pool amounts are visible, but individual payouts remain private
3. **Verifiable Fairness**: Mathematical correctness is guaranteed without revealing private data
4. **Selective Disclosure**: Rights holders can prove their share without exposing exact amounts

**How It Works:**
```
Music Track Registration → Encrypted Shares (euint32)
     ↓
Royalty Pool Creation → Encrypted Total Amount (euint64)
     ↓
Distribution Calculation → FHE Multiplication & Division
     ↓
Private Claims → Decryption Oracle → Individual Payments
```

---

## ✨ Key Features

### 🔐 Privacy Protection
- **FHE Encryption**: Copyright shares and revenue amounts are encrypted using Zama fhEVM
- **Confidential Computing**: Revenue distribution calculations without exposing specific amounts
- **Selective Decryption**: Only rights holders can decrypt their own revenue shares

### 🎼 Music Rights Management
- **Rights Holder Registration**: Creators, producers, and distributors can register as rights holders
- **Track Registration**: On-chain music work registration with metadata storage
- **Flexible Share Allocation**: Configure encrypted copyright shares for each rights holder

### 💰 Revenue Distribution
- **Royalty Pool Creation**: Create distribution pools for each music track
- **Automatic Allocation**: Automatically calculate rights holder payments based on encrypted shares
- **Secure Withdrawal**: Rights holders can securely claim their earnings

### 🔒 Security Mechanisms
- **Rights Holder Verification**: Identity verification required before operations
- **Encrypted Shares**: Copyright shares encrypted with FHE technology
- **Asynchronous Decryption**: Zama's async decryption oracle ensures security

---

## 🏗️ Technical Architecture

### Smart Contract Structure
```
contracts/
└── PrivateMusicRoyalty.sol    # Main FHE-enabled smart contract
    ├── Rights Holder Management
    ├── Track Registration
    ├── Royalty Pool Management
    └── Distribution & Claims
```

### Technology Stack
- **Blockchain**: Ethereum-compatible networks
- **Privacy Layer**: Zama fhEVM (Fully Homomorphic Encryption)
- **Frontend**: Vanilla JavaScript + Ethers.js
- **Development**: Hardhat + Solidity 0.8.24

### FHE Integration
- **TFHE Library**: Encrypted integer operations (euint32, euint64)
- **Access Control List (ACL)**: Manage encrypted data permissions
- **Decryption Oracle**: Secure asynchronous decryption service
- **KMS Verifier**: Key management system for encryption keys

---

## 📋 Contract Details

### Deployed Contract Address
```
0xB6082579c37D6974EcFfB87d29309eDB80f8bC90
```

### Main Contract Functions

#### Rights Holder Management
- `registerRightsHolder()` - Register as a rights holder
- `verifyRightsHolder(address holder)` - Verify rights holder identity (admin only)
- `getRightsHolderInfo(address holder)` - Get rights holder information

#### Track Management
- `registerTrack(string metadataURI, address[] holders, uint32[] shares)` - Register music track with encrypted shares
- `getTrackInfo(uint256 trackId)` - Get track information
- `isRightsHolder(uint256 trackId, address holder)` - Check if address is a rights holder for track

#### Royalty Distribution
- `createRoyaltyPool(uint256 trackId)` - Create royalty pool with ETH payment
- `distributeRoyalties(uint256 poolId)` - Calculate and distribute encrypted payments
- `claimRoyalty(uint256 poolId)` - Claim individual royalty payment
- `getPoolInfo(uint256 poolId)` - Get pool information

---

## 🎬 Demo & Resources

### 🌐 Live Application
**Access the live demo:** [https://private-music-royalty.vercel.app/](https://private-music-royalty.vercel.app/)

### 📹 Demo Video
Watch the full demonstration of the Private Music Royalty Distribution System:

[![Demo Video](/PrivateMusicRoyalty.mp4)

**Video Contents:**
- System overview and features
- Wallet connection and rights holder registration
- Music track registration with multiple rights holders
- Creating royalty pools and distributing payments
- Claiming private royalty earnings

### 📸 On-Chain Transaction Screenshots

PrivateMusicRoyalty.png
## 📱 User Guide

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve connection in MetaMask

### 2. Register as Rights Holder
- Navigate to "Register Rights Holder" tab
- Click "Register Rights Holder" button
- Wait for admin verification

### 3. Register Music Track
- Go to "Register Track" tab
- Enter music metadata URI
- Add rights holder addresses and their corresponding shares
- Ensure total shares equal 10000 (representing 100%)
- Click "Register Track"

### 4. Create Royalty Pool
- Navigate to "Create Pool" tab
- Select the track ID for revenue distribution
- Enter the amount of ETH to distribute
- Click "Create Pool"

### 5. Distribute & Claim Royalties
- Go to "Claim Royalty" tab
- First click "Distribute Royalties" to calculate payments
- Then click "Claim My Royalty" to withdraw your share

---

## 🔐 Privacy Protection Mechanism

### FHE Encryption Details

**Encrypted Data Types:**
- `euint32` - Copyright share percentages (0-10000)
- `euint64` - Revenue amounts and individual payments

**Privacy Features:**
- Shares are encrypted during track registration
- Payments are calculated on encrypted values
- Only the recipient can decrypt their payment amount
- Blockchain observers cannot see individual shares or payments

### Access Control

**Permission Model:**
- Rights holders can only decrypt their own payments
- Contract has permission to perform FHE operations
- ACL (Access Control List) manages encryption permissions
- Decryption oracle provides secure async decryption

---

## 🌐 Network Information

### Supported Networks
- **Ethereum Sepolia Testnet** - Testing and development
- **Zama Testnet** - FHE-enabled testnet (recommended)
- **Local Hardhat Network** - Local development

### Zama Testnet Configuration
```
Network Name: Zama Testnet
RPC URL: https://devnet.zama.ai
Chain ID: 8009
Currency Symbol: ZAMA
```

---

## 🛡️ Security Considerations

### Smart Contract Security
- Built with OpenZeppelin standards
- Comprehensive input validation
- Reentrancy attack protection
- Emergency pause functionality

### Privacy Security
- FHE encryption for sensitive data
- Access Control List (ACL) implementation
- Asynchronous decryption mechanism
- Key management through KMS

### Operational Security
- Rights holder identity verification
- Share allocation validation
- Pool state management
- Claim authorization checks

---

## 🔗 Important Links

- **Live Demo**: [https://private-music-royalty.vercel.app/](https://private-music-royalty.vercel.app/)
- **GitHub Repository**: [https://github.com/HannaSchinner/PrivateMusicRoyalty](https://github.com/HannaSchinner/PrivateMusicRoyalty)
- **Contract Address**: `0xB6082579c37D6974EcFfB87d29309eDB80f8bC90`
- **Zama Documentation**: [https://docs.zama.ai](https://docs.zama.ai)

---

## 📊 System Statistics

The application provides real-time statistics:
- Total registered music tracks
- Total royalty pools created
- Contract address and network information
- Individual rights holder status

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## 📄 License

MIT License

---

## ⚠️ Disclaimer

This is a demonstration project showcasing FHE technology for privacy-preserving music royalty distribution. Please conduct thorough security audits before using in production environments.

---

**Built with ❤️ using Zama FHE Technology**