import React, { useState } from 'react';

function RetailerActions({ contract, walletAddress }) {
  const [productId, setProductId] = useState('');
  const [finalStatus, setFinalStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  async function updateStatus() {
    if (!contract || !productId || !finalStatus) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      
      console.log('Updating product status:', { productId, finalStatus });
      const tx = await contract.updateProductStatus(productId, finalStatus);
      
      setMessage('Transaction submitted! Waiting for confirmation...');
      setMessageType('info');
      
      const receipt = await tx.wait();
      console.log('Status updated successfully:', receipt);
      
      setMessage(`✅ Product status updated successfully!`);
      setMessageType('success');
      
      // Clear form
      setProductId('');
      setFinalStatus('');
      
    } catch (error) {
      console.error('Error updating status:', error);
      let errorMessage = 'Failed to update product status';
      
      if (error.message.includes('Product does not exist')) {
        errorMessage = 'Product with this ID does not exist';
      } else if (error.message.includes('Only retailers can perform this action')) {
        errorMessage = 'Only retailers can update product status';
      }
      
      setMessage(`❌ ${errorMessage}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  }

  const statusPresets = [
    "Received and inspected - Quality Grade A confirmed",
    "Received and inspected - Quality Grade B",
    "Quality inspection failed - Product rejected",
    "Prepared for display - Price: RM 45/kg",
    "Prepared for display - Price: RM 35/kg",
    "On sale - Premium display area",
    "On sale - Regular display area",
    "SOLD - Customer: Premium Restaurant Chain",
    "SOLD - Customer: Local Market",
    "SOLD - Customer: Export Company",
    "Expired - Removed from sale",
    "Damaged during handling"
  ];

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '20px', 
      backgroundColor: '#4d2d3a', 
      borderRadius: '10px',
      border: '2px solid #9C27B0'
    }}>
      <h2>🏪 Retailer Actions</h2>
      <p style={{ fontSize: '14px', color: '#ccc' }}>
        Update final product status and retail operations
      </p>
      
      <div style={{ margin: '20px 0' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Product ID:
          </label>
          <input
            type="number"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter product ID (e.g., 1, 2, 3...)"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Final Status:
          </label>
          <select
            value={finalStatus}
            onChange={(e) => setFinalStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginBottom: '5px'
            }}
          >
            <option value="">Select status or enter custom</option>
            {statusPresets.map((preset, index) => (
              <option key={index} value={preset}>{preset}</option>
            ))}
          </select>
          <input
            type="text"
            value={finalStatus}
            onChange={(e) => setFinalStatus(e.target.value)}
            placeholder="Or enter custom status"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <button
          onClick={updateStatus}
          disabled={isLoading || !productId || !finalStatus}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Updating Status...' : 'Update Product Status'}
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

export default RetailerActions;