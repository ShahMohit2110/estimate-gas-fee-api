# ⚡ Ethereum Contract Utility API (Gas Estimator + ETH Tools)

This is a powerful **TypeScript + Express.js** backend API built using **Ethers.js** that provides Ethereum developers with useful tools like:

- 🔍 Gas fee estimation for smart contract function calls
- 🔁 Read-only (view/pure) smart contract execution
- 💵 ETH price in USD (via CoinGecko)
- ⛽ Current Ethereum gas price
- 🧱 Recent Ethereum block details


---

# ⚡ Ethereum Contract Utility API  
### (Gas Estimator + ETH Tools + View Function Executor)

This is a powerful backend API built using **TypeScript**, **Express.js**, and **Ethers.js** to help Ethereum developers and dApps by providing:

- 🔍 Gas fee estimation for smart contract function calls  
- 🔁 Read-only (view/pure) smart contract execution  
- 💵 ETH price in USD (via CoinGecko)  
- ⛽ Current Ethereum gas price  
- 🧱 Recent Ethereum block details  

---

## 🧰 Technologies Used

| Tech               | Description                                       |
|--------------------|---------------------------------------------------|
| **TypeScript**     | Strongly typed language for safer backend logic   |
| **Express.js**     | Lightweight web framework for building APIs       |
| **Ethers.js v6**   | Interacts with Ethereum blockchain & contracts    |
| **Infura**         | Ethereum node provider (via `INFURA_URL`)         |
| **CoinGecko API**  | Fetches real-time ETH/USD price data              |
| **Axios**          | Makes HTTP requests (e.g., to CoinGecko API)      |
| **Dotenv**         | Manages environment variables (e.g., Infura key)  |
| **ts-node-dev**    | Live-reloading during development                 |


## 🏗️ Project Structure
```

estimate-gas-fee-api/
├── .env # Environment config (Infura URL)
├── package.json # Project dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── README.md # Project documentation
└── src/
├── index.ts # App entry point
└── routes/
└── gas.ts # Main route logic

```

---

## 🚀 Features

✅ Estimate gas before sending any Ethereum transaction  
✅ Auto-detect view/pure functions and return their output  
✅ Fetch real-time ETH/USD price via CoinGecko  
✅ Get current Ethereum gas price  
✅ Get latest Ethereum blocks with timestamp, validator, tx count, etc.

---

## 📦 Installation

Follow these steps to set up and run the project locally:

---

### 🔧 Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/estimate-gas-fee-api.git
cd estimate-gas-fee-api

```

### 📦 Step 2: Install Dependencies
```bash
npm install
```

### 🔐 Step 3: Create .env File
```bash
INFURA_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

### 🛠️ Step 4: Run in Development Mode
```bash
npm run dev
```

### 🚀 Step 5: Test the API
```bash
POST http://localhost:3000/api/gas/estimate
```



## 📬 API Endpoint

### `POST /api/gas/estimate`

Use this one endpoint for all features. The behavior changes based on `functionName` input.

---

### 🔮 1. The USDT balance of 0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE in USDT

```json
{
  "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "abi": [
    {
      "constant": true,
      "inputs": [{ "name": "_owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "balance", "type": "uint256" }],
      "type": "function",
      "stateMutability": "view"
    }
  ],
  "functionName": "balanceOf",
  "args": ["0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"]
}
```
### ⛽ 3. Get Current Gas Price

```json

{
   "functionName": "getGasPrice"
}
```

### 💵 2. Get ETH Price
```json
{
   "functionName": "getEthPrice"
}
```

### 🧱 4. Get Latest Ethereum Blocks
```json
{
   "functionName": "getLatestBlocks",
   "args": ["5"]
}
```

### Example Video
[Video](https://jam.dev/c/c309bd51-bc8c-40a7-a378-19a664281d7e)


