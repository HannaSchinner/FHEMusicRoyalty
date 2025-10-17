# GitHub Actions CI/CD

This directory contains GitHub Actions workflows for automated testing and continuous integration.

## Workflows

### 1. Test and Build (`test.yml`)

Runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Matrix Testing:**
- Node.js versions: 18.x, 20.x
- Platform: Ubuntu Latest

**Steps:**
1. Checkout code
2. Setup Node.js environment
3. Install dependencies (`npm ci`)
4. Run Solhint linter
5. Compile smart contracts
6. Run test suite
7. Generate coverage report
8. Upload coverage to Codecov (Node 20.x only)

**Build Job:**
- Runs after tests pass
- Compiles contracts
- Verifies artifacts generation

### 2. Manual Test (`manual.yml`)

Manually triggered workflow for on-demand testing.

**How to run:**
1. Go to Actions tab in GitHub
2. Select "Manual Test" workflow
3. Click "Run workflow"

**Steps:**
- Full test suite execution
- Code quality checks
- Coverage generation

## Setup Requirements

### Environment Secrets

Configure these secrets in your GitHub repository settings:

1. **CODECOV_TOKEN** (Optional)
   - For coverage reporting to Codecov
   - Get token from https://codecov.io

### Local Testing

Test workflows locally before pushing:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint:sol

# Compile contracts
npm run compile

# Run tests
npm test

# Generate coverage
npm run coverage
```

## Code Quality Tools

### Solhint
Smart contract linting for Solidity code.

Configuration: `.solhint.json`

```bash
npm run lint:sol
npm run lint:sol:fix
```

### Prettier
Code formatting for JavaScript and Solidity.

Configuration: `.prettierrc.json`

```bash
npm run format
npm run format:check
```

### Solidity Coverage
Test coverage reporting for smart contracts.

```bash
npm run coverage
```

Reports generated in `coverage/` directory.

## Branch Protection

Recommended branch protection rules for `main`:

- Require pull request reviews
- Require status checks to pass:
  - Test on Node 18.x
  - Test on Node 20.x
  - Build on Node 18.x
  - Build on Node 20.x
- Require branches to be up to date

## Troubleshooting

### Tests Failing in CI but Passing Locally

1. Check Node.js version matches
2. Ensure clean install with `npm ci`
3. Check for environment-specific issues

### Solhint Warnings

Some warnings are informational. Update `.solhint.json` to adjust rules.

### Coverage Upload Fails

Verify CODECOV_TOKEN is set in repository secrets.

## Contributing

When adding new workflows:

1. Test locally first
2. Use pinned action versions
3. Add appropriate documentation
4. Update this README

## Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Hardhat Testing Guide](https://hardhat.org/tutorial/testing-contracts)
- [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md)
- [Codecov Documentation](https://docs.codecov.com/)
