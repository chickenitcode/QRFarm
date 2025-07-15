import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import QRChainABI from '../abis/QRChain.json';

const CONTRACT_ADDRESS = "0x15f247C1E87359c57eBefB459FFaec3d43d1A693"; // Replace with your address

export function useContract(walletAddress, isConnected) {
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(0);
  const [isContractLoading, setIsContractLoading] = useState(false);

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
  }, [walletAddress, isConnected]);

  return {
    contract,
    userRole,
    isContractLoading,
    contractAddress: CONTRACT_ADDRESS
  };
}