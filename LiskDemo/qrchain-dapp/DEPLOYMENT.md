# QRChain DApp Deployment

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy from the qrchain-dapp directory:
   ```bash
   cd qrchain-dapp
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name: **qrchain-dapp** (or your preferred name)
   - In which directory is your code located? **./**

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a React app
5. Click "Deploy"

### Option 3: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub account to Vercel
3. Import the repository
4. Vercel will automatically deploy on every push

## Environment Variables

If you need to set environment variables for production:

1. In Vercel dashboard, go to your project
2. Go to Settings → Environment Variables
3. Add any required variables

## Build Configuration

The app is configured with:
- Build command: `npm run build`
- Output directory: `build`
- Node.js version: 18.x (default)

## Post-Deployment

After deployment:
1. Your DApp will be available at the Vercel URL
2. Users can connect their MetaMask wallets
3. Make sure the smart contract is deployed on the network you're targeting
4. Update the `CONTRACT_ADDRESS` in `src/hooks/useContract.js` if needed

## Smart Contract Deployment

Don't forget to deploy your smart contract to the desired network:

```bash
# For Lisk Sepolia testnet
npx hardhat ignition deploy ./ignition/modules/QRChain.ts --network lisk-sepolia

# Update the CONTRACT_ADDRESS in useContract.js with the deployed address
```
