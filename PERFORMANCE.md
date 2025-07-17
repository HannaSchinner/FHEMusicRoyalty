# Performance Optimization Guide

This document outlines performance optimization strategies, gas efficiency techniques, and monitoring practices for the Privacy-Preserving Music Royalty Distribution System.

## Performance Architecture

```
┌──────────────────────────────────────────────────────────┐
│            Performance Optimization Stack                 │
├──────────────────────────────────────────────────────────┤
│  Smart Contract Layer                                     │
│  ├─ Compiler Optimization (runs: 200)                   │
│  ├─ Storage Packing                                      │
│  ├─ Custom Errors                                        │
│  └─ Efficient Data Structures                            │
│                                                           │
│  Gas Monitoring Layer                                     │
│  ├─ Hardhat Gas Reporter                                │
│  ├─ Transaction Analysis                                 │
│  └─ Cost Tracking                                        │
│                                                           │
│  Frontend Layer                                           │
│  ├─ Code Splitting                                       │
│  ├─ Lazy Loading                                         │
│  ├─ Caching Strategies                                   │
│  └─ Bundle Optimization                                  │
│                                                           │
│  CI/CD Layer                                              │
│  ├─ Performance Testing                                  │
│  ├─ Benchmarking                                         │
│  └─ Automated Optimization                               │
└──────────────────────────────────────────────────────────┘
```

## Gas Optimization Techniques

### 1. Storage Optimization

#### Storage Slot Packing

**Theory**: Each storage slot is 256 bits (32 bytes)

**Example**:
```solidity
// Inefficient: 3 storage slots
struct Inefficient {
    uint256 amount;      // Slot 0
    address user;        // Slot 1
    bool active;         // Slot 2
}

// Efficient: 2 storage slots
struct Efficient {
    address user;        // Slot 0 (160 bits)
    bool active;         // Slot 0 (8 bits) - packed with address
    uint256 amount;      // Slot 1
}
```

**Gas Savings**: ~5,000 gas per write

#### Use Mappings Over Arrays

```solidity
// Less efficient for lookups
address[] public holders;

// More efficient
mapping(address => bool) public isHolder;
```

### 2. Function Optimization

#### External vs Public

```solidity
// More expensive: Copies to memory
function publicFunc(uint[] memory data) public {}

// Cheaper: Direct calldata access
function externalFunc(uint[] calldata data) external {}
```

**Gas Savings**: ~1,000 gas for large arrays

#### View/Pure Functions

```solidity
// Free if called externally
function getBalance() external view returns (uint256) {
    return balance;
}

// Still costs gas in transactions
function getBalance() public view returns (uint256) {
    return balance;
}
```

#### Custom Errors

```solidity
// Expensive: ~6,000 gas
require(condition, "Error message string");

// Cheap: ~200 gas
error NotAuthorized();
if (!condition) revert NotAuthorized();
```

**Gas Savings**: ~5,800 gas per revert

### 3. Loop Optimization

#### Cache Array Length

```solidity
// Bad: Reads length every iteration
for (uint i = 0; i < array.length; i++) {
    // operations
}

// Good: Cache length
uint256 length = array.length;
for (uint i = 0; i < length; i++) {
    // operations
}
```

#### Unchecked Arithmetic

```solidity
// Solidity 0.8.x: Overflow checks cost gas
for (uint i = 0; i < length; i++) {
    // operations
}

// Optimized: Skip overflow checks when safe
for (uint i = 0; i < length;) {
    // operations
    unchecked { ++i; }
}
```

**Gas Savings**: ~30 gas per iteration

### 4. Data Type Optimization

#### Use Smallest Sufficient Type

```solidity
// Inefficient
uint256 age = 25;

// Efficient (if packing with other variables)
uint8 age = 25;
```

#### Boolean Packing

```solidity
// Use uint8 instead of bool when packing
uint8 constant FALSE = 0;
uint8 constant TRUE = 1;
```

## Compiler Optimization

### Configuration Options

```javascript
// hardhat.config.js
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,  // Balance deployment vs runtime
        details: {
          yul: true,
          yulDetails: {
            stackAllocation: true,
            optimizerSteps: "dhfoDgvulfnTUtnIf"
          }
        }
      },
      viaIR: true,  // Enable IR optimizer
      evmVersion: "cancun"
    }
  }
};
```

### Runs Parameter

| Runs | Use Case | Trade-off |
|------|----------|-----------|
| 1 | Single deployment | Small deployment, expensive runtime |
| 200 | Balanced (default) | Medium deployment, medium runtime |
| 10000 | Frequent calls | Large deployment, cheap runtime |

**Recommendation**: Use 200 for most contracts

## Gas Monitoring

### Hardhat Gas Reporter

**Setup**:
```javascript
// hardhat.config.js
gasReporter: {
  enabled: process.env.REPORT_GAS === "true",
  currency: "USD",
  coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  token: "ETH",
  gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  outputFile: "gas-report.txt",
  noColors: true,
  showTimeSpent: true,
  showMethodSig: true
}
```

**Usage**:
```bash
REPORT_GAS=true npm test
```

**Output**:
```
·-------------------------------------------|---------------------------|-------------|-----------------------------·
|    Solc version: 0.8.24                   ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
············································|···························|·············|······························
|  Methods                                                                                                           │
··························|·················|·············|·············|·············|···············|··············
|  Contract               ·  Method         ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
··························|·················|·············|·············|·············|···············|··············
|  PrivateMusicRoyalty    ·  registerTrack  ·     50,000  ·     75,000  ·     62,500  ·           10  ·      $12.50  │
··························|·················|·············|·············|·············|···············|··············
```

### Gas Profiling

