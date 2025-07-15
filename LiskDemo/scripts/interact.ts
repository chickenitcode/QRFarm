import { ethers } from "hardhat";
import { QRChain } from "../typechain-types";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  console.log("🥭 QRChain Durian Supply Chain Interaction Script");
  console.log("================================================\n");

  // Get provider
  const provider = ethers.provider;

  // Get private keys from environment variables
  const farmerPrivateKey = process.env.PRIVATE_KEY_FARMER!;
  const transporterPrivateKey = process.env.PRIVATE_KEY_TRANSPORTER!;
  const retailerPrivateKey = process.env.PRIVATE_KEY_RETAILER!;

  // Create wallet instances
  const farmer = new ethers.Wallet(farmerPrivateKey, provider);
  const transporter = new ethers.Wallet(transporterPrivateKey, provider);
  const retailer = new ethers.Wallet(retailerPrivateKey, provider);
  
  console.log("👥 Supply Chain Actors:");
  console.log(`🌾 Farmer: ${farmer.address}`);
  console.log(`🚛 Transporter: ${transporter.address}`);
  console.log(`🏪 Retailer: ${retailer.address}\n`);

  // Get the deployed contract
  const contractAddress = process.env.CONTRACT_ADDRESS || "0x15f247C1E87359c57eBefB459FFaec3d43d1A693";
  const qrChain = await ethers.getContractAt("QRChain", contractAddress) as QRChain;

  console.log(`📋 Contract Address: ${contractAddress}\n`);

  try {
    // ===========================================
    // STEP 0: SETUP ROLES (NEW STEP)
    // ===========================================
    console.log("🔧 STEP 0: Setting Up Roles");
    console.log("============================");

    // Get the contract owner (deployer)
    const owner = await qrChain.owner();
    console.log(`👑 Contract Owner: ${owner}`);

    // Create owner wallet from the first signer (assuming deployer is first signer)
    const [ownerSigner] = await ethers.getSigners();
    console.log(`🔑 Owner Signer: ${ownerSigner.address}`);

    // Assign roles to each actor
    console.log("📝 Assigning roles...");
    
    await qrChain.connect(ownerSigner).assignRole(farmer.address, 1); // Role.FARMER
    console.log("✅ Farmer role assigned");
    
    await qrChain.connect(ownerSigner).assignRole(transporter.address, 2); // Role.TRANSPORTER
    console.log("✅ Transporter role assigned");
    
    await qrChain.connect(ownerSigner).assignRole(retailer.address, 3); // Role.RETAILER
    console.log("✅ Retailer role assigned");

    // Verify roles
    console.log("\n🔍 Verifying roles:");
    console.log(`🌾 Farmer role: ${await qrChain.getUserRole(farmer.address)}`);
    console.log(`🚛 Transporter role: ${await qrChain.getUserRole(transporter.address)}`);
    console.log(`🏪 Retailer role: ${await qrChain.getUserRole(retailer.address)}\n`);

    // ===========================================
    // STEP 1: FARMER CREATES DURIAN PRODUCT
    // ===========================================
    console.log("🌾 STEP 1: Farmer Creates Durian Product");
    console.log("==========================================");
    
    const qrCode = "DURIAN_FARM_002_20250715";
    const initialStatus = "Freshly Harvested - Grade Apple Premium";
    
    console.log(`📱 QR Code: ${qrCode}`);
    console.log(`📝 Initial Status: ${initialStatus}`);
    
    const createTx = await qrChain.connect(farmer).createProduct(qrCode, initialStatus);
    const createReceipt = await createTx.wait();
    
    console.log(`✅ Product created! Transaction hash: ${createReceipt?.hash}`);
    
    // Get the actual product ID
    const productId = await qrChain.getProductIdFromQrCode(qrCode);
    console.log(`🔢 Product ID: ${productId}\n`);

    // ===========================================
    // STEP 2: TRANSPORTATION PHASE
    // ===========================================
    console.log("🚛 STEP 2: Transportation Phase");
    console.log("================================");

    // Transportation Update 1: Pickup from farm
    console.log("📍 Update 1: Pickup from Farm");
    const pickup = await qrChain.connect(transporter).updateProductLocation(
      productId, 
      "Durian Farm - Penang, Malaysia", 
      "Picked up - Temperature controlled transport"
    );
    await pickup.wait();
    console.log("✅ Pickup status updated");

    // Transportation Update 2: Quality checkpoint
    console.log("📍 Update 2: Quality Checkpoint");
    const checkpoint1 = await qrChain.connect(transporter).updateProductLocation(
      productId, 
      "Highway Rest Area - Quality Control Station", 
      "Quality inspection passed - Temperature: 15°C"
    );
    await checkpoint1.wait();
    console.log("✅ Quality checkpoint passed");

    // Transportation Update 3: Distribution center
    console.log("📍 Update 3: Distribution Center");
    const distribution = await qrChain.connect(transporter).updateProductLocation(
      productId, 
      "Kuala Lumpur Distribution Center", 
      "Sorted and prepared for final delivery"
    );
    await distribution.wait();
    console.log("✅ Distribution center processing complete");

    // Transportation Update 4: Final delivery
    console.log("📍 Update 4: Final Delivery");
    const delivery = await qrChain.connect(transporter).updateProductLocation(
      productId, 
      "Premium Fruit Market - KLCC", 
      "Delivered to retailer - Cold chain maintained"
    );
    await delivery.wait();
    console.log("✅ Final delivery completed\n");

    // ===========================================
    // STEP 3: RETAIL PHASE
    // ===========================================
    console.log("🏪 STEP 3: Retail Phase");
    console.log("=======================");

    // Retail Update 1: Receiving inspection
    console.log("📦 Update 1: Receiving Inspection");
    const receiving = await qrChain.connect(retailer).updateProductStatus(
      productId, 
      "Received and inspected - Quality Grade A confirmed"
    );
    await receiving.wait();
    console.log("✅ Receiving inspection completed");

    // Retail Update 2: Display preparation
    console.log("🛒 Update 2: Display Preparation");
    const display = await qrChain.connect(retailer).updateProductStatus(
      productId, 
      "Prepared for display - Price: RM 45/kg"
    );
    await display.wait();
    console.log("✅ Product ready for sale");

    // Retail Update 3: Customer purchase
    console.log("💰 Update 3: Customer Purchase");
    const sale = await qrChain.connect(retailer).updateProductStatus(
      productId, 
      "SOLD - Customer: Premium Restaurant Chain"
    );
    await sale.wait();
    console.log("✅ Product sold successfully\n");

    // ===========================================
    // STEP 4: RETRIEVE COMPLETE HISTORY
    // ===========================================
    console.log("📊 STEP 4: Complete Product History");
    console.log("===================================");

    // Use the correct product ID (not hardcoded 3)
    const productHistory = await qrChain.getProductHistory(productId);
    const totalProducts = await qrChain.getTotalProducts();
    const latestStatus = await qrChain.getLatestProductStatus(productId);

    console.log(`📈 Total Products in System: ${totalProducts}`);
    console.log(`📋 Total History Entries: ${productHistory.length}\n`);

    console.log("🔍 DETAILED SUPPLY CHAIN HISTORY:");
    console.log("==================================");

    for (let i = 0; i < productHistory.length; i++) {
      const entry = productHistory[i];
      const timestamp = new Date(Number(entry.timestamp) * 1000);
      
      // Determine actor type
      let actorType = "Unknown";
      if (entry.actor.toLowerCase() === farmer.address.toLowerCase()) {
        actorType = "🌾 Farmer";
      } else if (entry.actor.toLowerCase() === transporter.address.toLowerCase()) {
        actorType = "🚛 Transporter";
      } else if (entry.actor.toLowerCase() === retailer.address.toLowerCase()) {
        actorType = "🏪 Retailer";
      }

      console.log(`\n📌 Entry ${i + 1}:`);
      console.log(`   👤 Actor: ${actorType} (${entry.actor})`);
      console.log(`   ⏰ Timestamp: ${timestamp.toLocaleString()}`);
      console.log(`   📍 Location: ${entry.location}`);
      console.log(`   📝 Status: ${entry.status}`);
      console.log(`   💬 Note: ${entry.note}`);
    }

    // ===========================================
    // STEP 5: SUMMARY AND VERIFICATION
    // ===========================================
    console.log("\n\n📊 SUPPLY CHAIN SUMMARY");
    console.log("========================");
    
    console.log(`🆔 Product ID: ${productId}`);
    console.log(`📱 QR Code: ${qrCode}`);
    console.log(`📋 Latest Status: ${latestStatus.status}`);
    console.log(`📍 Final Location: ${latestStatus.location}`);
    console.log(`👤 Last Updated By: ${latestStatus.actor}`);
    
    const finalTimestamp = new Date(Number(latestStatus.timestamp) * 1000);
    console.log(`⏰ Last Update: ${finalTimestamp.toLocaleString()}`);

    console.log("\n🎉 SUPPLY CHAIN JOURNEY COMPLETED SUCCESSFULLY!");
    console.log("===============================================");
    console.log("✅ Roles assigned to all actors");
    console.log("✅ Product created by farmer");
    console.log("✅ Transportation tracked through 4 checkpoints");
    console.log("✅ Retail process documented through 3 phases");
    console.log("✅ Complete traceability maintained");
    console.log("✅ All actors participated in the supply chain");
    
    // ===========================================
    // STEP 6: QR CODE VERIFICATION DEMO
    // ===========================================
    console.log("\n🔍 QR CODE VERIFICATION DEMO");
    console.log("============================");
    
    try {
      const verifiedProductId = await qrChain.getProductIdFromQrCode(qrCode);
      const verifiedHistory = await qrChain.getProductHistory(verifiedProductId);
      
      console.log(`✅ QR Code "${qrCode}" verified successfully`);
      console.log(`📋 Product has ${verifiedHistory.length} history entries`);
      console.log(`🔗 Complete supply chain traceability confirmed`);
      
      // Test with invalid QR code
      try {
        await qrChain.getProductIdFromQrCode("INVALID_QR_CODE");
      } catch (error) {
        console.log("❌ Invalid QR code correctly rejected");
      }
      
    } catch (error) {
      console.log(`❌ QR Code verification failed: ${error}`);
    }

    // ===========================================
    // STEP 7: ROLE VERIFICATION
    // ===========================================
    console.log("\n🔐 ROLE VERIFICATION");
    console.log("====================");
    
    console.log("Final role status:");
    console.log(`🌾 Farmer (${farmer.address}): Role ${await qrChain.getUserRole(farmer.address)}`);
    console.log(`🚛 Transporter (${transporter.address}): Role ${await qrChain.getUserRole(transporter.address)}`);
    console.log(`🏪 Retailer (${retailer.address}): Role ${await qrChain.getUserRole(retailer.address)}`);

  } catch (error) {
    console.error("❌ Error during supply chain interaction:", error);
    
    // Additional error details for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      if ('data' in error) {
        console.error("Error data:", error.data);
      }
    }
  }
}

// Execute the main function
main()
  .then(() => {
    console.log("\n🎯 Script execution completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script execution failed:", error);
    process.exit(1);
  });