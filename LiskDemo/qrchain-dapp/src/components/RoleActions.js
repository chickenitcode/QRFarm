import React, { useState } from 'react';
import FarmerActions from './FarmerActions';
import TransporterActions from './TransporterActions';
import RetailerActions from './RetailerActions';

function RoleActions({ contract, userRole, walletAddress, onRoleUpdate }) {
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');

  // Function to assign role to self
  const assignRoleToSelf = async (roleNumber) => {
    if (!contract) return;
    
    setIsAssigningRole(true);
    setAssignmentError('');
    setAssignmentSuccess('');
    
    try {
      // Call the assignRole function with user's own address
      const tx = await contract.assignRole(walletAddress, roleNumber);
      
      // Show loading message
      setAssignmentSuccess(`Assigning role... Transaction hash: ${tx.hash}`);
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Update success message
      const roleNames = ['None', 'Farmer', 'Transporter', 'Retailer'];
      setAssignmentSuccess(`✅ Successfully assigned ${roleNames[roleNumber]} role to your wallet!`);
      
      // Call parent component to refresh user role immediately
      if (onRoleUpdate) {
        onRoleUpdate();
      }
      
    } catch (error) {
      console.error('Error assigning role:', error);
      setAssignmentError(`❌ Failed to assign role: ${error.message}`);
    } finally {
      setIsAssigningRole(false);
    }
  };

  // If no role assigned, show self-assignment interface
  if (userRole === 0) {
    return (
      <div style={{ 
        margin: '20px 0', 
        padding: '20px', 
        backgroundColor: '#4d3c1b', 
        borderRadius: '10px',
        border: '2px solid #FF9800'
      }}>
        <h2>🎯 Join the Supply Chain</h2>
        <p style={{ fontSize: '16px', color: '#FFB74D', marginBottom: '20px' }}>
          Welcome! You can assign yourself a role in the durian supply chain system.
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#FFB74D', marginBottom: '15px' }}>Choose Your Role:</h3>
          
          {/* Farmer Role Button */}
          <div style={{ 
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#2c4a2c',
            borderRadius: '8px',
            border: '1px solid #4CAF50'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#4CAF50' }}>🌾 Farmer</h4>
                <p style={{ margin: '0', fontSize: '14px', color: '#ccc' }}>
                  Create new durian products and manage harvest information
                </p>
              </div>
              <button
                onClick={() => assignRoleToSelf(1)}
                disabled={isAssigningRole}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isAssigningRole ? 'not-allowed' : 'pointer',
                  opacity: isAssigningRole ? 0.6 : 1
                }}
              >
                {isAssigningRole ? 'Assigning...' : 'Become Farmer'}
              </button>
            </div>
          </div>

          {/* Transporter Role Button */}
          <div style={{ 
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#2c3a4a',
            borderRadius: '8px',
            border: '1px solid #2196F3'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#2196F3' }}>🚛 Transporter</h4>
                <p style={{ margin: '0', fontSize: '14px', color: '#ccc' }}>
                  Update product locations and transportation status
                </p>
              </div>
              <button
                onClick={() => assignRoleToSelf(2)}
                disabled={isAssigningRole}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isAssigningRole ? 'not-allowed' : 'pointer',
                  opacity: isAssigningRole ? 0.6 : 1
                }}
              >
                {isAssigningRole ? 'Assigning...' : 'Become Transporter'}
              </button>
            </div>
          </div>

          {/* Retailer Role Button */}
          <div style={{ 
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#4a2c4a',
            borderRadius: '8px',
            border: '1px solid #9C27B0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#9C27B0' }}>🏪 Retailer</h4>
                <p style={{ margin: '0', fontSize: '14px', color: '#ccc' }}>
                  Update final product status and retail information
                </p>
              </div>
              <button
                onClick={() => assignRoleToSelf(3)}
                disabled={isAssigningRole}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isAssigningRole ? 'not-allowed' : 'pointer',
                  opacity: isAssigningRole ? 0.6 : 1
                }}
              >
                {isAssigningRole ? 'Assigning...' : 'Become Retailer'}
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {assignmentSuccess && (
          <div style={{
            padding: '15px',
            backgroundColor: '#1b4d1b',
            borderRadius: '8px',
            border: '1px solid #4CAF50',
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0', color: '#4CAF50', fontSize: '14px' }}>
              {assignmentSuccess}
            </p>
          </div>
        )}

        {/* Error Message */}
        {assignmentError && (
          <div style={{
            padding: '15px',
            backgroundColor: '#4d1b1b',
            borderRadius: '8px',
            border: '1px solid #f44336',
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0', color: '#f44336', fontSize: '14px' }}>
              {assignmentError}
            </p>
          </div>
        )}

        {/* Wallet Address Display */}
        <div style={{ 
          marginTop: '20px',
          padding: '10px', 
          backgroundColor: '#2c2c2c',
          borderRadius: '5px',
          fontSize: '12px',
          wordBreak: 'break-all'
        }}>
          <strong style={{ color: '#FFB74D' }}>Your Wallet Address:</strong>
          <br />
          <span style={{ color: '#ccc' }}>{walletAddress}</span>
        </div>

        {/* Additional Info */}
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#1a1a1a',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#aaa'
        }}>
          <p style={{ margin: '0 0 5px 0' }}>
            💡 <strong>Self-Service:</strong> You can now assign roles to yourself without waiting for an administrator.
          </p>
          <p style={{ margin: '0' }}>
            🔄 <strong>Role Changes:</strong> You can change your role at any time by returning to this page.
          </p>
        </div>
      </div>
    );
  }

  // Role Change Interface (for users who already have a role)
  const RoleChangeInterface = () => {
    const roleNames = ['None', 'Farmer', 'Transporter', 'Retailer'];
    const currentRoleName = roleNames[userRole];
    
    return (
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        border: '1px solid #666'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#FFB74D' }}>
          🔄 Change Your Role
        </h3>
        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#ccc' }}>
          Current Role: <strong style={{ color: '#4CAF50' }}>{currentRoleName}</strong>
        </p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {userRole !== 1 && (
            <button
              onClick={() => assignRoleToSelf(1)}
              disabled={isAssigningRole}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isAssigningRole ? 'not-allowed' : 'pointer',
                opacity: isAssigningRole ? 0.6 : 1,
                fontSize: '12px'
              }}
            >
              🌾 Switch to Farmer
            </button>
          )}
          
          {userRole !== 2 && (
            <button
              onClick={() => assignRoleToSelf(2)}
              disabled={isAssigningRole}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isAssigningRole ? 'not-allowed' : 'pointer',
                opacity: isAssigningRole ? 0.6 : 1,
                fontSize: '12px'
              }}
            >
              🚛 Switch to Transporter
            </button>
          )}
          
          {userRole !== 3 && (
            <button
              onClick={() => assignRoleToSelf(3)}
              disabled={isAssigningRole}
              style={{
                padding: '8px 16px',
                backgroundColor: '#9C27B0',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isAssigningRole ? 'not-allowed' : 'pointer',
                opacity: isAssigningRole ? 0.6 : 1,
                fontSize: '12px'
              }}
            >
              🏪 Switch to Retailer
            </button>
          )}
        </div>

        {/* Status Messages for Role Changes */}
        {assignmentSuccess && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#1b4d1b',
            borderRadius: '5px',
            border: '1px solid #4CAF50'
          }}>
            <p style={{ margin: '0', color: '#4CAF50', fontSize: '12px' }}>
              {assignmentSuccess}
            </p>
          </div>
        )}

        {assignmentError && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#4d1b1b',
            borderRadius: '5px',
            border: '1px solid #f44336'
          }}>
            <p style={{ margin: '0', color: '#f44336', fontSize: '12px' }}>
              {assignmentError}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render role-specific component with role change interface
  return (
    <div>
      <RoleChangeInterface />
      
      {/* Render the appropriate role component */}
      {userRole === 1 && <FarmerActions contract={contract} walletAddress={walletAddress} />}
      {userRole === 2 && <TransporterActions contract={contract} walletAddress={walletAddress} />}
      {userRole === 3 && <RetailerActions contract={contract} walletAddress={walletAddress} />}
      
      {userRole > 3 && (
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
      )}
    </div>
  );
}

export default RoleActions;