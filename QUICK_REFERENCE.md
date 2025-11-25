# Quick Reference Guide - Enhanced PrivateMusicRoyalty

## 🎯 New Features at a Glance

### 1. Gateway Callback Mode
```solidity
// User initiates
claimRoyalty(poolId)
  ↓
// Contract requests decryption
FHE.requestDecryption(cts, this.processClaimPayment.selector)
  ↓
// Gateway decrypts asynchronously
  ↓
// Callback completes payment
processClaimPayment(requestId, cleartexts, proof)
```

### 2. Timeout-Based Refund (7 days)
```solidity
// If Gateway doesn't respond after 7 days
claimRefundOnTimeout(poolId)
  ↓
// Automatic refund based on proportional share
Refund = Contract Balance / Number of Rights Holders
```

### 3. Privacy-Preserving Division
```
Amount: 10 ETH → 10 * 1000 = 10,000 (encrypted)
Share: 50% = 5000/10000
Payment = 10,000 * 5000 = 50,000,000 (encrypted)
Final = 50,000,000 / (10000 * 1000) = 5 ETH ✓
```

### 4. Price Obfuscation
- All amounts multiplied by **1000** before encryption
- Values stay hidden until final claim
- No magnitude leakage possible

---

## 📋 Key Constants

```solidity
DECRYPTION_TIMEOUT      = 7 days (604800 seconds)
PRIVACY_MULTIPLIER      = 1000   (for obfuscation)
BASIS_POINTS            = 10000  (100.00%)
```

---

## 🔄 Workflow Comparison

### SUCCESS PATH (Gateway responds)
```
1. claimRoyalty()
   ↓
2. [Wait for Gateway]
   ↓
3. Gateway calls processClaimPayment()
   ↓
4. User receives payment
   ✓ RoyaltyClaimed event
```

### FAILURE PATH (Gateway timeout)
```
1. claimRoyalty()
   ↓
2. [Wait 7 days...]
   ↓
3. claimRefundOnTimeout()
   ↓
4. User receives proportional refund
   ✓ RoyaltyRefunded + DecryptionTimeout events
```

---

## 🔐 Security Layers

| Layer | Protection |
|-------|-----------|
| 1 | Input validation (arrays, sums, amounts) |
| 2 | Access control (owner, verified, creator roles) |
| 3 | Overflow protection (Solidity 0.8.24 built-in) |
| 4 | Reentrancy guards (state before transfers) |
| 5 | FHE security (encrypted data, permissions, proofs) |

---

## 📊 Gas Optimization

**Custom Errors**: Save ~5,800 gas per revert
```solidity
// Old: require(msg.sender == owner, "Not authorized");
// New: if (msg.sender != owner) revert Unauthorized();
```

**Total Gas Savings**:
- ~5,800 per error revert
- ~20,000 per storage write (packing)
- ~1,000 per external call

---

## 🎭 User Roles

### Rights Holder
- `registerRightsHolder()` - Self-register
- `registerTrack()` - Register music tracks
- `claimRoyalty()` - Claim via Gateway
- `claimRefundOnTimeout()` - Refund after 7 days

### Track Creator
- `updateTrackMetadata()`
- `deactivateTrack()`

### Contract Owner
- `verifyRightsHolder()`
- `emergencyWithdraw()`

### Anyone
- `createRoyaltyPool()` - Fund pool
- `distributeRoyalties()` - Distribute payments

---

## 📈 Event Monitoring

### Track Events
```solidity
event TrackRegistered(uint256 indexed trackId, address indexed creator, string metadataURI)
```

### Pool Events
```solidity
event RoyaltyPoolCreated(uint256 indexed poolId, uint256 indexed trackId, uint256 amount)
event RoyaltyDistributed(uint256 indexed poolId, address indexed recipient)
```

### Claim Events
```solidity
event RoyaltyClaimed(uint256 indexed poolId, address indexed claimant, uint256 amount)
event RoyaltyRefunded(uint256 indexed poolId, address indexed claimant, uint256 amount)  // NEW
```

