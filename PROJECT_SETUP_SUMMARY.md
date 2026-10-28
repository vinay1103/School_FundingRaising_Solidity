# Project Setup Summary: School_FundingRaising_Solidity

- **Target Directory**: `C:\Users\Vinay Sai Yogeesh\Downloads\School_FundingRaising_Solidity`
- **GitHub Origin**: `https://github.com/vinay1103/School_FundingRaising_Solidity.git`
- **Date Completed**: 2026-10-28
- **Solidity Version**: `^0.8.0` (compiled with `0.8.24`)

---

## 1. Environment & Framework Setup
- **npm Initialization**: Initialized `package.json` with `"type": "module"`.
- **Framework**: Installed and configured **Hardhat** with the high-performance EDR (Ethereum Development Runtime).
- **Libraries**:
  - `@nomicfoundation/hardhat-ethers` & `ethers` (v6)
  - `@nomicfoundation/hardhat-mocha` & `mocha`
  - `chai`

---

## 2. Project Directory Structure
```text
School_FundingRaising_Solidity/
├── .gitignore                     # Excludes node_modules, artifacts, cache, .env
├── contracts/
│   └── FundRaising_Contract.sol   # Solidity smart contract
├── scripts/
│   └── deploy.js                  # Deployment script
├── test/
│   └── FundRaising.test.js        # Automated Mocha/Chai test suite (18 tests)
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Scripts: compile, test, deploy
├── README.md                      # Complete project documentation
└── completion_summary.eml         # Ready-to-send email summary
```

---

## 3. Test Suite Verification (`npm test`)
All 18 unit tests passed cleanly:

- **Deployment & Initialization**
  - `✔ Should correctly set the owner, totalFundReq, and initial state`
- **Donations (`sendFund`)**
  - `✔ Should accept donations from donors and update accounting`
  - `✔ Should correctly track multiple donations from same and different donors`
  - `✔ Should reject donation from school owner`
  - `✔ Should reject 0 value donation`
  - `✔ Should reject donations after deadline has passed`
- **Voting (`startVoting` & `putVote`)**
  - `✔ Should revert if voting is started before deadline`
  - `✔ Should revert if non-owner tries to start voting`
  - `✔ Should allow owner to start voting after deadline`
  - `✔ Should allow eligible donors to cast a vote`
  - `✔ Should prevent non-contributors from voting`
  - `✔ Should prevent double voting by the same donor`
  - `✔ Should reject vote after voting window ends`
- **Claiming Funds (`claimFund`)**
  - `✔ Should reject claim if crowdfunding is not over yet`
  - `✔ Should reject claim from non-owner`
  - `✔ Should allow initial 10% disbursement on first claim (totalAsk == 1)`
  - `✔ Should reject second claim if majority vote is not reached`
  - `✔ Should disburse remaining funds on second claim when majority supports`

---

## 4. Local Deployment Script (`npm run deploy`)
- File: `scripts/deploy.js`
- Test run: Successfully deployed to address `0x5FbDB2315678afecb367f032d93F642f64180aa3` with 10 ETH goal and 7-day duration.
