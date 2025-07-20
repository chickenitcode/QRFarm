import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import QRChainABI from '../abis/QRChain.json';

const CONTRACT_ADDRESS = "0x3E8d064e21C77bCF6CCB0A630E62fEB149d44eBc"; // Replace with your address

export function useContract(walletAddress, isConnected) {
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(0);
  const [isContractLoading, setIsContractLoading] = useState(false);
  const [roleRefreshTrigger, setRoleRefreshTrigger] = useState(0);

  // Function to refresh user role - call this after role assignments
  const refreshUserRole = async () => {
    if (contract && walletAddress) {
      try {
        const role = await contract.getUserRole(walletAddress);
        setUserRole(Number(role));
      } catch (error) {
        console.error("Error refreshing user role:", error);
      }
    }
  };

  // Function to trigger role refresh (can be called from components)
  const triggerRoleRefresh = () => {
    setRoleRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function initContract() {
      if (window.ethereum && isConnected && walletAddress) {
        try {
          setIsContractLoading(true);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, QRChainABI.abi, signer);
          
          setContract(contractInstance);
          
          // Get user role
          const role = await contractInstance.getUserRole(walletAddress);
          setUserRole(Number(role));
          
        } catch (error) {
          console.error("Error initializing contract:", error);
          setContract(null);
          setUserRole(0);
        } finally {
          setIsContractLoading(false);
        }
      } else {
        setContract(null);
        setUserRole(0);
      }
    }

    initContract();
  }, [walletAddress, isConnected, roleRefreshTrigger]);

  // Effect to listen for role-related events and automatically refresh
  useEffect(() => {
    if (contract && walletAddress) {
      const handleRoleAssigned = (user, role, assignedBy) => {
        if (user.toLowerCase() === walletAddress.toLowerCase()) {
          setUserRole(Number(role));
        }
      };

      const handleRoleRevoked = (user, previousRole, revokedBy) => {
        if (user.toLowerCase() === walletAddress.toLowerCase()) {
          setUserRole(0); // NONE role
        }
      };

      // Listen for events
      contract.on("RoleAssigned", handleRoleAssigned);
      contract.on("RoleRevoked", handleRoleRevoked);

      // Cleanup listeners
      return () => {
        contract.off("RoleAssigned", handleRoleAssigned);
        contract.off("RoleRevoked", handleRoleRevoked);
      };
    }
  }, [contract, walletAddress]);

  return {
    contract,
    userRole,
    isContractLoading,
    contractAddress: CONTRACT_ADDRESS,
    refreshUserRole,
    triggerRoleRefresh
  };
}