# Full-Stack Medical Records System on Stellar 🏥

A fully decentralized, full-stack application for managing patient healthcare records. Built with a Next.js frontend and powered by Soroban smart contracts on the Stellar network, this dApp provides a secure, permissionless, and immutable way to register patients and log medical records.

🔗 **Live Demo:** [https://medical-records-system-2.vercel.app/](https://medical-records-system-2.vercel.app/)

🎬 **Demo Video:** [Watch 1-min walkthrough]
https://github.com/user-attachments/assets/244b4a59-421f-4b06-9de1-9794b81b2f0f


---

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Caching Strategy](#caching-strategy)
- [Smart Contract](#smart-contract)
- [Live Deployment Details](#-live-deployment-details)
- [Screenshots](#screenshots)

---

## Project Description

The Medical Records System bridges the gap between modern web interfaces and blockchain infrastructure. Instead of relying on centralized databases, this application uses a Soroban smart contract to store cryptographic references to medical records. It ensures that data remains tamper-proof while taking advantage of Stellar's ~5s finality and sub-cent transaction costs.

## Features

Through a clean, intuitive web interface, the system allows users to interact directly with the Stellar blockchain:

- **Register:** Anyone can register as a patient permissionlessly, turning their Stellar wallet address into their digital identity.
- **Add Record:** Authorized addresses can append new medical records (stored as secure hashes/CIDs) to a patient's profile.
- **View Records:** Users can query the blockchain to view the history and timestamps of uploaded medical records.
- **Access Control:** Designed to give patients control over who can view or append to their sensitive health information.
- **Loading States:** Every transaction shows real-time progress indicators (spinner, status toasts, awaiting signature states).
- **Caching:** In-memory TTL-based cache reduces redundant RPC calls for read-only queries.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Smart Contract** | Rust, Soroban SDK |
| **Network** | Stellar Testnet |
| **Wallet** | Freighter Browser Extension |
| **Testing** | Vitest (frontend), Soroban SDK tests (contract) |
| **Deployment** | Vercel |

## Project Structure

```text
.
├── client/                     # Next.js Frontend Application
│   ├── app/                    # Next.js App Router (pages, layouts)
│   ├── components/             # Reusable React UI components
│   │   ├── ui/                 # Base UI primitives (animated-card, badge, etc.)
│   │   ├── Contract.tsx        # Main dApp interaction UI
│   │   └── Navbar.tsx          # Navigation with wallet connect
│   ├── hooks/                  # Stellar/Soroban contract integration
│   │   └── contract.ts         # All contract call wrappers + caching
│   ├── lib/                    # Utility functions
│   │   ├── cache.ts            # In-memory TTL cache for RPC calls
│   │   └── utils.ts            # General utilities
│   ├── __tests__/              # Frontend test suite (Vitest)
│   │   ├── cache.test.ts       # Cache utility tests
│   │   ├── contract.test.ts    # Contract constants & helpers tests
│   │   └── components.test.ts  # Component logic tests
│   ├── package.json
│   ├── vitest.config.ts        # Test runner configuration
│   └── next.config.ts
├── contract/                   # Soroban Smart Contracts
│   └── contracts/contract/
│       ├── src/
│       │   ├── lib.rs          # Smart contract source code
│       │   └── test.rs         # 14 Rust unit tests
│       ├── Cargo.toml
│       └── Makefile
├── vercel.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Freighter Wallet** browser extension ([install](https://www.freighter.app/))
- Switch Freighter to **Testnet** network

### Installation

```bash
# Clone the repository
git clone https://github.com/sohagbanik/medical-records-system-2.git
cd medical-records-system-2

# Install frontend dependencies
cd client
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using the dApp

1. **Connect Wallet** — Click "Connect" in the navbar to link your Freighter wallet.
2. **Register** — Enter your name and register as a patient on-chain.
3. **Add Record** — Enter a patient address and add a medical record (diagnosis, treatment, vaccination, etc.).
4. **View Records** — Query any patient's records by entering their Stellar address.
5. **Access Control** — Grant or revoke access for other addresses to view your records.

## Running Tests

### Frontend Tests (Vitest)

```bash
cd client
npm test
```

This runs the Vitest test suite with **15+ tests** covering:

- **Cache utility** — TTL expiry, get/set, key building, clear/delete
- **Contract helpers** — Constants validation, ScVal conversion functions
- **Component logic** — Address truncation, timestamp formatting, record type config, tab navigation

### Smart Contract Tests (Rust)

```bash
cd contract
cargo test
```

This runs **14 Soroban tests** covering:

- Patient registration & duplicate prevention
- Permissionless record adding
- Access control (grant, revoke, enforce)
- Record retrieval (as patient, as accessor, no access)
- Multiple patients independence

### Test Output Screenshot

<img width="1056" height="353" alt="image" src="https://github.com/user-attachments/assets/ad62a2ca-b169-44f5-a1b8-75bb5622b17d" />


## Caching Strategy

The application implements a **TTL-based in-memory cache** (`client/lib/cache.ts`) to optimize read-only RPC calls to the Soroban network:

| Cached Method | TTL | Invalidated By |
|--------------|-----|----------------|
| `is_registered` | 30s | `register_patient` |
| `get_patient` | 30s | `register_patient` |
| `has_access` | 30s | `grant_access`, `revoke_access` |
| `get_record_count` | 30s | `add_record` |

**How it works:**

1. Read-only calls check the cache first before making an RPC request.
2. Cache hits return instantly, avoiding network latency.
3. Write operations (register, add record, grant/revoke access) automatically invalidate relevant cache entries.
4. All entries expire after 30 seconds to ensure data freshness.

## Smart Contract

The Soroban smart contract (`contract/contracts/contract/src/lib.rs`) implements:

| Method | Auth | Description |
|--------|------|-------------|
| `register_patient` | ✅ Caller auth | Register as a patient on-chain |
| `add_record` | ❌ Permissionless | Add medical records for any registered patient |
| `grant_access` | ✅ Caller auth | Grant an address access to your records |
| `revoke_access` | ✅ Caller auth | Revoke a previously granted access |
| `get_record` | Access check | Retrieve a single record (patient or authorized viewer) |
| `get_records` | Access check | Retrieve all records for a patient |
| `is_registered` | ❌ Public | Check if an address is registered |
| `get_patient` | ❌ Public | Get patient info |
| `has_access` | ❌ Public | Check if access has been granted |
| `get_record_count` | ❌ Public | Count of records for a patient |

## 🚀 Live Deployment Details

| Detail | Value |
|--------|-------|
| **Network** | Stellar Testnet |
| **Contract Address** | `CCETBZNAQ4RL6HDW4B6WI4QD5LDRVDCGHHEEDUVFGP3RJYD45GVTWNOX` |
| **Live URL** | [medical-records-system-2.vercel.app](https://medical-records-system-2.vercel.app/) |
| **Explorer** | [View on Stellar Lab](https://lab.stellar.org/smart-contracts/contract-explorer?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;&smartContracts$explorer$contractId=CCETBZNAQ4RL6HDW4B6WI4QD5LDRVDCGHHEEDUVFGP3RJYD45GVTWNOX;;) |

## Screenshots

### Application UI
<img width="1920" height="1080" alt="Medical Records System UI" src="https://github.com/user-attachments/assets/108f7c10-3ad2-409e-91ad-c2f527abc65e" />

### Contract Interaction
<img width="1920" height="1080" alt="Contract Interaction" src="https://github.com/user-attachments/assets/67814f02-4caf-4d90-9fde-6e33351d5d2d" />

---

## License

This project is open source and available under the [MIT License](LICENSE).
