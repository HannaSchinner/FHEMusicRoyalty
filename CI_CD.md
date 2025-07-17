# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) infrastructure for the Privacy-Preserving Music Royalty Distribution System.

## Overview

The project uses **GitHub Actions** for automated testing, code quality checks, and deployment workflows.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Code Push/PR                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   GitHub Actions Trigger       │
        │   (main/develop branches)      │
        └───────────┬───────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   Node 18.x  │        │   Node 20.x  │
└──────┬───────┘        └──────┬───────┘
       │                       │
       ▼                       ▼
┌─────────────────────────────────────┐
│  1. Install Dependencies (npm ci)   │
│  2. Code Quality (Solhint)          │
│  3. Compile Contracts               │
│  4. Run Test Suite                  │
│  5. Generate Coverage               │
│  6. Upload to Codecov               │
└─────────────────────────────────────┘
                    │
                    ▼
            ┌──────────────┐
            │  Build Stage  │
            └──────────────┘
```

## Workflows

### 1. Automated Testing (`test.yml`)

**Trigger Events:**
- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main` or `develop`

**Jobs:**

#### Test Job
- **Platform:** Ubuntu Latest
- **Matrix:** Node.js 18.x, 20.x
- **Steps:**
  1. Checkout repository
  2. Setup Node.js environment
  3. Install dependencies with `npm ci`
  4. Run Solhint linter
  5. Compile smart contracts
  6. Execute test suite
  7. Generate coverage report
  8. Upload coverage to Codecov

#### Build Job
- **Depends on:** Test job must pass
- **Platform:** Ubuntu Latest
- **Matrix:** Node.js 18.x, 20.x
- **Steps:**
  1. Checkout repository
  2. Setup Node.js environment
  3. Install dependencies
  4. Compile contracts
  5. Verify artifacts

### 2. Manual Testing (`manual.yml`)

**Trigger:** Manual workflow dispatch

**Purpose:** On-demand testing for:
- Feature validation
- Pre-release checks
- Debug runs

## Code Quality Tools

### Solhint

Smart contract linting tool for Solidity.

**Configuration:** `.solhint.json`

**Rules Enforced:**
- Code complexity limit: 10
- Compiler version: >=0.8.24
- Function visibility enforcement
- Max line length: 120 characters
- Named parameter mapping
- Custom error usage (gas optimization)

**Usage:**
```bash
npm run lint:sol          # Check for issues
npm run lint:sol:fix      # Auto-fix issues
```

### Prettier

Code formatter for consistent style.

**Configuration:** `.prettierrc.json`

**Formats:**
- JavaScript/TypeScript files
- Solidity contracts
- JSON, YAML, Markdown

**Usage:**
```bash
npm run format           # Format all files
npm run format:check     # Check formatting
```

### Solidity Coverage

Test coverage analysis for smart contracts.

**Configuration:** Integrated with Hardhat

**Metrics Tracked:**
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

**Usage:**
```bash
npm run coverage
```

**Reports:** Generated in `coverage/` directory

## Codecov Integration

### Setup

