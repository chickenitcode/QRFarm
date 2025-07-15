import React, { useState } from 'react';

function TransporterActions({ contract, walletAddress }) {
  const [productId, setProductId] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  async function updateLocation() {
    if (!contract || !productId || !location || !status) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      
      console.log('Updating product location:', { productId, location, status });
      const tx = await contract.updateProductLocation(productId, location, status);
      
      setMessage('Transaction submitted! Waiting for confirmation...');
      setMessageType('info');
      
      const receipt = await tx.wait();
      console.log('Location updated successfully:', receipt);
      
      setMessage(`✅ Product location updated successfully!`);
      setMessageType('success');
      
      // Clear form
      setProductId('');
      setLocation('');
      setStatus('');
      
    } catch (error) {
      console.error('Error updating location:', error);
      let errorMessage = 'Failed to update product location';
      
      if (error.message.includes('Product does not exist')) {
        errorMessage = 'Product with this ID does not exist';
      } else if (error.message.includes('Only transporters can perform this action')) {
        errorMessage = 'Only transporters can update product locations';
      }
      
      setMessage(`❌ ${errorMessage}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  }

  const locationPresets = [
    "Farm Gate - Pickup Point",
    "Highway Rest Area - Quality Control Station",
    "Distribution Center - Kuala Lumpur",
    "Distribution Center - Penang",
    "Cold Storage Facility",
    "Border Checkpoint",
    "Retail Store - Delivery Point"
  ];

  const statusPresets = [
    "Picked up - Temperature controlled transport",
    "In Transit - Cold chain maintained",
    "Quality inspection passed",
    "At checkpoint - Documentation verified",
    "Arrived at distribution center",
    "Sorted and prepared for delivery",
    "Out for final delivery",
    "Delivered to retailer"
  ];

  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '20px', 
      backgroundColor: '#2d3a4d', 
      borderRadius: '10px',
      border: '2px solid #2196F3'
    }}>
      <h2>🚛 Transporter Actions</h2>
      <p style={{ fontSize: '14px', color: '#ccc' }}>
        Update product locations and transportation status
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
            Location:
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              marginBottom: '5px'
            }}
          >
            <option value="">Select location or enter custom</option>
            {locationPresets.map((preset, index) => (
              <option key={index} value={preset}>{preset}</option>
            ))}
          </select>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Or enter custom location"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '14px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Status:
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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
          onClick={updateLocation}
          disabled={isLoading || !productId || !location || !status}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Updating Location...' : 'Update Product Location'}
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

export default TransporterActions;