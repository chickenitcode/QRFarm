// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log for debugging
// import "hardhat/console.sol";

/**
 * @title QRChain - Durian Supply Chain Management Contract
 * @dev A blockchain-based supply chain tracking system for durian products with role-based access control
 * @notice This contract allows farmers, transporters, and retailers to track durian products through the supply chain
 */
contract QRChain {
    
    // Enum for different roles in the supply chain
    enum Role {
        NONE,       // 0 - No role assigned
        FARMER,     // 1 - Can create products
        TRANSPORTER, // 2 - Can update product locations
        RETAILER    // 3 - Can update final product status
    }
    
    // Structure to store product history entries
    struct ProductHistory {
        address actor;          // Address of the person making the update
        uint256 timestamp;      // When the update was made
        string location;        // Current location of the product
        string status;          // Current status of the product
        string note;            // Additional notes or comments
    }
    
    // Contract owner (admin)
    address public owner;
    
    // Counter for generating unique product IDs
    uint256 public productCounter;
    
    // Mapping from address to role
    mapping(address => Role) public userRoles;
    
    // Mapping from QR code to product ID (to prevent duplicate QR codes)
    mapping(string => uint256) public qrCodeToProductId;
    
    // Mapping from product ID to array of history entries
    mapping(uint256 => ProductHistory[]) public productHistory;
    
    // Mapping from product ID to QR code (for easy lookup)
    mapping(uint256 => string) public productIdToQrCode;
    
    // Events for tracking supply chain activities
    event ProductCreated(
        uint256 indexed productId,
        string qrCode,
        address indexed farmer,
        string initStatus,
        uint256 timestamp
    );
    
    event ProductLocationUpdated(
        uint256 indexed productId,
        address indexed transporter,
        string location,
        string status,
        uint256 timestamp
    );
    
    event ProductStatusUpdated(
        uint256 indexed productId,
        address indexed retailer,
        string finalStatus,
        uint256 timestamp
    );
    
    // Events for role management
    event RoleAssigned(address indexed user, Role role, address indexed assignedBy);
    event RoleRevoked(address indexed user, Role previousRole, address indexed revokedBy);
    
    // Modifiers for role-based access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }
    
    modifier onlyFarmer() {
        require(userRoles[msg.sender] == Role.FARMER, "Only farmers can perform this action");
        _;
    }
    
    modifier onlyTransporter() {
        require(userRoles[msg.sender] == Role.TRANSPORTER, "Only transporters can perform this action");
        _;
    }
    
    modifier onlyRetailer() {
        require(userRoles[msg.sender] == Role.RETAILER, "Only retailers can perform this action");
        _;
    }
    
    modifier hasRole(Role requiredRole) {
        require(userRoles[msg.sender] == requiredRole, "Insufficient permissions for this action");
        _;
    }
    
    /**
     * @dev Constructor sets the contract deployer as owner
     */
    constructor() {
        owner = msg.sender;
        userRoles[msg.sender] = Role.FARMER; // Owner can also be a farmer initially
        emit RoleAssigned(msg.sender, Role.FARMER, msg.sender);
    }
    
    /**
     * @dev Assigns a role to a user address
     * @param user Address to assign role to (must be msg.sender for self-assignment)
     * @param role Role to assign (FARMER, TRANSPORTER, RETAILER)
     * @notice Users can assign roles to themselves, or owner can assign to others
     */
    function assignRole(address user, Role role) public {
        require(user != address(0), "Cannot assign role to zero address");
        require(role != Role.NONE, "Cannot assign NONE role");
        require(user == msg.sender || msg.sender == owner, "Can only assign role to yourself or owner can assign to others");
        
        Role previousRole = userRoles[user];
        userRoles[user] = role;
        
        emit RoleAssigned(user, role, msg.sender);
        
        if (previousRole != Role.NONE) {
            emit RoleRevoked(user, previousRole, msg.sender);
        }
    }
    
    /**
     * @dev Revokes role from a user address
     * @param user Address to revoke role from
     * @notice Only contract owner can revoke roles
     */
    function revokeRole(address user) public onlyOwner {
        require(user != address(0), "Cannot revoke role from zero address");
        require(user != owner, "Cannot revoke role from contract owner");
        
        Role previousRole = userRoles[user];
        require(previousRole != Role.NONE, "User has no role to revoke");
        
        userRoles[user] = Role.NONE;
        emit RoleRevoked(user, previousRole, msg.sender);
    }
    
    /**
     * @dev Gets the role of a user
     * @param user Address to check role for
     * @return Role of the user
     */
    function getUserRole(address user) public view returns (Role) {
        return userRoles[user];
    }
    
    /**
     * @dev Checks if a user has a specific role
     * @param user Address to check
     * @param role Role to check for
     * @return True if user has the specified role
     */
    function hasUserRole(address user, Role role) public view returns (bool) {
        return userRoles[user] == role;
    }
    
    /**
     * @dev Creates a new durian product in the supply chain
     * @param qrCode Unique QR code identifier for the product
     * @param initStatus Initial status of the product (e.g., "Harvested", "Ready for transport")
     * @notice Only farmers can create products
     */
    function createProduct(string memory qrCode, string memory initStatus) public onlyFarmer {
        // Prevent duplicate QR codes from being registered
        require(qrCodeToProductId[qrCode] == 0, "Product with this QR code already exists");
        require(bytes(qrCode).length > 0, "QR code cannot be empty");
        require(bytes(initStatus).length > 0, "Initial status cannot be empty");
        
        // Increment product counter to generate new unique ID
        productCounter++;
        uint256 newProductId = productCounter;
        
        // Store QR code mapping
        qrCodeToProductId[qrCode] = newProductId;
        productIdToQrCode[newProductId] = qrCode;
        
        // Create initial history entry
        ProductHistory memory initialHistory = ProductHistory({
            actor: msg.sender,
            timestamp: block.timestamp,
            location: "Farm", // Default initial location
            status: initStatus,
            note: "Product created by farmer"
        });
        
        // Add to product history
        productHistory[newProductId].push(initialHistory);
        
        // Emit event for product creation
        emit ProductCreated(newProductId, qrCode, msg.sender, initStatus, block.timestamp);
    }
    
    /**
     * @dev Updates the location and status of a product during transport
     * @param productId Unique identifier of the product
     * @param location New location of the product
     * @param status New status of the product (e.g., "In Transit", "At Warehouse")
     * @notice Only transporters can update product locations
     */
    function updateProductLocation(uint256 productId, string memory location, string memory status) public onlyTransporter {
        // Ensure product exists
        require(productId > 0 && productId <= productCounter, "Product does not exist");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(bytes(status).length > 0, "Status cannot be empty");
        
        // Create new history entry
        ProductHistory memory locationUpdate = ProductHistory({
            actor: msg.sender,
            timestamp: block.timestamp,
            location: location,
            status: status,
            note: "Location updated by transporter"
        });
        
        // Add to product history
        productHistory[productId].push(locationUpdate);
        
        // Emit event for location update
        emit ProductLocationUpdated(productId, msg.sender, location, status, block.timestamp);
    }
    
    /**
     * @dev Updates the final status of a product at retail
     * @param productId Unique identifier of the product
     * @param finalStatus Final status of the product (e.g., "Received", "Sold", "Quality Checked")
     * @notice Only retailers can update final product status
     */
    function updateProductStatus(uint256 productId, string memory finalStatus) public onlyRetailer {
        // Ensure product exists
        require(productId > 0 && productId <= productCounter, "Product does not exist");
        require(bytes(finalStatus).length > 0, "Final status cannot be empty");
        
        // Create new history entry
        ProductHistory memory statusUpdate = ProductHistory({
            actor: msg.sender,
            timestamp: block.timestamp,
            location: "Retail Store", // Default final location
            status: finalStatus,
            note: "Final status updated by retailer"
        });
        
        // Add to product history
        productHistory[productId].push(statusUpdate);
        
        // Emit event for status update
        emit ProductStatusUpdated(productId, msg.sender, finalStatus, block.timestamp);
    }
    
    /**
     * @dev Gets the complete history of a product
     * @param productId Unique identifier of the product
     * @return Array of ProductHistory entries for the specified product
     * @notice This function allows anyone to view the complete supply chain history
     */
    function getProductHistory(uint256 productId) public view returns (ProductHistory[] memory) {
        require(productId > 0 && productId <= productCounter, "Product does not exist");
        return productHistory[productId];
    }
    
    /**
     * @dev Gets product ID from QR code
     * @param qrCode QR code of the product
     * @return productId The unique identifier of the product
     */
    function getProductIdFromQrCode(string memory qrCode) public view returns (uint256) {
        uint256 productId = qrCodeToProductId[qrCode];
        require(productId > 0, "Product with this QR code does not exist");
        return productId;
    }
    
    /**
     * @dev Gets the latest status of a product
     * @param productId Unique identifier of the product
     * @return Latest ProductHistory entry for the specified product
     */
    function getLatestProductStatus(uint256 productId) public view returns (ProductHistory memory) {
        require(productId > 0 && productId <= productCounter, "Product does not exist");
        require(productHistory[productId].length > 0, "No history found for this product");
        
        // Return the last entry in the history array
        return productHistory[productId][productHistory[productId].length - 1];
    }
    
    /**
     * @dev Gets the total number of products created
     * @return Total count of products in the system
     */
    function getTotalProducts() public view returns (uint256) {
        return productCounter;
    }
    
    /**
     * @dev Emergency function to transfer contract ownership
     * @param newOwner Address of the new owner
     * @notice Only current owner can transfer ownership
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner must be different from current owner");
        
        address previousOwner = owner;
        owner = newOwner;
        
        // Assign farmer role to new owner if they don't have a role
        if (userRoles[newOwner] == Role.NONE) {
            userRoles[newOwner] = Role.FARMER;
            emit RoleAssigned(newOwner, Role.FARMER, previousOwner);
        }
    }

}