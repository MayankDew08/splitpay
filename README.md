# SplitPay - Stellar Expense Sharing

SplitPay is a decentralized expense sharing application built on the Stellar blockchain. It allows users to create groups, track expenses, and settle balances fairly using Soroban smart contracts.

## Features

- **Wallet Integration**: Connect seamlessly with the Freighter wallet.
- **Group Management**: Create expense groups with multiple members.
- **Expense Tracking**: Add expenses that are automatically split among group members.
- **On-Chain Settlement**: Settle balances and distribute funds directly through smart contracts.
- **Real-Time Updates**: UI updates automatically once transactions are confirmed on-chain.
- **Modern UI**: A responsive, gradient-based dashboard built with Next.js and Tailwind CSS.

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Blockchain**: Stellar SDK, Soroban RPC
- **Wallet**: Freighter API
- **Smart Contracts**: Rust (Soroban SDK)

## Getting Started

### Prerequisites

- Node.js (v18+)
- Freighter Wallet extension installed in your browser.
- A Stellar Testnet account with some XLM (use Friendbot to fund).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MayankDew08/splitpay.git
   cd splitpay
   ```

2. Install dependencies for the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the `frontend` directory with the following:
   ```env
   NEXT_PUBLIC_CONTRACT_ID=your_contract_id
   NEXT_PUBLIC_TOKEN_ID=your_token_id (e.g., native XLM SAC or custom token)
   NEXT_PUBLIC_NETWORK=testnet
   NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
   NEXT_PUBLIC_SOROBAN_URL=https://soroban-testnet.stellar.org
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Smart Contract

The smart contract is located in `/contracts/splitpay`. It handles:
- Group creation and member management.
- State-based expense recording.
- Automated balance calculations.
- Secure fund distribution during settlement.

## License

This project is licensed under the MIT License.