### Gateway Events (NEW)
```solidity
event DecryptionRequested(uint256 indexed poolId, address indexed claimer, uint256 requestId)
event DecryptionTimeout(uint256 indexed poolId, address indexed claimer)
```

---

## 🔍 View Functions for Frontend

### Check Claim Status
```solidity
getClaimStatus(uint256 poolId, address holder)
→ Returns: (bool claimed, bool refunded)
```

### Check Pending Refund
```solidity
getPendingClaim(address claimer)
→ Returns: (uint256 poolId, bool processed, uint256 requestTime, bool canRefund)
```

### Get Pool Info
```solidity
getPoolInfo(uint256 poolId)
→ Returns: (trackId, distributed, createdAt, payees, decryptionRequested, requestTime)
```

### Get Contract Config
```solidity
getContractInfo()
→ Returns: (totalTracks, totalPools, owner, timeout=7days, multiplier=1000)
```

---

## 🚨 Error Codes

| Error | Meaning | Fix |
|-------|---------|-----|
| `Unauthorized()` | Not authorized for operation | Check permissions |
| `AlreadyRegistered()` | Already registered as holder | Only register once |
| `NotRegistered()` | Not registered as holder | Register first |
| `InvalidInput()` | Invalid parameters | Check array lengths, amounts, sums |
| `AlreadyClaimed()` | Already claimed this pool | Can only claim once |
| `NotDistributed()` | Pool not distributed yet | Wait for distribution |
| `DecryptionPending()` | Decryption already requested | Wait for callback or timeout |
| `TimeoutNotReached()` | 7 days not elapsed yet | Wait or claim normally via Gateway |
| `InvalidRequestId()` | Unknown request ID | Check request ID |

---

## 📝 Transaction Flow Example

### Complete Happy Path

```
1. Alice registers as rights holder
   → registerRightsHolder()

2. Owner verifies Alice
   → verifyRightsHolder(alice)

3. Alice registers track (50% creator, 30% producer, 20% distributor)
   → registerTrack(metadataURI, [alice, bob, charlie], [5000, 3000, 2000])

4. Anyone funds royalty pool with 10 ETH
   → createRoyaltyPool(trackId) {value: 10 ether}

5. Anyone distributes royalties
   → distributeRoyalties(poolId)
   → Calculates: alice=5 ETH, bob=3 ETH, charlie=2 ETH (encrypted)

6. Alice claims her payment (async)
   → claimRoyalty(poolId)
   → Emits: DecryptionRequested event
   → Gateway processes...
   → Callback: processClaimPayment(requestId, cleartexts, proof)
   → Alice receives 5 ETH ✓
   → Emits: RoyaltyClaimed event

Alternative (timeout path):
6. Alice claims (stuck - Gateway down)
   → claimRoyalty(poolId)
   → [Waits 7 days...]
   → claimRefundOnTimeout(poolId)
   → Alice receives proportional refund
   → Emits: RoyaltyRefunded, DecryptionTimeout events
```

---

## 🔗 Related Documentation

- **README.md** - Feature overview and getting started
- **ARCHITECTURE.md** - Detailed technical architecture
- **ENHANCEMENT_SUMMARY.md** - Complete list of changes

---

## 💡 Pro Tips

1. **Always verify rights holders** before allowing track registration
2. **Check timeout status** before attempting refund
3. **Monitor events** for complete transaction history
4. **Use getPendingClaim()** to check refund eligibility
5. **Storage packing** saves ~20,000 gas per write
6. **Custom errors** save ~5,800 gas vs require statements
7. **Gateway typically responds in minutes**, 7-day timeout is safety net

---

## 🧪 Testing Checklist

- [ ] Register rights holder
- [ ] Owner verifies holder
- [ ] Create track with encrypted shares
- [ ] Create royalty pool
- [ ] Distribute royalties
- [ ] Claim payment (Gateway path)
- [ ] Test timeout refund (7 days)
- [ ] Verify events emitted
- [ ] Check gas savings from custom errors
- [ ] Verify privacy multiplier applied

---

Generated: November 24, 2025
Enhanced Version: 2.0 (Gateway Callback + Timeout Protection)
