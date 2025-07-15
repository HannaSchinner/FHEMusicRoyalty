# Testing Documentation

This document provides comprehensive information about the test suite for the Privacy-Preserving Music Royalty Distribution System.

## Test Infrastructure

### Framework
- **Hardhat**: Main development and testing framework
- **Mocha**: Test runner
- **Chai**: Assertion library
- **Ethers.js**: Ethereum interaction library

### Test Environment
Tests run on Hardhat's local blockchain network, providing:
- Fast execution
- Deterministic behavior
- Easy debugging
- Gas reporting

## Running Tests

### Run All Tests
```bash
npm test
```

### Run with Verbose Output
```bash
npx hardhat test --verbose
```

### Run Specific Test File
```bash
npx hardhat test test/PrivateMusicRoyalty.test.js
```

### Run with Gas Reporter
```bash
REPORT_GAS=true npm test
```

## Test Coverage

The test suite includes comprehensive coverage across the following areas:

### 1. Deployment Tests (4 tests)
- Contract deployment verification
- Owner initialization
- Initial state verification
- Counter initialization

### 2. Rights Holder Registration (3 tests)
- User registration
- Duplicate registration prevention
- Information storage

### 3. Rights Holder Verification (3 tests)
- Owner verification permissions
- Non-owner rejection
- Event emission

### 4. Track Registration (4 tests)
- Verified holder registration
- Unverified holder rejection
- Share validation
- Event emission

### 5. Royalty Pool Creation (3 tests)
- Pool creation with ETH
- Zero value prevention
- Event emission

### 6. Royalty Distribution (2 tests)
- Distribution execution
- Double distribution prevention

### 7. Access Control (1 test)
- Owner-only verification

### 8. Gas Optimization (1 test)
- Gas cost monitoring for track registration

**Total Test Cases: 21+**

## Test Structure

### Standard Test Pattern

```javascript
describe("Feature Name", function () {
  let contract;
  let owner;
  let user1;
  
  beforeEach(async function () {
    // Setup before each test
    [owner, user1] = await ethers.getSigners();
    contract = await deployContract();
  });

  it("should do something", async function () {
    // Test logic
    await expect(contract.someFunction())
      .to.not.be.reverted;
  });
});
```

### Test Categories

#### Positive Tests
Tests that verify expected functionality works correctly:
- Successful deployments
- Valid operations
- Correct state changes

#### Negative Tests
Tests that verify proper error handling:
- Reverted transactions
- Access control enforcement
- Input validation

#### Edge Cases
Tests that verify behavior at boundaries:
- Zero values
- Maximum values
- Empty arrays

#### Integration Tests
Tests that verify multiple components working together:
- Complete workflows
- Multi-step processes

## Test Scenarios

### Scenario 1: Basic Track Registration

```javascript
1. Register rights holder
2. Verify rights holder (owner)
3. Register track with shares
4. Verify track information
```

### Scenario 2: Royalty Distribution

```javascript
1. Setup rights holders
2. Register track
3. Create royalty pool with ETH
4. Distribute royalties
5. Verify distribution status
```

### Scenario 3: Access Control

```javascript
1. Attempt unauthorized operation
2. Verify rejection
3. Perform authorized operation
4. Verify success
```

## Assertions Used

### Common Chai Assertions

- `expect(value).to.equal(expected)` - Strict equality
- `expect(tx).to.be.reverted` - Transaction reverts
- `expect(tx).to.be.revertedWith(message)` - Specific revert message
- `expect(tx).to.emit(contract, event)` - Event emission
- `expect(value).to.be.gt(number)` - Greater than
- `expect(value).to.be.lt(number)` - Less than
- `expect(address).to.be.properAddress` - Valid Ethereum address

## Best Practices

### 1. Test Isolation
Each test should be independent and not rely on previous tests:
```javascript
beforeEach(async function () {
  // Deploy fresh contract for each test
  contract = await deployContract();
});
```

### 2. Clear Test Names
Use descriptive names that explain what is being tested:
```javascript
it("should prevent non-owner from verifying rights holders", ...);
```

### 3. Arrange-Act-Assert Pattern
```javascript
it("should do something", async function () {
  // Arrange: Setup test data
  const user = artist1;
  
  // Act: Perform operation
  await contract.connect(user).someFunction();
  
  // Assert: Verify result
  expect(result).to.equal(expected);
});
```

### 4. Test One Thing
Each test should verify a single behavior or outcome.

### 5. Use Helper Functions
Create reusable setup functions:
```javascript
async function setupVerifiedArtist() {
  await contract.connect(artist1).registerRightsHolder();
  await contract.connect(owner).verifyRightsHolder(artist1.address);
}
```

## Gas Reporting

Enable gas reporting to monitor contract efficiency:

```bash
REPORT_GAS=true npm test
```

This generates a report showing gas costs for each function call.

## Debugging Tests

### Enable Verbose Logging
```bash
npx hardhat test --verbose
```

### Use console.log
Add logging in tests:
```javascript
console.log("Address:", await contract.getAddress());
```

### Run Single Test
```javascript
it.only("should do something", async function () {
  // This test will run alone
});
```

## Continuous Integration

Tests should run automatically on:
- Pull requests
- Commits to main branch
- Before deployments

## Future Test Enhancements

### Additional Test Categories to Implement

1. **FHE-Specific Tests**
   - Encrypted data handling
   - Decryption oracle integration
   - Access control lists

2. **Fuzzing Tests**
   - Random input generation
   - Edge case discovery
   - Property-based testing

3. **Integration Tests**
   - Full workflow simulations
   - Multi-user scenarios
   - Complex interactions

4. **Performance Tests**
   - Large-scale operations
   - Gas optimization verification
   - Scalability testing

## Test Metrics

Target metrics for test quality:

- **Coverage**: >80% code coverage
- **Execution Time**: <30 seconds for full suite
- **Pass Rate**: 100% on clean code
- **Gas Efficiency**: Within expected ranges

## Common Issues and Solutions

### Issue: Tests Timeout
**Solution**: Increase timeout in test:
```javascript
this.timeout(60000); // 60 seconds
```

### Issue: Gas Estimation Failed
**Solution**: Check contract state and ensure sufficient balance

### Issue: Unexpected Revert
**Solution**: Verify contract state and function prerequisites

## Contributing Tests

When adding new features:

1. Write tests first (TDD approach)
2. Cover positive and negative cases
3. Include edge cases
4. Update this documentation
5. Ensure all tests pass

## Resources

- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Chai Assertion Library](https://www.chaijs.com/)
- [Ethers.js Documentation](https://docs.ethers.org/)

**Last Updated**: 2025  
**Test Framework Version**: Hardhat 2.19.0
