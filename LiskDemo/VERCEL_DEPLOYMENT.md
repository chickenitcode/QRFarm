# 🚀 Deploy QRChain DApp to Vercel

## Quick Start

Your QRChain DApp is ready for deployment! Here's how to deploy it:

### Method 1: One-Click Deploy with Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to your React app
cd qrchain-dapp

# 3. Deploy
vercel

# 4. Follow the prompts:
# - Set up and deploy? Y
# - Project name: qrchain-dapp (or your choice)
# - Directory: ./
```

### Method 2: GitHub + Vercel Dashboard

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

## ✅ Pre-Deployment Checklist

- [x] Smart contract deployed to Lisk Sepolia: `0x3E8d064e21C77bCF6CCB0A630E62fEB149d44eBc`
- [x] React app builds successfully
- [x] Contract address configured in `useContract.js`
- [x] Vercel configuration files created
- [x] Role refresh functionality implemented

## 🔧 Project Configuration

- **Framework**: React 19.1.0 with Create React App
- **Blockchain**: Lisk Sepolia Testnet
- **Contract**: QRChain supply chain management
- **Build Command**: `npm run build`
- **Output Directory**: `build`

## 📱 Features Ready for Production

1. **Wallet Connection** - MetaMask integration
2. **Role Management** - Self-service role assignment with real-time updates
3. **Supply Chain Tracking** - Product creation and tracking
4. **Multi-Actor Support** - Farmers, Transporters, Retailers
5. **Product History** - Complete traceability

## 🌐 Post-Deployment

After deployment, your DApp will be available at:
- `https://your-project-name.vercel.app`

Users can:
1. Connect their MetaMask wallet
2. Switch to Lisk Sepolia testnet
3. Assign themselves roles (Farmer/Transporter/Retailer)
4. Start using the supply chain features

## 🔄 Updates

For future updates:
- Push changes to your GitHub repository
- Vercel will automatically redeploy
- Or use `vercel --prod` for CLI deployments

## 🆘 Troubleshooting

If you encounter issues:
1. Check that users are on Lisk Sepolia testnet
2. Verify the contract address in `useContract.js`
3. Ensure MetaMask is installed and connected
4. Check browser console for any errors

Happy deploying! 🎉
