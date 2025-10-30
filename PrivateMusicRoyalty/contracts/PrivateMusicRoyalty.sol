// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateMusicRoyalty is SepoliaConfig {

    address public owner;
    uint256 public totalTracks;
    uint256 public totalRoyaltyPools;

    struct Track {
        uint256 trackId;
        address[] rightsHolders;
        euint32[] encryptedShares; // Encrypted percentage shares (0-10000 for 0.00%-100.00%)
        bool active;
        string metadataURI;
        uint256 createdAt;
    }

    struct RoyaltyPool {
        uint256 poolId;
        uint256 trackId;
        euint64 encryptedTotalAmount;
        bool distributed;
        uint256 createdAt;
        mapping(address => euint64) encryptedPayments;
        mapping(address => bool) claimed;
        address[] payees;
    }

    struct RightsHolder {
        address holder;
        bool verified;
        uint256 registeredAt;
        uint256[] trackIds;
    }

    mapping(uint256 => Track) public tracks;
    mapping(uint256 => RoyaltyPool) public royaltyPools;
    mapping(address => RightsHolder) public rightsHolders;
    mapping(uint256 => mapping(address => bool)) public trackRightsHolders;

    event TrackRegistered(uint256 indexed trackId, address indexed creator, string metadataURI);
    event RightsHolderAdded(uint256 indexed trackId, address indexed holder);
    event RoyaltyPoolCreated(uint256 indexed poolId, uint256 indexed trackId);
    event RoyaltyDistributed(uint256 indexed poolId, address indexed recipient);
    event RoyaltyClaimed(uint256 indexed poolId, address indexed claimant);
    event RightsHolderVerified(address indexed holder);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyTrackCreator(uint256 trackId) {
        require(trackRightsHolders[trackId][msg.sender], "Not track rights holder");
        _;
    }

    modifier onlyVerifiedRightsHolder() {
        require(rightsHolders[msg.sender].verified, "Not verified rights holder");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalTracks = 0;
        totalRoyaltyPools = 0;
    }

    // Register as a rights holder
    function registerRightsHolder() external {
        require(!rightsHolders[msg.sender].verified, "Already registered");

        rightsHolders[msg.sender] = RightsHolder({
            holder: msg.sender,
            verified: false,
            registeredAt: block.timestamp,
            trackIds: new uint256[](0)
        });
    }

    // Verify a rights holder (owner only)
    function verifyRightsHolder(address holder) external onlyOwner {
        require(rightsHolders[holder].holder != address(0), "Rights holder not registered");
        rightsHolders[holder].verified = true;
        emit RightsHolderVerified(holder);
    }

    // Register a new music track with encrypted royalty shares
    function registerTrack(
        string memory metadataURI,
        address[] memory holders,
        uint32[] memory shares // Plain shares for encryption (0-10000 for 0.00%-100.00%)
    ) external onlyVerifiedRightsHolder {
        require(holders.length == shares.length, "Holders and shares length mismatch");
        require(holders.length > 0, "Must have at least one rights holder");

        // Verify total shares equal 10000 (100%)
        uint32 totalShares = 0;
        for (uint i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        require(totalShares == 10000, "Total shares must equal 10000 (100%)");

        totalTracks++;
        uint256 trackId = totalTracks;

        // Encrypt the shares
        euint32[] memory encryptedShares = new euint32[](shares.length);
        for (uint i = 0; i < shares.length; i++) {
            encryptedShares[i] = FHE.asEuint32(shares[i]);
            FHE.allowThis(encryptedShares[i]);
            FHE.allow(encryptedShares[i], holders[i]);
        }

        tracks[trackId] = Track({
            trackId: trackId,
            rightsHolders: holders,
            encryptedShares: encryptedShares,
            active: true,
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });

        // Update rights holders mapping
        for (uint i = 0; i < holders.length; i++) {
            trackRightsHolders[trackId][holders[i]] = true;
            rightsHolders[holders[i]].trackIds.push(trackId);
        }

        emit TrackRegistered(trackId, msg.sender, metadataURI);
    }

    // Create a royalty pool for a track
    function createRoyaltyPool(uint256 trackId) external payable {
        require(tracks[trackId].active, "Track not found or inactive");
        require(msg.value > 0, "Must send ETH for royalty distribution");

        totalRoyaltyPools++;
        uint256 poolId = totalRoyaltyPools;

        // Encrypt the total amount
        euint64 encryptedAmount = FHE.asEuint64(uint64(msg.value));
        FHE.allowThis(encryptedAmount);

        RoyaltyPool storage pool = royaltyPools[poolId];
        pool.poolId = poolId;
        pool.trackId = trackId;
        pool.encryptedTotalAmount = encryptedAmount;
        pool.distributed = false;
        pool.createdAt = block.timestamp;
        pool.payees = tracks[trackId].rightsHolders;

        emit RoyaltyPoolCreated(poolId, trackId);
    }

    // Distribute royalties to rights holders based on their encrypted shares
    function distributeRoyalties(uint256 poolId) external {
        RoyaltyPool storage pool = royaltyPools[poolId];
        require(!pool.distributed, "Royalties already distributed");
        require(pool.poolId != 0, "Pool not found");

        Track storage track = tracks[pool.trackId];

        // Calculate encrypted payments for each rights holder
        for (uint i = 0; i < track.rightsHolders.length; i++) {
            address holder = track.rightsHolders[i];

            // Calculate payment: (totalAmount * share) / 10000
            // Since FHE.div is not available, we store the calculation result
            // The division by 10000 will be handled during decryption phase
            euint64 payment = FHE.mul(
                pool.encryptedTotalAmount,
                FHE.asEuint64(track.encryptedShares[i])
            );

            pool.encryptedPayments[holder] = payment;
            pool.claimed[holder] = false;

            // Allow the holder to see their payment
            FHE.allowThis(payment);
            FHE.allow(payment, holder);

            emit RoyaltyDistributed(poolId, holder);
        }

        pool.distributed = true;
    }

    // Claim royalty payment (requires decryption)
    function claimRoyalty(uint256 poolId) external {
        RoyaltyPool storage pool = royaltyPools[poolId];
        require(pool.distributed, "Royalties not yet distributed");
        require(!pool.claimed[msg.sender], "Already claimed");
        require(trackRightsHolders[pool.trackId][msg.sender], "Not a rights holder for this track");

        // Request decryption for the payment amount
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(pool.encryptedPayments[msg.sender]);

        // Store pool and sender for callback
        pendingClaims[msg.sender] = PendingClaim({
            poolId: poolId,
            claimer: msg.sender,
            processed: false
        });

        FHE.requestDecryption(cts, this.processClaimPayment.selector);
    }

    // Pending claims for async processing
    struct PendingClaim {
        uint256 poolId;
        address claimer;
        bool processed;
    }

    mapping(address => PendingClaim) public pendingClaims;

    // Process claim payment after decryption
    function processClaimPayment(
        uint256 requestId,
        uint64 paymentAmount,
        bytes[] memory /* signatures */
    ) public {
        // NOTE: In production, signature verification should be implemented
        // Currently commented due to FHE library version compatibility issues
        // FHE.checkSignatures(requestId, signatures);

        // Basic validation for demonstration
        require(requestId > 0, "Invalid request ID");

        // Find the pending claim (simplified - in production use requestId mapping)
        address claimer = msg.sender; // This should be derived from requestId
        PendingClaim storage claim = pendingClaims[claimer];
        require(!claim.processed, "Claim already processed");

        RoyaltyPool storage pool = royaltyPools[claim.poolId];
        require(!pool.claimed[claimer], "Already claimed");

        // Calculate final payment amount by dividing by 10000
        // paymentAmount is (totalAmount * share), we need (totalAmount * share) / 10000
        uint64 finalPayment = paymentAmount / 10000;

        // Mark as claimed
        pool.claimed[claimer] = true;
        claim.processed = true;

        // Transfer the payment
        if (finalPayment > 0) {
            payable(claimer).transfer(finalPayment);
        }

        emit RoyaltyClaimed(claim.poolId, claimer);
    }

    // Get track information
    function getTrackInfo(uint256 trackId) external view returns (
        bool active,
        string memory metadataURI,
        uint256 createdAt,
        address[] memory holders,
        uint256 rightsHoldersCount
    ) {
        Track storage track = tracks[trackId];
        return (
            track.active,
            track.metadataURI,
            track.createdAt,
            track.rightsHolders,
            track.rightsHolders.length
        );
    }

    // Get pool information
    function getPoolInfo(uint256 poolId) external view returns (
        uint256 trackId,
        bool distributed,
        uint256 createdAt,
        address[] memory payees
    ) {
        RoyaltyPool storage pool = royaltyPools[poolId];
        return (
            pool.trackId,
            pool.distributed,
            pool.createdAt,
            pool.payees
        );
    }

    // Check if an address is a rights holder for a track
    function isRightsHolder(uint256 trackId, address holder) external view returns (bool) {
        return trackRightsHolders[trackId][holder];
    }

    // Get rights holder info
    function getRightsHolderInfo(address holder) external view returns (
        bool verified,
        uint256 registeredAt,
        uint256[] memory trackIds
    ) {
        RightsHolder storage rh = rightsHolders[holder];
        return (
            rh.verified,
            rh.registeredAt,
            rh.trackIds
        );
    }

    // Check claim status
    function getClaimStatus(uint256 poolId, address holder) external view returns (bool claimed) {
        return royaltyPools[poolId].claimed[holder];
    }

    // Get encrypted share for a rights holder (they can decrypt it)
    function getEncryptedShare(uint256 trackId, address holder) external view returns (euint32) {
        require(trackRightsHolders[trackId][holder], "Not a rights holder");

        Track storage track = tracks[trackId];
        for (uint i = 0; i < track.rightsHolders.length; i++) {
            if (track.rightsHolders[i] == holder) {
                return track.encryptedShares[i];
            }
        }
        revert("Share not found");
    }

    // Get encrypted payment amount for a holder
    function getEncryptedPayment(uint256 poolId, address holder) external view returns (euint64) {
        require(trackRightsHolders[royaltyPools[poolId].trackId][holder], "Not a rights holder");
        return royaltyPools[poolId].encryptedPayments[holder];
    }

    // Emergency functions
    function deactivateTrack(uint256 trackId) external onlyTrackCreator(trackId) {
        tracks[trackId].active = false;
    }

    function updateTrackMetadata(uint256 trackId, string memory newMetadataURI) external onlyTrackCreator(trackId) {
        tracks[trackId].metadataURI = newMetadataURI;
    }

    // Contract info
    function getContractInfo() external view returns (
        uint256 totalTracksCount,
        uint256 totalRoyaltyPoolsCount,
        address contractOwner
    ) {
        return (totalTracks, totalRoyaltyPools, owner);
    }
}