**Identify Expensive Operations**:

```bash
# Generate detailed gas report
npm run test -- --gas-reporter

# Profile specific test
npx hardhat test test/GasProfile.test.js --gas-reporter
```

## Frontend Performance

### Code Splitting

**Webpack Configuration**:
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        contract: {
          test: /[\\/]contracts[\\/]/,
          name: 'contracts',
          priority: 5
        }
      }
    }
  }
};
```

**Benefits**:
- Faster initial load
- Better caching
- Reduced bundle size

### Lazy Loading

**React Example**:
```javascript
import { lazy, Suspense } from 'react';

const ContractInterface = lazy(() => import('./ContractInterface'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <ContractInterface />
    </Suspense>
  );
}
```

### Web3 Optimization

**Batch Requests**:
```javascript
// Inefficient: Multiple calls
const balance1 = await contract.balanceOf(addr1);
const balance2 = await contract.balanceOf(addr2);
const balance3 = await contract.balanceOf(addr3);

// Efficient: Batch call
const batch = new web3.BatchRequest();
batch.add(contract.methods.balanceOf(addr1).call.request());
batch.add(contract.methods.balanceOf(addr2).call.request());
batch.add(contract.methods.balanceOf(addr3).call.request());
const results = await batch.execute();
```

### Caching Strategies

**Local Storage**:
```javascript
// Cache contract ABI
const getCachedABI = (address) => {
  const cached = localStorage.getItem(`abi_${address}`);
  if (cached) return JSON.parse(cached);

  // Fetch and cache
  const abi = fetchABI(address);
  localStorage.setItem(`abi_${address}`, JSON.stringify(abi));
  return abi;
};
```

**Service Worker**:
```javascript
// Cache contract calls
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/contract/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

## Performance Testing

### Load Testing

**k6 Script**:
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/tracks');
  check(res, { 'status was 200': (r) => r.status == 200 });
}
```

### Gas Benchmarking

**Test Suite**:
```javascript
describe("Gas Benchmarks", function () {
  it("should measure registerTrack gas", async function () {
    const tx = await contract.registerTrack(...);
    const receipt = await tx.wait();

    console.log("Gas used:", receipt.gasUsed.toString());
    expect(receipt.gasUsed).to.be.lt(100000);
  });
});
```

## DoS Protection

### Rate Limiting

**Configuration**:
```env
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

**Implementation**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW,
  max: process.env.RATE_LIMIT_MAX,
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### Gas Limits

**Contract Level**:
```solidity
uint256 constant MAX_GAS_PER_TX = 5_000_000;

modifier gasLimit() {
    require(gasleft() < MAX_GAS_PER_TX, "Gas limit exceeded");
    _;
}
```

**Transaction Level**:
```javascript
const tx = await contract.someFunction({
  gasLimit: 500000  // Prevent runaway transactions
});
```

### Array Size Limits

```solidity
uint256 constant MAX_ARRAY_SIZE = 100;

function batchProcess(address[] memory addresses) external {
    require(addresses.length <= MAX_ARRAY_SIZE, "Array too large");
    // Process
}
```

## Performance Monitoring

### Metrics to Track

1. **Gas Metrics**
   - Average gas per transaction
   - Gas price trends
   - Transaction costs in USD

2. **Response Times**
   - Contract call latency
   - Transaction confirmation time
   - API response times

3. **Resource Usage**
   - CPU utilization
   - Memory consumption
   - Network bandwidth

### Monitoring Tools

**On-Chain**:
- Etherscan gas tracker
- DeFi Pulse gas prices
- Blocknative gas estimator

**Off-Chain**:
- New Relic
- Datadog
- Grafana + Prometheus

## Optimization Workflow

### 1. Measure

```bash
# Run gas report
REPORT_GAS=true npm test

# Profile specific function
npm run test:profile -- --grep "expensive function"
```

### 2. Analyze

- Identify hotspots
- Compare with benchmarks
- Review gas report

### 3. Optimize

- Apply optimization techniques
- Refactor expensive operations
- Test changes

### 4. Verify

```bash
# Run tests
npm test

# Generate new gas report
REPORT_GAS=true npm test

# Compare results
diff gas-report-before.txt gas-report-after.txt
```

## Best Practices

### Development

1. ✅ Write gas-efficient code from the start
2. ✅ Use `external` over `public` when possible
3. ✅ Implement custom errors
4. ✅ Cache storage reads
5. ✅ Pack storage variables

### Testing

1. ✅ Always run gas reporter
2. ✅ Set gas limits in tests
3. ✅ Benchmark critical functions
4. ✅ Test with realistic data sizes
5. ✅ Monitor gas trends over time

### Deployment

1. ✅ Optimize for target use case
2. ✅ Document gas costs
3. ✅ Set appropriate gas limits
4. ✅ Monitor actual usage
5. ✅ Iterate and improve

## Resources

### Tools

- [Hardhat Gas Reporter](https://github.com/cgewecke/hardhat-gas-reporter)
- [eth-gas-reporter](https://github.com/cgewecke/eth-gas-reporter)
- [Tenderly Gas Profiler](https://tenderly.co/)
- [EVM Codes](https://www.evm.codes/)

### Documentation

- [Solidity Optimization Tips](https://docs.soliditylang.org/en/latest/internals/optimizer.html)
- [Gas Optimization Guide](https://gist.github.com/hrkrshnn/ee8fabd532058307229d65dcd5836ddc)
- [Ethereum Gas Explained](https://ethereum.org/en/developers/docs/gas/)

---

**Performance Target**: < 500k gas for critical operations
**Monitoring**: Real-time gas tracking
**Last Updated**: 2025
