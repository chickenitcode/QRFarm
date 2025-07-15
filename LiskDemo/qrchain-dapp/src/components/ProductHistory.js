import React, { useState } from 'react';

function ProductHistory({ contract }) {
  const [productId, setProductId] = useState('');
  const [productHistory, setProductHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function viewProductHistory() {
    if (!contract || !productId) {
      setError('Please enter a valid product ID');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const history = await contract.getProductHistory(productId);
      console.log('Product history:', history);
      
      // Convert the history to a more readable format
      const formattedHistory = history.map((entry, index) => ({
        step: index + 1,
        actor: entry.actor,
        timestamp: new Date(Number(entry.timestamp) * 1000).toLocaleString(),
        location: entry.location,
        status: entry.status,
        note: entry.note
      }));
      
      setProductHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching product history:', error);
      setError('Failed to fetch product history. Product may not exist.');
    } finally {
      setIsLoading(false);
    }
  }

  function clearHistory() {
    setProductHistory([]);
    setProductId('');
    setError('');
  }

  function getActorIcon(actor) {
    // You could enhance this by checking the actor's role
    return "👤";
  }

  return (
    <div style={{ 
      margin: '30px 0', 
      padding: '20px', 
      backgroundColor: '#1e1e1e', 
      borderRadius: '10px',
      maxWidth: '800px',
      width: '90%'
    }}>
      <h2>🔍 View Product History</h2>
      
      {/* Input Section */}
      <div style={{ margin: '20px 0' }}>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter Product ID (e.g., 1, 2, 3...)"
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px',
            width: '200px'
          }}
        />
        <button
          onClick={viewProductHistory}
          disabled={isLoading || !productId}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isLoading ? 'Loading...' : 'View History'}
        </button>
        {productHistory.length > 0 && (
          <button
            onClick={clearHistory}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ 
          color: '#ff6b6b', 
          backgroundColor: '#2c1810', 
          padding: '10px', 
          borderRadius: '5px',
          margin: '10px 0'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Product History Display */}
      {productHistory.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>📊 Product ID: {productId} - Supply Chain History</h3>
          <p style={{ fontSize: '14px', color: '#ccc' }}>
            Total Steps: {productHistory.length}
          </p>
          
          <div style={{ textAlign: 'left' }}>
            {productHistory.map((entry, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: '#282c34',
                  margin: '10px 0',
                  padding: '15px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #61dafb'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <h4 style={{ margin: 0, color: '#61dafb' }}>
                    Step {entry.step}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#ccc' }}>
                    {entry.timestamp}
                  </span>
                </div>
                
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  <p><strong>👤 Actor:</strong> {entry.actor}</p>
                  <p><strong>📍 Location:</strong> {entry.location}</p>
                  <p><strong>📝 Status:</strong> {entry.status}</p>
                  <p><strong>💬 Note:</strong> {entry.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductHistory;