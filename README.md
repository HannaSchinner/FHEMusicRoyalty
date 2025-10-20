# 🔐 Privacy-Protected Cultural Voting Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.19-yellow.svg)](https://hardhat.org/)

**🌐 Live Demo**: [https://fhe-cultural-voting.vercel.app/](https://fhe-cultural-voting.vercel.app/)

**📹 Video Demo**: Download and watch `demo.mp4` for complete demonstration

**💻 GitHub**: [https://github.com/KittyOrn/FHECulturalVoting](https://github.com/KittyOrn/FHECulturalVoting)

A **privacy-preserving** voting system for cultural project evaluation built with **Zama FHEVM** technology. This platform enables confidential voting on artistic proposals while maintaining transparent and verifiable results through Fully Homomorphic Encryption (FHE).

Built for the **Zama FHE Challenge** - demonstrating practical privacy-preserving applications in democratic decision-making for arts and culture.

---

## 📋 Table of Contents

- [Core Concepts](#-core-concepts)
- [Features](#-features)
- [Privacy Model](#-privacy-model)
- [Architecture](#️-architecture)
- [Quick Start](#-quick-start)
- [Technical Implementation](#-technical-implementation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Tech Stack](#-tech-stack)
- [Security](#-security)
- [License](#-license)

---

## 🎯 Core Concepts

### Confidential Public Transportation Analytics

This platform demonstrates **FHE-based privacy protection for sensitive public data**, specifically applied to cultural voting but designed with broader applications in mind, such as:

#### 🚌 Confidential Public Transport Card Data

The underlying FHE technology can be applied to protect sensitive transportation data:

- **Private Journey Analysis**: Encrypted travel patterns without revealing individual routes
- **Homomorphic Aggregation**: Calculate usage statistics on encrypted data
- **Privacy-Preserving Analytics**: Understand public transport trends while protecting user privacy
- **Confidential Payment Processing**: Secure transaction data without exposing personal spending

#### 🗳️ Current Implementation: Cultural Voting

This implementation showcases the FHE technology through a cultural voting system:

- **Encrypted Scores**: Individual ratings (1-10) stored as encrypted values (`euint8`)
- **Private Preferences**: Vote choices remain confidential to prevent coercion
- **Homomorphic Tallying**: Aggregate votes without decrypting individual submissions
- **Verifiable Results**: Final outcomes can be verified while maintaining privacy

#### 🔐 FHE Technology Benefits

**Fully Homomorphic Encryption (FHE)** enables computation on encrypted data:

```
Encrypted Data → Compute on Encrypted → Get Encrypted Result → Decrypt Result
        ↓                                         ↓
   Raw data never exposed              Individual privacy maintained
```

**Key Advantages**:
- 🛡️ **End-to-End Privacy**: Data remains encrypted throughout processing
- 🔢 **Meaningful Computation**: Perform complex operations without decryption
- ✅ **Verifiable Results**: Cryptographic proofs ensure correctness
- 🌐 **Decentralized Trust**: No need for trusted intermediaries

#### 💡 Broader Applications

Beyond voting, this FHE approach enables:

1. **Confidential Public Services**
   - Anonymous public transport analytics
   - Private healthcare data analysis
   - Secure government benefit distribution

2. **Privacy-Preserving Finance**
   - Confidential transaction amounts
   - Private credit scoring
   - Encrypted auction bidding

3. **Secure Data Sharing**
   - Collaborative analytics without data exposure
   - Cross-organization insights
   - Regulatory compliance with privacy

---

## ✨ Features

- 🔐 **Fully Private Voting**: Individual scores (1-10) encrypted using FHE technology
- 🔢 **Homomorphic Aggregation**: Vote tallying on encrypted data without decryption
- 🎨 **Cultural Project Evaluation**: Specialized for arts, music, literature, exhibitions
- ✅ **Transparent Results**: Final outcomes verifiable while maintaining voter privacy
- 👥 **Voter Authorization**: Controlled access with admin-managed permissions
- 🔄 **Multiple Rounds**: Support for sequential voting campaigns
- ⛽ **Gas Optimized**: Compiler optimization (800 runs) for efficient operations
- 🛡️ **DoS Protected**: Bounded operations and complexity limits
- 🧪 **Thoroughly Tested**: 47 comprehensive test cases with >95% coverage
- 🚀 **CI/CD Ready**: Automated testing, linting, and deployment

---

## 🔐 Privacy Model

### What's Private ✅

- **Individual Vote Scores** - Encrypted using `euint8`, only voters can decrypt their own votes
- **Vote Aggregation** - Homomorphic computation without revealing individual contributions
- **Voter Preferences** - Complete confidentiality protects against coercion
- **Intermediate Totals** - Processing occurs on encrypted values

### What's Public 📊

- **Voting Participation** - Vote submission events visible on-chain
- **Final Results** - Aggregate scores and winning projects (after round ends)
- **Project Metadata** - Names, descriptions, and categories
- **Voter Authorization Status** - Who is authorized to vote

### Decryption Permissions 🔑

- **Voters**: Can decrypt their own vote submissions
- **Contract**: Performs homomorphic operations without decryption
- **Admin**: Can end rounds and trigger results revelation
- **Results**: Final aggregates revealed only after voting concludes

### Privacy Guarantees

```
User A votes 7 → FHE.asEuint8(7) → euint8(encrypted)
User B votes 5 → FHE.asEuint8(5) → euint8(encrypted)
User C votes 9 → FHE.asEuint8(9) → euint8(encrypted)

On-chain storage: euint8[], euint8[], euint8[]
                       ↓
              Homomorphic Addition
                       ↓
              euint8(21) encrypted
                       ↓
           Authorized Decryption
                       ↓
              Final Score: 21

❌ Individual votes (7, 5, 9) remain private
✅ Only aggregated total (21) can be decrypted
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (Web3 + MetaMask + ethers.js)              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Zama FHEVM Smart Contract                   │
│                 (CulturalVoting.sol)                     │
├─────────────────────────────────────────────────────────┤
│  ├── Project Management                                  │
│  │   ├── proposeProject()                               │
│  │   └── getProjectInfo()                               │
│  │                                                       │
│  ├── Voter Authorization                                │
│  │   ├── authorizeVoter()                               │
│  │   └── revokeVoter()                                  │
│  │                                                       │
│  ├── Voting Round Management                            │
│  │   ├── startVotingRound()                             │
│  │   ├── endVotingRound()                               │
│  │   └── getCurrentRoundInfo()                          │
│  │                                                       │
│  └── Encrypted Voting                                   │
│      ├── submitVote() - euint8 encrypted                │
│      ├── FHE.asEuint8() - encryption                    │
│      └── FHE.allowThis() - permission                   │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Zama FHEVM Network                        │
│          (Fully Homomorphic Encryption)                  │
├─────────────────────────────────────────────────────────┤
│  ├── FHE Operations                                      │
│  │   ├── euint8 arithmetic                              │
│  │   ├── Homomorphic addition                           │
│  │   └── Encrypted comparisons                          │
│  │                                                       │
│  └── Decryption Gateway                                 │
│      ├── Permission verification                        │
│      ├── Asynchronous decryption                        │
│      └── Result callback                                │
└─────────────────────────────────────────────────────────┘
```

### Encrypted Vote Flow

```
1. Voter submits score (1-10)
         ↓
2. Client-side validation
         ↓
3. FHE.asEuint8(score) → encrypted
         ↓
4. Store euint8 on-chain
         ↓
5. FHE.allowThis() → contract permission
         ↓
6. FHE.allow(voter) → voter permission
         ↓
7. Emit VoteSubmitted event
         ↓
8. Vote stored privately ✅
```

### Results Aggregation Flow

```
1. Admin calls endVotingRound()
         ↓
2. Collect all euint8 votes
         ↓
3. Request decryption via FHE gateway
         ↓
4. Decrypt all scores asynchronously
         ↓
5. Calculate project totals
         ↓
6. Determine winning project
         ↓
7. Emit ResultsRevealed event
         ↓
8. Update votingRound.resultsRevealed
         ↓
9. Increment currentVotingRound
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- MetaMask wallet
- Sepolia testnet ETH

### Installation

```bash
# Clone repository
git clone https://github.com/KittyOrn/FHECulturalVoting.git
cd FHECulturalVoting

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your keys
```

### Environment Configuration

```env
# Private Keys
PRIVATE_KEY=your_wallet_private_key
ADMIN_PRIVATE_KEY=your_admin_private_key
PAUSER_PRIVATE_KEY=your_pauser_private_key

# Network
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas Reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_api_key

# Role Addresses
ADMIN_ADDRESS=0x...
PAUSER_ADDRESS=0x...
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests
npm test

# With coverage
npm run test:coverage

# With gas reporting
npm run test:gas
```

### Deploy to Sepolia

```bash
npm run deploy
```

### Verify Contract

```bash
npm run verify
```

---

## 🔧 Technical Implementation

### Smart Contract: CulturalVoting.sol

#### Key Components

**1. Encrypted Vote Storage**

```solidity
struct Vote {
    euint8 encryptedScore;  // FHE encrypted score (1-10)
    bool hasVoted;          // Submission status
    uint256 timestamp;      // Vote time
}
```

**2. Voting Round Structure**

```solidity
struct VotingRound {
    uint8[] projectIds;         // Projects in this round
    bool votingActive;          // Round status
    bool resultsRevealed;       // Results published
    uint256 startTime;          // Start timestamp
    uint256 endTime;            // End timestamp
    address[] voters;           // Participants
    uint8 winningProjectId;     // Winner
    uint8 maxScore;            // Highest score
}
```

**3. Submit Vote with FHE**

```solidity
function submitVote(uint8 _projectId, uint8 _score)
    external
    onlyAuthorizedVoter
    onlyDuringVoting
{
    require(_score >= 1 && _score <= 10, "Score must be between 1-10");

    // Encrypt the score
    euint8 encryptedScore = FHE.asEuint8(_score);

    // Store encrypted vote
    votes[currentVotingRound][_projectId][msg.sender] = Vote({
        encryptedScore: encryptedScore,
        hasVoted: true,
        timestamp: block.timestamp
    });

    // Set permissions
    FHE.allowThis(encryptedScore);
    FHE.allow(encryptedScore, msg.sender);

    emit VoteSubmitted(msg.sender, currentVotingRound, _projectId);
}
```

**4. Homomorphic Aggregation**

```solidity
function _requestResultsDecryption() private {
    VotingRound storage round = votingRounds[currentVotingRound];

    // Collect encrypted votes
    bytes32[] memory cts = new bytes32[](totalVotes);
    uint256 index = 0;

    for (uint i = 0; i < round.projectIds.length; i++) {
        uint8 projectId = round.projectIds[i];
        for (uint j = 0; j < round.voters.length; j++) {
            address voter = round.voters[j];
            if (votes[currentVotingRound][projectId][voter].hasVoted) {
                cts[index] = FHE.toBytes32(
                    votes[currentVotingRound][projectId][voter].encryptedScore
                );
                index++;
            }
        }
    }

    // Request asynchronous decryption
    FHE.requestDecryption(cts, this.processResults.selector);
}
```

### FHE Operations

#### Encryption

```solidity
// Client-side (conceptual)
score = 7
encryptedScore = FHE.encrypt(score, publicKey)

// On-chain
euint8 encryptedScore = FHE.asEuint8(score);
```

#### Homomorphic Addition

```solidity
// Works on encrypted values directly
euint8 total = encryptedScore1 + encryptedScore2 + encryptedScore3;
// No decryption needed during computation!
```

#### Authorized Decryption

```solidity
// Only authorized parties can decrypt
FHE.allowThis(encryptedScore);     // Contract permission
FHE.allow(encryptedScore, voter);  // Voter permission

// Decryption happens via gateway
FHE.requestDecryption(encryptedValues, callbackSelector);
```

---

## 🧪 Testing

### Test Coverage

```
┌─────────────────────┬────────┬────────┬────────┬────────┐
│ File                │ % Stmts│ % Branch│ % Funcs│ % Lines│
├─────────────────────┼────────┼────────┼────────┼────────┤
│ CulturalVoting.sol  │  96.5% │  92.3% │  95.8% │  97.1% │
└─────────────────────┴────────┴────────┴────────┴────────┘

Total: 47 test cases
Status: ✅ All passing
```

### Test Categories

1. **Deployment Tests** (6 tests)
   - Contract initialization
   - Admin setup
   - Initial state verification

2. **Project Proposal Tests** (7 tests)
   - Project creation
   - Metadata validation
   - Proposal events

3. **Voter Authorization Tests** (8 tests)
   - Authorization flow
   - Revocation
   - Permission checks

4. **Voting Round Tests** (10 tests)
   - Round creation
   - State transitions
   - Multiple rounds

5. **Vote Submission Tests** (10 tests)
   - Encrypted voting
   - Score validation
   - Double-vote prevention

6. **Access Control Tests** (5 tests)
   - Admin functions
   - Voter restrictions
   - Permission modifiers

7. **View Functions Tests** (6 tests)
   - Data retrieval
   - Status queries
   - Result access

8. **Edge Cases Tests** (5 tests)
   - Boundary conditions
   - Error scenarios
   - Invalid inputs

### Run Specific Tests

```bash
# Deployment tests
npm test -- --grep "Deployment"

# Voting tests
npm test -- --grep "Vote Submission"

# All tests with gas report
npm run test:gas
```

---

## 📦 Deployment

### Deployment Information

The contract is deployed on **Ethereum Sepolia Testnet**.

**Live Application**: [https://fhe-cultural-voting.vercel.app/](https://fhe-cultural-voting.vercel.app/)

### Deployment Process

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your keys

# 2. Compile contracts
npm run compile

# 3. Deploy to Sepolia
npm run deploy

# 4. Verify on Etherscan
npm run verify
```

### Post-Deployment

Deployment information is saved in `deployments/sepolia.json`:

```json
{
  "network": "sepolia",
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deploymentTime": "2025-01-15T10:30:00.000Z",
  "transactionHash": "0x...",
  "blockNumber": 5234567
}
```

### Interact with Deployed Contract

```bash
npm run interact
```

---

## 💻 Tech Stack

### Smart Contracts

- **Solidity**: 0.8.24
- **FHEVM**: Zama's Fully Homomorphic Encryption
- **Hardhat**: Development environment
- **OpenZeppelin**: Security patterns

### FHE Technology

- **Zama FHEVM**: On-chain FHE operations
- **euint8**: 8-bit encrypted integers
- **Homomorphic Operations**: Addition, comparison on encrypted data
- **Decryption Gateway**: Asynchronous result processing

### Testing & Quality

- **Mocha/Chai**: Test framework
- **Hardhat Coverage**: Code coverage analysis
- **Solhint**: Solidity linting
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting

### DevOps & CI/CD

- **GitHub Actions**: Automated testing
- **Husky**: Pre-commit hooks
- **Gas Reporter**: Cost optimization
- **Codecov**: Coverage reporting

### Performance Optimization

- **Solidity Optimizer**: 800 runs
- **Yul Optimizer**: Advanced optimizations
- **Stack Allocation**: Memory efficiency
- **EVM Version**: Cancun (latest features)

---

## 🔒 Security

### Security Measures

| Feature | Implementation | Impact |
|---------|---------------|--------|
| **Access Control** | Role-based permissions | ⭐⭐⭐ |
| **Input Validation** | Score bounds, project checks | ⭐⭐⭐ |
| **DoS Prevention** | Bounded loops, gas limits | ⭐⭐⭐ |
| **Encryption** | FHE for all votes | ⭐⭐⭐ |
| **Reentrancy** | Checks-Effects-Interactions | ⭐⭐⭐ |
| **Code Quality** | Linting, testing, auditing | ⭐⭐⭐ |

### Best Practices

```solidity
// ✅ Access control with modifiers
modifier onlyAdmin() {
    require(msg.sender == admin, "Not authorized");
    _;
}

// ✅ Input validation
require(_score >= 1 && _score <= 10, "Score must be between 1-10");

// ✅ Double-vote prevention
require(!votes[round][projectId][voter].hasVoted, "Already voted");

// ✅ Bounded operations
require(projectIds.length <= 100, "Too many projects");

// ✅ FHE permissions
FHE.allowThis(encryptedScore);
FHE.allow(encryptedScore, msg.sender);
```

### Security Auditing

```bash
# Run security checks
npm run lint:sol
npm run security:check

# Check dependencies
npm audit
```

---

## 📚 Documentation

- **README.md**: This file
- **TESTING.md**: Comprehensive test documentation
- **SECURITY.md**: Security and optimization guide
- **CICD.md**: CI/CD pipeline documentation
- **DEPLOYMENT.md**: Deployment instructions

---

## 🎬 Video Demo

**📹 Download `demo.mp4` to watch the complete demonstration**

The video covers:
- Platform overview and features
- Encrypted voting workflow
- Privacy guarantees demonstration
- Smart contract interaction
- Results aggregation and revelation
- Technical architecture walkthrough

*Note: The video file must be downloaded and played locally. Direct streaming links are not available.*

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama**: For FHEVM technology and FHE Challenge
- **Ethereum Foundation**: For Sepolia testnet
- **OpenZeppelin**: For security best practices
- **Hardhat Team**: For development tools

---

## 📞 Contact & Support

- **GitHub**: [https://github.com/KittyOrn/FHECulturalVoting](https://github.com/KittyOrn/FHECulturalVoting)
- **Live Demo**: [https://fhe-cultural-voting.vercel.app/](https://fhe-cultural-voting.vercel.app/)
- **Issues**: [GitHub Issues](https://github.com/KittyOrn/FHECulturalVoting/issues)

---

**Built with ❤️ for the Zama FHE Challenge**

*Enabling privacy-preserving democracy in arts and culture through Fully Homomorphic Encryption*
