import { expect } from "chai";
import { ethers } from "hardhat";
import { QRChain } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("QRChain", function () {
  let qrChain: QRChain;
  let owner: HardhatEthersSigner;
  let farmer: HardhatEthersSigner;
  let transporter: HardhatEthersSigner;
  let retailer: HardhatEthersSigner;
  let otherAccount: HardhatEthersSigner;

  beforeEach(async function () {
    // Get signers
    [owner, farmer, transporter, retailer, otherAccount] = await ethers.getSigners();

    // Deploy the contract (deployer becomes owner)
    const QRChainFactory = await ethers.getContractFactory("QRChain");
    qrChain = await QRChainFactory.connect(owner).deploy();

    // Assign roles to users
    await qrChain.connect(owner).assignRole(farmer.address, 1); // Role.FARMER
    await qrChain.connect(owner).assignRole(transporter.address, 2); // Role.TRANSPORTER
    await qrChain.connect(owner).assignRole(retailer.address, 3); // Role.RETAILER
  });

  describe("Deployment", function () {
    it("Should initialize with zero product counter", async function () {
      expect(await qrChain.productCounter()).to.equal(0);
      expect(await qrChain.getTotalProducts()).to.equal(0);
    });

    it("Should set deployer as owner with farmer role", async function () {
      expect(await qrChain.owner()).to.equal(owner.address);
      expect(await qrChain.getUserRole(owner.address)).to.equal(1); // Role.FARMER
    });
  });

  describe("Role Management", function () {
    it("Should assign roles correctly", async function () {
      expect(await qrChain.getUserRole(farmer.address)).to.equal(1); // Role.FARMER
      expect(await qrChain.getUserRole(transporter.address)).to.equal(2); // Role.TRANSPORTER
      expect(await qrChain.getUserRole(retailer.address)).to.equal(3); // Role.RETAILER
    });

    it("Should emit RoleAssigned event", async function () {
      await expect(qrChain.connect(owner).assignRole(otherAccount.address, 1))
        .to.emit(qrChain, "RoleAssigned")
        .withArgs(otherAccount.address, 1, owner.address);
    });

    it("Should prevent non-owner from assigning roles", async function () {
      await expect(
        qrChain.connect(farmer).assignRole(otherAccount.address, 1)
      ).to.be.revertedWith("Only contract owner can perform this action");
    });

    it("Should revoke roles correctly", async function () {
      await qrChain.connect(owner).revokeRole(farmer.address);
      expect(await qrChain.getUserRole(farmer.address)).to.equal(0); // Role.NONE
    });

    it("Should prevent revoking owner's role", async function () {
      await expect(
        qrChain.connect(owner).revokeRole(owner.address)
      ).to.be.revertedWith("Cannot revoke role from contract owner");
    });

    it("Should check hasUserRole correctly", async function () {
      expect(await qrChain.hasUserRole(farmer.address, 1)).to.be.true; // Role.FARMER
      expect(await qrChain.hasUserRole(farmer.address, 2)).to.be.false; // Role.TRANSPORTER
    });
  });

  describe("Product Creation", function () {
    it("Should create a product successfully", async function () {
      const qrCode = "QR123456";
      const initStatus = "Freshly Harvested";

      await expect(qrChain.connect(farmer).createProduct(qrCode, initStatus))
        .to.emit(qrChain, "ProductCreated")
        .withArgs(1, qrCode, farmer.address, initStatus, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await qrChain.productCounter()).to.equal(1);
      expect(await qrChain.getTotalProducts()).to.equal(1);
      expect(await qrChain.qrCodeToProductId(qrCode)).to.equal(1);
      expect(await qrChain.productIdToQrCode(1)).to.equal(qrCode);
    });

    it("Should prevent non-farmers from creating products", async function () {
      await expect(
        qrChain.connect(transporter).createProduct("QR123456", "Harvested")
      ).to.be.revertedWith("Only farmers can perform this action");
    });

    it("Should prevent duplicate QR codes", async function () {
      const qrCode = "QR123456";
      const initStatus = "Freshly Harvested";

      // Create first product
      await qrChain.connect(farmer).createProduct(qrCode, initStatus);

      // Try to create second product with same QR code
      await expect(
        qrChain.connect(farmer).createProduct(qrCode, "Another Status")
      ).to.be.revertedWith("Product with this QR code already exists");
    });

    it("Should reject empty QR code", async function () {
      await expect(
        qrChain.connect(farmer).createProduct("", "Harvested")
      ).to.be.revertedWith("QR code cannot be empty");
    });

    it("Should reject empty initial status", async function () {
      await expect(
        qrChain.connect(farmer).createProduct("QR123456", "")
      ).to.be.revertedWith("Initial status cannot be empty");
    });

    it("Should create initial product history entry", async function () {
      const qrCode = "QR123456";
      const initStatus = "Freshly Harvested";

      await qrChain.connect(farmer).createProduct(qrCode, initStatus);

      const history = await qrChain.getProductHistory(1);
      expect(history.length).to.equal(1);
      expect(history[0].actor).to.equal(farmer.address);
      expect(history[0].location).to.equal("Farm");
      expect(history[0].status).to.equal(initStatus);
      expect(history[0].note).to.equal("Product created by farmer");
    });
  });

  describe("Product Location Updates", function () {
    beforeEach(async function () {
      // Create a product first
      await qrChain.connect(farmer).createProduct("QR123456", "Harvested");
    });

    it("Should update product location successfully", async function () {
      const location = "Highway Checkpoint";
      const status = "In Transit";

      await expect(qrChain.connect(transporter).updateProductLocation(1, location, status))
        .to.emit(qrChain, "ProductLocationUpdated")
        .withArgs(1, transporter.address, location, status, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const history = await qrChain.getProductHistory(1);
      expect(history.length).to.equal(2);
      expect(history[1].actor).to.equal(transporter.address);
      expect(history[1].location).to.equal(location);
      expect(history[1].status).to.equal(status);
      expect(history[1].note).to.equal("Location updated by transporter");
    });

    it("Should prevent non-transporters from updating location", async function () {
      await expect(
        qrChain.connect(farmer).updateProductLocation(1, "Location", "Status")
      ).to.be.revertedWith("Only transporters can perform this action");
    });

    it("Should reject update for non-existent product", async function () {
      await expect(
        qrChain.connect(transporter).updateProductLocation(999, "Location", "Status")
      ).to.be.revertedWith("Product does not exist");
    });

    it("Should reject empty location", async function () {
      await expect(
        qrChain.connect(transporter).updateProductLocation(1, "", "In Transit")
      ).to.be.revertedWith("Location cannot be empty");
    });

    it("Should reject empty status", async function () {
      await expect(
        qrChain.connect(transporter).updateProductLocation(1, "Warehouse", "")
      ).to.be.revertedWith("Status cannot be empty");
    });

    it("Should allow multiple location updates", async function () {
      await qrChain.connect(transporter).updateProductLocation(1, "Checkpoint 1", "In Transit");
      await qrChain.connect(transporter).updateProductLocation(1, "Checkpoint 2", "In Transit");
      await qrChain.connect(transporter).updateProductLocation(1, "Warehouse", "Arrived");

      const history = await qrChain.getProductHistory(1);
      expect(history.length).to.equal(4); // Initial + 3 updates
      expect(history[3].location).to.equal("Warehouse");
      expect(history[3].status).to.equal("Arrived");
    });
  });

  describe("Product Status Updates", function () {
    beforeEach(async function () {
      // Create a product and add some location updates
      await qrChain.connect(farmer).createProduct("QR123456", "Harvested");
      await qrChain.connect(transporter).updateProductLocation(1, "Warehouse", "Delivered");
    });

    it("Should update product status successfully", async function () {
      const finalStatus = "Quality Approved";

      await expect(qrChain.connect(retailer).updateProductStatus(1, finalStatus))
        .to.emit(qrChain, "ProductStatusUpdated")
        .withArgs(1, retailer.address, finalStatus, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const history = await qrChain.getProductHistory(1);
      expect(history.length).to.equal(3);
      expect(history[2].actor).to.equal(retailer.address);
      expect(history[2].location).to.equal("Retail Store");
      expect(history[2].status).to.equal(finalStatus);
      expect(history[2].note).to.equal("Final status updated by retailer");
    });

    it("Should prevent non-retailers from updating status", async function () {
      await expect(
        qrChain.connect(farmer).updateProductStatus(1, "Sold")
      ).to.be.revertedWith("Only retailers can perform this action");
    });

    it("Should reject update for non-existent product", async function () {
      await expect(
        qrChain.connect(retailer).updateProductStatus(999, "Sold")
      ).to.be.revertedWith("Product does not exist");
    });

    it("Should reject empty final status", async function () {
      await expect(
        qrChain.connect(retailer).updateProductStatus(1, "")
      ).to.be.revertedWith("Final status cannot be empty");
    });

    it("Should allow multiple status updates", async function () {
      await qrChain.connect(retailer).updateProductStatus(1, "Received");
      await qrChain.connect(retailer).updateProductStatus(1, "Quality Checked");
      await qrChain.connect(retailer).updateProductStatus(1, "Sold");

      const history = await qrChain.getProductHistory(1);
      expect(history.length).to.equal(5); // Initial + location update + 3 status updates
      expect(history[4].status).to.equal("Sold");
    });
  });

  describe("Product History Queries", function () {
    beforeEach(async function () {
      // Create a complete supply chain flow
      await qrChain.connect(farmer).createProduct("QR123456", "Harvested");
      await qrChain.connect(transporter).updateProductLocation(1, "Highway", "In Transit");
      await qrChain.connect(transporter).updateProductLocation(1, "Warehouse", "Delivered");
      await qrChain.connect(retailer).updateProductStatus(1, "Received");
      await qrChain.connect(retailer).updateProductStatus(1, "Sold");
    });

    it("Should return complete product history", async function () {
      const history = await qrChain.getProductHistory(1);
      expect(history.length).to.equal(5);

      // Check chronological order and actors
      expect(history[0].actor).to.equal(farmer.address);
      expect(history[1].actor).to.equal(transporter.address);
      expect(history[2].actor).to.equal(transporter.address);
      expect(history[3].actor).to.equal(retailer.address);
      expect(history[4].actor).to.equal(retailer.address);
    });

    it("Should reject history query for non-existent product", async function () {
      await expect(
        qrChain.getProductHistory(999)
      ).to.be.revertedWith("Product does not exist");
    });

    it("Should return latest product status", async function () {
      const latestStatus = await qrChain.getLatestProductStatus(1);
      expect(latestStatus.actor).to.equal(retailer.address);
      expect(latestStatus.status).to.equal("Sold");
      expect(latestStatus.location).to.equal("Retail Store");
    });

    it("Should reject latest status query for non-existent product", async function () {
      await expect(
        qrChain.getLatestProductStatus(999)
      ).to.be.revertedWith("Product does not exist");
    });
  });

  describe("QR Code Lookup", function () {
    beforeEach(async function () {
      await qrChain.connect(farmer).createProduct("QR123456", "Harvested");
      await qrChain.connect(farmer).createProduct("QR789012", "Fresh");
    });

    it("Should return correct product ID for QR code", async function () {
      expect(await qrChain.getProductIdFromQrCode("QR123456")).to.equal(1);
      expect(await qrChain.getProductIdFromQrCode("QR789012")).to.equal(2);
    });

    it("Should reject lookup for non-existent QR code", async function () {
      await expect(
        qrChain.getProductIdFromQrCode("QR999999")
      ).to.be.revertedWith("Product with this QR code does not exist");
    });

    it("Should return correct QR code for product ID", async function () {
      expect(await qrChain.productIdToQrCode(1)).to.equal("QR123456");
      expect(await qrChain.productIdToQrCode(2)).to.equal("QR789012");
    });
  });

  describe("Multi-Actor Supply Chain Flow", function () {
    it("Should handle complete supply chain workflow", async function () {
      const qrCode = "QR_DURIAN_001";
      
      // Step 1: Farmer creates product
      await expect(qrChain.connect(farmer).createProduct(qrCode, "Freshly Harvested"))
        .to.emit(qrChain, "ProductCreated");

      // Step 2: Transporter updates location multiple times
      await expect(qrChain.connect(transporter).updateProductLocation(1, "Farm Gate", "Picked Up"))
        .to.emit(qrChain, "ProductLocationUpdated");

      await expect(qrChain.connect(transporter).updateProductLocation(1, "Highway Checkpoint", "In Transit"))
        .to.emit(qrChain, "ProductLocationUpdated");

      await expect(qrChain.connect(transporter).updateProductLocation(1, "Distribution Center", "Delivered"))
        .to.emit(qrChain, "ProductLocationUpdated");

      // Step 3: Retailer updates final status
      await expect(qrChain.connect(retailer).updateProductStatus(1, "Quality Inspected"))
        .to.emit(qrChain, "ProductStatusUpdated");

      await expect(qrChain.connect(retailer).updateProductStatus(1, "Available for Sale"))
        .to.emit(qrChain, "ProductStatusUpdated");

      await expect(qrChain.connect(retailer).updateProductStatus(1, "Sold to Customer"))
        .to.emit(qrChain, "ProductStatusUpdated");

      // Verify complete history
      const history = await qrChain.getProductHistory(1);
      expect(history.length).to.equal(7);

      // Verify final status
      const latestStatus = await qrChain.getLatestProductStatus(1);
      expect(latestStatus.status).to.equal("Sold to Customer");
      expect(latestStatus.actor).to.equal(retailer.address);

      // Verify QR code lookup still works
      expect(await qrChain.getProductIdFromQrCode(qrCode)).to.equal(1);
    });
  });

  describe("Product Counter and Total Products", function () {
    it("Should increment product counter correctly", async function () {
      expect(await qrChain.getTotalProducts()).to.equal(0);

      await qrChain.connect(farmer).createProduct("QR001", "Harvested");
      expect(await qrChain.getTotalProducts()).to.equal(1);

      await qrChain.connect(farmer).createProduct("QR002", "Fresh");
      expect(await qrChain.getTotalProducts()).to.equal(2);

      // Test with owner who also has farmer role
      await qrChain.connect(owner).createProduct("QR003", "Premium");
      expect(await qrChain.getTotalProducts()).to.equal(3);
    });
  });

  describe("Access Control Edge Cases", function () {
    it("Should prevent users without roles from performing actions", async function () {
      // Test with account that has no role assigned
      await expect(
        qrChain.connect(otherAccount).createProduct("QR123", "Test")
      ).to.be.revertedWith("Only farmers can perform this action");

      await expect(
        qrChain.connect(otherAccount).updateProductLocation(1, "Location", "Status")
      ).to.be.revertedWith("Only transporters can perform this action");

      await expect(
        qrChain.connect(otherAccount).updateProductStatus(1, "Status")
      ).to.be.revertedWith("Only retailers can perform this action");
    });

    it("Should handle role changes correctly", async function () {
      // Create product as farmer
      await qrChain.connect(farmer).createProduct("QR123", "Test");

      // Change farmer to transporter role
      await qrChain.connect(owner).assignRole(farmer.address, 2); // Role.TRANSPORTER

      // Should no longer be able to create products
      await expect(
        qrChain.connect(farmer).createProduct("QR456", "Test2")
      ).to.be.revertedWith("Only farmers can perform this action");

      // But should be able to update locations
      await expect(
        qrChain.connect(farmer).updateProductLocation(1, "New Location", "In Transit")
      ).to.not.be.reverted;
    });
  });

  describe("Ownership Transfer", function () {
    it("Should transfer ownership correctly", async function () {
      await expect(qrChain.connect(owner).transferOwnership(farmer.address))
        .to.not.be.reverted;

      expect(await qrChain.owner()).to.equal(farmer.address);
    });

    it("Should prevent non-owner from transferring ownership", async function () {
      await expect(
        qrChain.connect(farmer).transferOwnership(retailer.address)
      ).to.be.revertedWith("Only contract owner can perform this action");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very long QR codes and status strings", async function () {
      const longQrCode = "QR" + "X".repeat(100);
      const longStatus = "Status: " + "Y".repeat(200);

      await expect(qrChain.connect(farmer).createProduct(longQrCode, longStatus))
        .to.not.be.reverted;

      expect(await qrChain.getProductIdFromQrCode(longQrCode)).to.equal(1);
    });

    it("Should handle special characters in QR codes and status", async function () {
      const specialQrCode = "QR-123_ABC!@#$%";
      const specialStatus = "Status: 特殊字符 & símbolos";

      await expect(qrChain.connect(farmer).createProduct(specialQrCode, specialStatus))
        .to.not.be.reverted;

      const history = await qrChain.getProductHistory(1);
      expect(history[0].status).to.equal(specialStatus);
    });
  });
});