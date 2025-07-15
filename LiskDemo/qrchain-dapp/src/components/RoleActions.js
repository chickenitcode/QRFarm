import React, { useState } from 'react';
import FarmerActions from './FarmerActions';
import TransporterActions from './TransporterActions';
import RetailerActions from './RetailerActions';

function RoleActions({ contract, userRole, walletAddress }) {
  // If no role assigned
  if (userRole === 0) {
    return (
      <div style={{ 
        margin: '20px 0', 
        padding: '20px', 
        backgroundColor: '#4d3c1b', 
        borderRadius: '10px',
        border: '2px solid #FF9800'
      }}>
        <h2>⚠️ No Role Assigned</h2>
        <p style={{ fontSize: '16px', color: '#FFB74D' }}>
          Your wallet address does not have a role assigned in the supply chain system.
        </p>
        <p style={{ fontSize: '14px', color: '#ccc' }}>
          Please contact the contract owner to assign you one of the following roles:
        </p>
        <ul style={{ textAlign: 'left', color: '#ccc' }}>
          <li><strong>🌾 Farmer:</strong> Can create new durian products</li>
          <li><strong>🚛 Transporter:</strong> Can update product locations during transport</li>
          <li><strong>🏪 Retailer:</strong> Can update final product status at retail</li>
        </ul>
        <div style={{ 
          marginTop: '15px',
          padding: '10px', 
          backgroundColor: '#2c2c2c',
          borderRadius: '5px',
          fontSize: '12px',
          wordBreak: 'break-all'
        }}>
          <strong>Your Address:</strong> {walletAddress}
        </div>
      </div>
    );
  }

  // Render role-specific component
  switch (userRole) {
    case 1: // Farmer
      return <FarmerActions contract={contract} walletAddress={walletAddress} />;
    case 2: // Transporter
      return <TransporterActions contract={contract} walletAddress={walletAddress} />;
    case 3: // Retailer
      return <RetailerActions contract={contract} walletAddress={walletAddress} />;
    default:
      return (
        <div style={{ 
          margin: '20px 0', 
          padding: '20px', 
          backgroundColor: '#4d1b1b', 
          borderRadius: '10px',
          border: '2px solid #f44336'
        }}>
          <h2>❌ Unknown Role</h2>
          <p>Unknown role detected. Please contact the administrator.</p>
        </div>
      );
  }
}

export default RoleActions;