1. Sign up at [codecov.io](https://codecov.io)
2. Add repository to Codecov
3. Copy repository token
4. Add token to GitHub Secrets as `CODECOV_TOKEN`

### Coverage Upload

Automatic upload occurs:
- After test completion
- Only on Node.js 20.x (to avoid duplicates)
- Only if CODECOV_TOKEN is configured

### Coverage Badges

Add to README.md:
```markdown
[![codecov](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

## Environment Configuration

### GitHub Secrets

Required secrets in repository settings:

| Secret | Purpose | Required |
|--------|---------|----------|
| `CODECOV_TOKEN` | Coverage reporting | Optional |
| `PRIVATE_KEY` | Deployment key | For deployment |
| `SEPOLIA_RPC_URL` | RPC endpoint | For deployment |
| `ETHERSCAN_API_KEY` | Contract verification | For deployment |

### Environment Variables

Set in workflow files or `.env`:

```env
NODE_ENV=test
REPORT_GAS=false
```

## Local Development

### Running CI Checks Locally

Before pushing code, run these checks:

```bash
# 1. Install dependencies
npm ci

# 2. Lint Solidity
npm run lint:sol

# 3. Check formatting
npm run format:check

# 4. Compile contracts
npm run compile

# 5. Run tests
npm test

# 6. Generate coverage
npm run coverage
```

### Pre-commit Hooks

Consider adding pre-commit hooks with Husky:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

## Branch Protection

### Recommended Rules for `main`

1. **Require pull request reviews**
   - At least 1 approval
   - Dismiss stale reviews

2. **Require status checks**
   - Test on Node 18.x ✓
   - Test on Node 20.x ✓
   - Build on Node 18.x ✓
   - Build on Node 20.x ✓

3. **Additional settings**
   - Require branches to be up to date
   - Include administrators
   - Restrict who can push

## Continuous Deployment

### Future Enhancements

Planned CD features:

1. **Automated Testnet Deployment**
   - Deploy to Sepolia on successful main merge
   - Generate deployment report

2. **Contract Verification**
   - Auto-verify on Etherscan
   - Publish source code

3. **Release Management**
   - Automated versioning
   - Changelog generation
   - GitHub releases

## Monitoring and Alerts

### Build Status

Monitor workflow runs:
- GitHub Actions tab
- Status badges in README
- Email notifications

### Failure Notifications

Configure in repository settings:
- Email alerts
- Slack/Discord webhooks
- GitHub notifications

## Performance Optimization

### Caching Strategy

Workflows use caching for:
- `node_modules` (npm cache)
- Compiled artifacts
- Coverage data

**Benefits:**
- Faster workflow execution
- Reduced network usage
- Lower costs

### Parallel Execution

Matrix strategy runs jobs in parallel:
- Multiple Node.js versions simultaneously
- Independent test/build jobs
- Faster feedback

## Troubleshooting

### Common Issues

**1. Tests pass locally but fail in CI**

Solutions:
- Check Node.js version matches
- Use `npm ci` instead of `npm install`
- Clear local cache: `npm run clean`

**2. Solhint errors**

Solutions:
- Run locally: `npm run lint:sol`
- Auto-fix: `npm run lint:sol:fix`
- Update rules in `.solhint.json`

**3. Coverage upload fails**

Solutions:
- Verify CODECOV_TOKEN is set
- Check token permissions
- Review Codecov logs

**4. Workflow doesn't trigger**

Solutions:
- Check branch names match
- Verify workflow file syntax
- Check permissions

## Best Practices

### 1. Keep Workflows Fast
- Use caching
- Run jobs in parallel
- Optimize test execution

### 2. Fail Fast
- Run linting before tests
- Stop on first failure
- Clear error messages

### 3. Security
- Never commit secrets
- Use GitHub Secrets
- Minimize permissions

### 4. Maintainability
- Document workflows
- Use reusable actions
- Keep configurations simple

## Resources

### Documentation
- [GitHub Actions](https://docs.github.com/actions)
- [Hardhat CI Setup](https://hardhat.org/hardhat-runner/docs/guides/continuous-integration)
- [Solhint Rules](https://github.com/protofire/solhint)
- [Codecov Docs](https://docs.codecov.com/)

### Tools
- [Act](https://github.com/nektos/act) - Run GitHub Actions locally
- [GitHub CLI](https://cli.github.com/) - Manage workflows from terminal

## Contributing

### Adding New Workflows

1. Create workflow file in `.github/workflows/`
2. Test locally if possible
3. Use semantic naming
4. Add documentation
5. Update this file

### Modifying Existing Workflows

1. Test changes on feature branch
2. Review impact on CI time
3. Update documentation
4. Get team approval

## Version History

- **v1.0.0** (2025): Initial CI/CD setup
  - GitHub Actions workflows
  - Solhint integration
  - Codecov reporting
  - Multi-version Node.js testing

---

**Last Updated:** 2025
**Maintained by:** Development Team
