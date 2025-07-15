import React, { useState } from 'react';

function FarmerActions({ contract, walletAddress }) {
  const [qrCode, setQrCode] = useState('');
  const [initialStatus, setInitialStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  async function createProduct() {
    if (!contract || !qrCode || !initialStatus) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      
      console.log('Creating product with QR Code:', qrCode);
      const tx = await contract.createProduct(qrCode, initialStatus);
      
      setMessage('Transaction submitted! Waiting for confirmation...');
      setMessageType('info');
      
      const receipt = await tx.wait();
      console.log('Product created successfully:', receipt);
      
      // Get the product ID from the QR code
      const productId = await contract.getProductIdFromQrCode(qrCode);
      
      setMessage(`✅ Product created successfully! Product ID: ${productId}`);
      setMessageType('success');
      
      // Clear form
      setQrCode('');
      setInitialStatus('');
      
    } catch (error) {
      console.error('Error creating product:', error);
      let errorMessage = 'Failed to create product';
      
      if (error.message.includes('Product with this QR code already exists')) {
        errorMessage = 'A product with this QR code already exists';
      } else if (error.message.includes('Only farmers can perform this action')) {
        errorMessage = 'Only farmers can create products';
      }
      
      setMessage(`❌ ${errorMessage}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  }

  const generateQRCode = () => {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setQrCode(`DURIAN_FARM_${randomNum}_${timestamp}`);
  };

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '20px', 
      backgroundColor: '#2d4a2d', 
      borderRadius: '10px',
      border: '2px solid #4CAF50'
    }}>
      <h2>🌾 Farmer Actions</h2>
      <p style={{ fontSize: '14px', color: '#ccc' }}>
        Create new durian products and add them to the supply chain
      </p>
      
      <div style={{ margin: '20px 0' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            QR Code:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Enter unique QR code"
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
            <button
              onClick={generateQRCode}
              style={{
                padding: '10px 15px',
                fontSize: '14px',
                backgroundColor: '#61dafb',
                color: '#282c34',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Generate
            </button>
          </div>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Initial Status:
          </label>
          <select
            value={initialStatus}
            onChange={(e) => setInitialStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          >
            <option value="">Select initial status</option>
            <option value="Freshly Harvested - Grade A Premium">Freshly Harvested - Grade A Premium</option>
            <option value="Freshly Harvested - Grade A">Freshly Harvested - Grade A</option>
            <option value="Freshly Harvested - Grade B">Freshly Harvested - Grade B</option>
            <option value="Organic Harvested - Premium">Organic Harvested - Premium</option>
            <option value="Ready for Transport">Ready for Transport</option>
          </select>
        </div>
        
        <button
          onClick={createProduct}
          disabled={isLoading || !qrCode || !initialStatus}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Creating Product...' : 'Create Product'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div style={{ 
          marginTop: '15px',
          padding: '10px', 
          borderRadius: '5px',
          backgroundColor: messageType === 'success' ? '#1b4d1b' : 
                          messageType === 'error' ? '#4d1b1b' : '#1b3d4d',
          color: messageType === 'success' ? '#4CAF50' : 
                 messageType === 'error' ? '#ff6b6b' : '#61dafb'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default FarmerActions;