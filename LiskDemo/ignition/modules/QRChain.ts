// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const QRChainModule = buildModule("QRChainModule", (m) => {
  // Deploy the QRChain contract
  // No constructor parameters needed as the contract initializes with default values
  const qrChain = m.contract("QRChain");

  // Return the deployed contract for potential use in other modules
  return { qrChain };
});

export default QRChainModule;

