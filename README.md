# School_FundingRaising_Solidity

A decentralized crowdfunding smart contract tailored for schools and educational institutions. It allows donations from contributors, facilitates democratic voting among donors, and disburses funds based on community consensus, fostering accountability and transparency.

---

## 🛠️ Tech Stack & Framework

* **Solidity**: `^0.8.0` (`0.8.24`)
* **Development Framework**: [Hardhat](https://hardhat.org/)
* **Client Library**: [Ethers.js v6](https://docs.ethers.org/v6/)
* **Testing**: Mocha & Chai

---

## 📁 Project Structure

```text
School_FundingRaising_Solidity/
├── contracts/
│   └── FundRaising_Contract.sol   # Core Solidity smart contract
├── scripts/
│   └── deploy.js                  # Deployment script
├── test/
│   └── FundRaising.test.js        # Comprehensive unit test suite (18 tests)
├── hardhat.config.js              # Hardhat configuration (ESM)
├── package.json                   # Project dependencies and scripts
└── .gitignore                     # Git ignore rules for Node/Hardhat
```

---

## 🚀 Quick Start

### 1. Installation
Install all development dependencies:
```bash
npm install
```

### 2. Compile the Smart Contract
Compile the Solidity contracts to generate ABI and bytecode artifacts:
```bash
npm run compile
```

### 3. Run Unit Tests
Execute the full automated test suite (18 unit tests):
```bash
npm test
```

### 4. Deploy Locally
Run the deployment script on the in-process local Ethereum network:
```bash
npm run deploy
```

---

## 📑 Smart Contract Architecture

The `FundRaising` contract implements a 2-stage milestone-based disbursement mechanism:

1. **Donation Phase (`sendFund`)**:
   - Donors can contribute ETH before the deadline (`endTime`).
   - The contract prevents school owner self-funding and enforces minimum contributions.
   - Tracks unique contributors and their individual amounts.

2. **Milestone Disbursement 1 (`claimFund`)**:
   - Once the funding deadline passes, the school headmaster/owner can claim an immediate **10%** of the raised funds to kickstart the project.

3. **Voting Phase (`startVoting` & `putVote`)**:
   - The school owner opens voting for the remaining 90% of funds.
   - Only registered donors who contributed funds are eligible to vote.
   - One vote per contributor is strictly enforced.

4. **Milestone Disbursement 2 (`claimFund`)**:
   - Once the voting window concludes, the remaining **90%** of funds are unlocked only if a **majority** (`totalVote > totalDonar / 2`) voted in favor.

---

## 🧪 Test Coverage Summary

The test suite in [`test/FundRaising.test.js`](test/FundRaising.test.js) verifies 18 test cases across 4 categories:

* **Deployment & Initialization** (Owner assignment, funding targets, zeroed initial state)
* **Donations (`sendFund`)** (Accounting, multiple contributions, owner exclusion, value requirements, deadline expiration)
* **Voting (`startVoting` & `putVote`)** (Timing constraints, access control, donor eligibility, double-voting prevention)
* **Fund Disbursement (`claimFund`)** (10% initial claim, majority check enforcement, remaining 90% payout, re-claim prevention)
