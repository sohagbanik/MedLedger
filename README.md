# Full-Stack Medical Records System on Stellar 🏥

A fully decentralized, full-stack application for managing patient healthcare records. Built with a Next.js frontend and powered by Soroban smart contracts on the Stellar network, this dApp provides a secure, permissionless, and immutable way to register patients and log medical records.


## Project Description
The Medical Records System bridges the gap between modern web interfaces and blockchain infrastructure. Instead of relying on centralized databases, this application uses a Soroban smart contract to store cryptographic references to medical records. It ensures that data remains tamper-proof while taking advantage of Stellar's ~5s finality and sub-cent transaction costs.

## What it does
Through a clean, intuitive web interface, the system allows users to interact directly with the Stellar blockchain:
* **Register:** Anyone can register as a patient permissionlessly, turning their Stellar wallet address into their digital identity.
* **Add Record:** Authorized addresses can append new medical records (stored as secure hashes/CIDs) to a patient's profile.
* **View Records:** Users can query the blockchain to view the history and timestamps of uploaded medical records.
* **Access Control:** Designed to give patients control over who can view or append to their sensitive health information.

## Tech Stack
* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Smart Contract:** Rust, Soroban SDK
* **Network:** Stellar Testnet

  ## 🚀 Live Deployment Details
* **Network:** Stellar Testnet
* **Contract Address:** CCETBZNAQ4RL6HDW4B6WI4QD5LDRVDCGHHEEDUVFGP3RJYD45GVTWNOX
* **Stellar Expert Explorer Link:** [View Contract on Stellar Expert] https://lab.stellar.org/smart-contracts/contract-explorer?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;&smartContracts$explorer$contractId=CCETBZNAQ4RL6HDW4B6WI4QD5LDRVDCGHHEEDUVFGP3RJYD45GVTWNOX;;
  
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/108f7c10-3ad2-409e-91ad-c2f527abc65e" />
  UI :
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/67814f02-4caf-4d90-9fde-6e33351d5d2d" />



## Project Structure
The repository is split into two main environments: the frontend client and the on-chain contracts.

```text
.
├── client/                 # Next.js Frontend Application
│   ├── app/                # Next.js App Router (pages, layouts)
│   ├── components/         # Reusable React UI components
│   ├── lib/                # Utility functions and Stellar/Soroban setup
│   ├── package.json        
│   └── next.config.ts      
├── contracts/              # Soroban Smart Contracts
│   ├── contract/           # The core Medical Records contract
│   │   ├── src/            # Rust source code (lib.rs, test.rs)
│   │   └── Cargo.toml      # Contract dependencies
│   ├── Cargo.toml          # Workspace configuration
│   └── Makefile            # Build and deploy scripts
├── .gitignore
└── README.md
