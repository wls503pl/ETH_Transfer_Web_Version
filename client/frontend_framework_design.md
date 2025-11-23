# Frontend Framework Development Guide

**Author:** Peile Wu  
**Email:** peile.wu.1990@gmail.com  
**Date:** November 15, 2025

---

## Project Foundation

### Frontend Setup with Vite

The `client/` directory contains the React application built with **Vite** instead of Create React App for better performance and developer experience.

**Advantages of Vite over CRA:**

- Significantly faster startup speed (milliseconds vs seconds)
- Faster Hot Module Replacement (HMR) for instant file updates
- More efficient bundling with Rollup
- Simpler configuration out of the box

**Installation:**

```bash
npm create vite@latest
```

When prompted, select React framework and JavaScript variant.

### Tailwind CSS Integration

**Tailwind CSS** is used for utility-first styling with predefined classes.

**Installation:**

```bash
npm install tailwindcss @tailwindcss/vite
```

Configure `vite.config.js`:

```javascript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});
```

Import in `src/index.css`:

```css
@import "tailwindcss";
```

### Context API Integration

The application uses React Context API for state management via `TransactionContext`, eliminating the need for prop drilling and providing centralized transaction handling.

---

## Welcome Component

### Overview

The Welcome component is the hero section of the ETH Transfer application, featuring wallet connection, transaction form, and feature highlights.

### Key Features

- **Hero Section:** Gradient headline with call-to-action
- **Wallet Connection:** Connect to MetaMask wallet
- **Feature Grid:** Six-cell grid displaying platform benefits
- **Ethereum Card:** Metallic card showing wallet info
- **Transaction Form:** Input fields for address, amount, keyword, and message
- **Responsive Design:** Mobile-first layout with Tailwind breakpoints

### Component Structure

**Left Section:**

- Main headline with gradient text effect
- Description and benefits overview
- Connect Wallet button (conditionally rendered based on connection status)
- Feature grid (Reliability, Security, Ethereum, Web 3.0, Low fees, Blockchain)

**Right Section:**

- Silver metallic Ethereum card
- Transaction form with four input fields
- Send transaction button

### Context Integration

The Welcome component consumes TransactionContext to access:

```javascript
const {
  connectWallet,
  currentAccount,
  formData,
  sendTransaction,
  handleChange,
} = useContext(TransactionContext);
```

**Key Props:**

- `connectWallet()` - Initiates MetaMask connection
- `currentAccount` - Connected wallet address
- `formData` - Transaction form state (addressTo, amount, keyword, message)
- `handleChange()` - Updates form field values
- `sendTransaction()` - Submits transaction to blockchain

### Form Handling

Input validation ensures all fields are populated before transaction submission:

```javascript
const handleSubmit = (e) => {
  const { addressTo, amount, keyword, message } = formData;
  e.preventDefault();

  if (!addressTo || !amount || !keyword || !message) return;

  sendTransaction();
};
```

### Input Component

Reusable Input component for form fields:

```javascript
const Input = ({ placeholder, name, type, value, handleChange }) => (
  <input
    placeholder={placeholder}
    type={type}
    step="0.0001"
    value={value}
    onChange={(e) => handleChange(e, name)}
    className="my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white border-none text-sm white-glassmorphism"
  />
);
```

### Styling

**Custom CSS Classes Used:**

- `.text-gradient` - Radial gradient effect on headline
- `.silver-card` - Metallic card styling with 3D effects
- `.blue-glassmorphism` - Semi-transparent blue glassmorphism for form container
- `.white-glassmorphism` - White glassmorphism for input fields and buttons

**Responsive Breakpoints:**

- Mobile (default): Single column, stacked layout
- Tablet (md): Two-column with adjusted spacing
- Desktop (lg+): Side-by-side optimized layout

### Welcome Component Display

![Welcome Page Component](../../img/components/welcome/welcome_page.png)

---

## Context & State Management

### TransactionContext Overview

Centralized state management for all transaction-related operations and wallet connectivity.

### Provider Setup

Wrap the application with `TransactionProvider` in `main.jsx`:

```javascript
import { TransactionProvider } from "./context/TransactionContext";

createRoot(document.getElementById("root")).render(
  <TransactionProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </TransactionProvider>
);
```

### Core Functions

#### checkIfWalletIsConnected()

Automatically checks if a wallet is already connected when the app loads:

```javascript
const checkIfWalletIsConnected = async () => {
  if (!ethereum) return alert("Please install MetaMask first.");

  const accounts = await ethereum.request({ method: "eth_accounts" });

  if (accounts.length) {
    setCurrentAccount(accounts[0]);
  }
};
```

#### connectWallet()

Initiates MetaMask connection request:

```javascript
const connectWallet = async () => {
  if (!ethereum) return alert("Please install MetaMask first.");

  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });

  setCurrentAccount(accounts[0]);
};
```

#### handleChange()

Updates form field state during user input:

```javascript
const handleChange = (e, name) => {
  setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
};
```

#### sendTransaction()

Processes and sends transaction to blockchain:

```javascript
const sendTransaction = async () => {
  if (!ethereum) return alert("Please install MetaMask first.");

  const { addressTo, amount, keyword, message } = formData;

  // Get signer and contract instance
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  // Parse ETH amount
  const parsedAmount = ethers.parseEther(amount);

  // Execute transaction
  await ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        from: currentAccount,
        to: addressTo,
        gas: "0x5208",
        value: parsedAmount.toString(16),
      },
    ],
  });

  // Record on blockchain
  const transactionHash = await transactionContract.addToBlockchain(
    addressTo,
    parsedAmount,
    message,
    keyword
  );

  setIsLoading(true);
  await transactionHash.wait();
  setIsLoading(false);

  // Reset form
  setFormData({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
};
```

### Ethers.js v6 Updates

The context uses modern Ethers.js v6 API:

- `ethers.BrowserProvider()` instead of `ethers.providers.Web3Provider()`
- `ethers.parseEther()` instead of `ethers.utils.parseEther()`
- `provider.getSigner()` returns Promise
- `.toString(16)` for hex conversion of BigInt values

### Context Value Export

The provider exports:

```javascript
{
  connectWallet,
  currentAccount,
  formData,
  setFormData,
  handleChange,
  sendTransaction,
}
```

---

## Best Practices

1. **Always check MetaMask availability** before making requests
2. **Validate form inputs** before submitting transactions
3. **Handle loading states** during blockchain operations
4. **Clear form data** after successful transactions
5. **Use ethers.js v6** for latest Web3 compatibility
