# CoinVault

Frontend take-home. Plan on about 20 minutes.

Wallet connection is already built. After a user connects, show ETH, dETH, and sETH in the Connected Wallet panel at the top right.

The same balances must stay visible on every page, including mobile: Dashboard, Deposit, Stake, Leaderboard, and Governance.

Only this panel is in scope.

## Balances

The wallet connects on Sepolia (chain ID `11155111`).

| Token | Source |
| --- | --- |
| ETH | Native balance of the connected wallet |
| dETH | Token balance of the connected wallet. Contract address: `NEXT_PUBLIC_DETH_ADDRESS`. ABI: `lib/abis/dETH.json` |
| sETH | Token balance of the connected wallet. Contract address: `NEXT_PUBLIC_SETH_ADDRESS`. ABI: `lib/abis/sETH.json` |

`.env.example` has empty address values. Copy it to `.env.local` in the project root only if you set an address, then restart `npm run dev`.

While an address is empty, show that token as unavailable. When a balance is `0`, show `0.0000`.

Deploying contracts is out of scope.

## Done when

- Balances update after connect, disconnect, and a network change, without a page reload.
- Loading and errors are clear.
- Disconnect shows the Connect Wallet button again, with no leftover balances.

## Run

Node.js 18 or later, and MetaMask on [Sepolia](https://sepolia.etherscan.io/).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Submit

By the end of today, send a short video or a public git repository.
