import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
import { useContract } from './hooks/useContract';
import { useWallet } from './hooks/useWallet';
import ProductHistory from './components/ProductHistory';
import RoleActions from './components/RoleActions';

function App() {
  const { walletAddress, isConnected, isLoading, connectWallet, disconnectWallet } = useWallet();
  const { contract, userRole, isContractLoading, contractAddress } = useContract(walletAddress, isConnected);

  // Get role name function
  function getRoleName(role) {
    switch(role) {
      case 1: return "🌾 Farmer";
      case 2: return "🚛 Transporter";
      case 3: return "🏪 Retailer";
      default: return "❌ No Role";
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>🥭 QRChain Durian Supply Chain</h1>
        
        {/* Wallet Connection Section */}
        <div style={{ margin: '20px 0' }}>
          {!isConnected ? (
            <button 
              onClick={connectWallet}
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: isLoading ? '#ccc' : '#61dafb',
                color: '#282c34',
                border: 'none',
                borderRadius: '5px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div>
              <p>✅ Wallet Connected</p>
              <p style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                Address: {walletAddress}
              </p>
              <button 
                onClick={disconnectWallet}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Contract Status Section */}
        {contract && (
          <div style={{ margin: '20px 0', padding: '10px', backgroundColor: '#282c34', borderRadius: '5px' }}>
            <p>📋 Smart Contract Connected</p>
            <p>🔗 Address: {contractAddress}</p>
            <p>👤 Your Role: {getRoleName(userRole)}</p>
          </div>
        )}

        {/* Role-Based Actions */}
        {contract && (
          <RoleActions 
            contract={contract} 
            userRole={userRole} 
            walletAddress={walletAddress} 
          />
        )}

        {/* Product History Component */}
        {contract && <ProductHistory contract={contract} />}

        {/* Loading State */}
        {isContractLoading && (
          <div style={{ margin: '20px 0' }}>
            <p>⏳ Loading contract...</p>
          </div>
        )}

        <p>
          Blockchain-based durian supply chain tracking system
        </p>
      </header>
    </div>
  );
}

export default App;
