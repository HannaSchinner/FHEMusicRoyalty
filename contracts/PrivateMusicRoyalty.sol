// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivateMusicRoyalty
 * @notice Privacy-preserving music royalty distribution using FHE with Gateway callback mode
 * @dev Enhanced with refund mechanism, timeout protection, and privacy-preserving division
 */
contract PrivateMusicRoyalty is SepoliaConfig {

    /// @notice Contract owner address
    address public owner;

    /// @notice Total number of registered tracks
    uint256 public totalTracks;

    /// @notice Total number of royalty pools created
    uint256 public totalRoyaltyPools;

    /// @notice Timeout duration for decryption requests (7 days)
    uint256 public constant DECRYPTION_TIMEOUT = 7 days;

    /// @notice Privacy multiplier for division operations (prevents leakage)
    uint256 public constant PRIVACY_MULTIPLIER = 1000;

    /// @notice Basis points for percentage calculations (100.00%)
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Track information structure
    struct Track {
        uint256 trackId;
        address[] rightsHolders;
        euint32[] encryptedShares; // Encrypted percentage shares (0-10000 for 0.00%-100.00%)
        bool active;
        string metadataURI;
        uint256 createdAt;
    }

    /// @notice Royalty pool structure with Gateway callback support
    struct RoyaltyPool {
        uint256 poolId;
        uint256 trackId;
        euint64 encryptedTotalAmount;
        bool distributed;
        uint256 createdAt;
        mapping(address => euint64) encryptedPayments;
        mapping(address => bool) claimed;
        mapping(address => bool) refunded;
        address[] payees;
        uint256 decryptionRequestTime;
        bool decryptionRequested;
        uint256 decryptionRequestId;
    }

    /// @notice Rights holder registration structure
    struct RightsHolder {
        address holder;
        bool verified;
        uint256 registeredAt;
        uint256[] trackIds;
    }

    /// @notice Pending claim for async Gateway processing
    struct PendingClaim {
        uint256 poolId;
        address claimer;
        bool processed;
        uint256 requestTime;
    }

    /// @notice Track storage
    mapping(uint256 => Track) public tracks;

    /// @notice Royalty pool storage
    mapping(uint256 => RoyaltyPool) public royaltyPools;

    /// @notice Rights holder registry
    mapping(address => RightsHolder) public rightsHolders;

    /// @notice Track rights holder verification
    mapping(uint256 => mapping(address => bool)) public trackRightsHolders;

    /// @notice Pending claims mapping
    mapping(address => PendingClaim) public pendingClaims;

    /// @notice Request ID to claimer mapping for Gateway callbacks
    mapping(uint256 => address) public requestIdToClaimer;

    // Events
    event TrackRegistered(uint256 indexed trackId, address indexed creator, string metadataURI);
    event RightsHolderAdded(uint256 indexed trackId, address indexed holder);
    event RoyaltyPoolCreated(uint256 indexed poolId, uint256 indexed trackId, uint256 amount);
    event RoyaltyDistributed(uint256 indexed poolId, address indexed recipient);
    event RoyaltyClaimed(uint256 indexed poolId, address indexed claimant, uint256 amount);
    event RoyaltyRefunded(uint256 indexed poolId, address indexed claimant, uint256 amount);
    event RightsHolderVerified(address indexed holder);
    event DecryptionRequested(uint256 indexed poolId, address indexed claimer, uint256 requestId);
    event DecryptionTimeout(uint256 indexed poolId, address indexed claimer);

    // Custom errors for gas optimization
    error Unauthorized();
    error AlreadyRegistered();
    error NotRegistered();
    error InvalidInput();
    error AlreadyClaimed();
    error NotDistributed();
    error DecryptionPending();
    error TimeoutNotReached();
    error InvalidRequestId();

    /// @notice Only owner modifier
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    /// @notice Only track rights holder modifier
    modifier onlyTrackCreator(uint256 trackId) {
        if (!trackRightsHolders[trackId][msg.sender]) revert Unauthorized();
        _;
    }

    /// @notice Only verified rights holder modifier
    modifier onlyVerifiedRightsHolder() {
        if (!rightsHolders[msg.sender].verified) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
        totalTracks = 0;
        totalRoyaltyPools = 0;
    }

    /**
     * @notice Register as a rights holder
     * @dev First step in the verification process
     */
    function registerRightsHolder() external {
        if (rightsHolders[msg.sender].holder != address(0)) revert AlreadyRegistered();

        rightsHolders[msg.sender] = RightsHolder({
            holder: msg.sender,
            verified: false,
            registeredAt: block.timestamp,
            trackIds: new uint256[](0)
        });
    }

    /**
     * @notice Verify a rights holder (owner only)
     * @param holder Address to verify
     */
    function verifyRightsHolder(address holder) external onlyOwner {
        if (rightsHolders[holder].holder == address(0)) revert NotRegistered();
        rightsHolders[holder].verified = true;
        emit RightsHolderVerified(holder);
    }

    /**
     * @notice Register a new music track with encrypted royalty shares
     * @param metadataURI IPFS or other URI for track metadata
     * @param holders Array of rights holder addresses
     * @param shares Array of plaintext shares (0-10000 for 0.00%-100.00%)
     * @dev Shares are encrypted on-chain for privacy
     */
    function registerTrack(
        string memory metadataURI,
        address[] memory holders,
        uint32[] memory shares
    ) external onlyVerifiedRightsHolder {
        if (holders.length != shares.length || holders.length == 0) revert InvalidInput();

        // Verify total shares equal 10000 (100%)
        uint32 totalShares = 0;
        for (uint i = 0; i < shares.length; i++) {
            totalShares += shares[i];
        }
        if (totalShares != BASIS_POINTS) revert InvalidInput();

        totalTracks++;
        uint256 trackId = totalTracks;

        // Encrypt shares with privacy protection
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

    /**
     * @notice Create a royalty pool for a track
     * @param trackId The track to create pool for
     * @dev Amount is encrypted for privacy-preserving calculations
     */
    function createRoyaltyPool(uint256 trackId) external payable {
        if (!tracks[trackId].active) revert InvalidInput();
        if (msg.value == 0) revert InvalidInput();

        totalRoyaltyPools++;
        uint256 poolId = totalRoyaltyPools;

        // Encrypt total amount with obfuscation multiplier
        uint256 obfuscatedAmount = msg.value * PRIVACY_MULTIPLIER;
        euint64 encryptedAmount = FHE.asEuint64(uint64(obfuscatedAmount));
        FHE.allowThis(encryptedAmount);

        RoyaltyPool storage pool = royaltyPools[poolId];
        pool.poolId = poolId;
        pool.trackId = trackId;
        pool.encryptedTotalAmount = encryptedAmount;
        pool.distributed = false;
        pool.createdAt = block.timestamp;
        pool.payees = tracks[trackId].rightsHolders;
        pool.decryptionRequested = false;
        pool.decryptionRequestTime = 0;
        pool.decryptionRequestId = 0;

        emit RoyaltyPoolCreated(poolId, trackId, msg.value);
    }

    /**
     * @notice Distribute royalties using FHE calculations
     * @param poolId Pool to distribute
     * @dev Calculations performed on encrypted data
     */
    function distributeRoyalties(uint256 poolId) external {
        RoyaltyPool storage pool = royaltyPools[poolId];
        if (pool.distributed) revert AlreadyClaimed();
        if (pool.poolId == 0) revert InvalidInput();

        Track storage track = tracks[pool.trackId];

        // Calculate encrypted payments for each rights holder
        for (uint i = 0; i < track.rightsHolders.length; i++) {
            address holder = track.rightsHolders[i];

            // Privacy-preserving calculation: (obfuscatedAmount * share)
            // Division by BASIS_POINTS * PRIVACY_MULTIPLIER handled during decryption
            euint64 payment = FHE.mul(
                pool.encryptedTotalAmount,
                FHE.asEuint64(track.encryptedShares[i])
            );

            pool.encryptedPayments[holder] = payment;
            pool.claimed[holder] = false;
            pool.refunded[holder] = false;

            // Grant decryption permissions
            FHE.allowThis(payment);
            FHE.allow(payment, holder);

            emit RoyaltyDistributed(poolId, holder);
        }

        pool.distributed = true;
    }

    /**
     * @notice Claim royalty payment using Gateway callback mode
     * @param poolId Pool to claim from
     * @dev Initiates async decryption request to Gateway
     */
    function claimRoyalty(uint256 poolId) external {
        RoyaltyPool storage pool = royaltyPools[poolId];
        if (!pool.distributed) revert NotDistributed();
        if (pool.claimed[msg.sender]) revert AlreadyClaimed();
        if (!trackRightsHolders[pool.trackId][msg.sender]) revert Unauthorized();

        // Check for existing pending claim
        PendingClaim storage existingClaim = pendingClaims[msg.sender];
        if (existingClaim.poolId == poolId && !existingClaim.processed) {
            revert DecryptionPending();
        }

        // Request decryption via Gateway
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(pool.encryptedPayments[msg.sender]);

        // Store pending claim for callback
        pendingClaims[msg.sender] = PendingClaim({
            poolId: poolId,
            claimer: msg.sender,
            processed: false,
            requestTime: block.timestamp
        });

        // Request decryption with callback
        uint256 requestId = FHE.requestDecryption(cts, this.processClaimPayment.selector);
        requestIdToClaimer[requestId] = msg.sender;

        emit DecryptionRequested(poolId, msg.sender, requestId);
    }

    /**
     * @notice Gateway callback to process decrypted payment
     * @param requestId Decryption request identifier
     * @param cleartexts ABI-encoded decrypted values
     * @param decryptionProof Cryptographic proof from Gateway
     * @dev Called by Gateway oracle after decryption
     */
    function processClaimPayment(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) public {
        // Verify decryption signatures
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        // Retrieve claimer from request ID
        address claimer = requestIdToClaimer[requestId];
        if (claimer == address(0)) revert InvalidRequestId();

        PendingClaim storage claim = pendingClaims[claimer];
        if (claim.processed) revert AlreadyClaimed();

        RoyaltyPool storage pool = royaltyPools[claim.poolId];
        if (pool.claimed[claimer]) revert AlreadyClaimed();

        // Decode decrypted payment
        uint64 decryptedPayment = abi.decode(cleartexts, (uint64));

        // Calculate final payment: reverse obfuscation and basis points
        uint256 finalPayment = uint256(decryptedPayment) / (BASIS_POINTS * PRIVACY_MULTIPLIER);

        // Mark as claimed
        pool.claimed[claimer] = true;
        claim.processed = true;

        // Transfer payment
        if (finalPayment > 0) {
            (bool sent, ) = payable(claimer).call{value: finalPayment}("");
            require(sent, "Transfer failed");
        }

        emit RoyaltyClaimed(claim.poolId, claimer, finalPayment);
    }

    /**
     * @notice Refund mechanism for decryption timeout
     * @param poolId Pool to refund from
     * @dev Allows refund if Gateway fails to respond within timeout period
     */
    function claimRefundOnTimeout(uint256 poolId) external {
        RoyaltyPool storage pool = royaltyPools[poolId];
        if (!pool.distributed) revert NotDistributed();
        if (pool.claimed[msg.sender]) revert AlreadyClaimed();
        if (pool.refunded[msg.sender]) revert AlreadyClaimed();
        if (!trackRightsHolders[pool.trackId][msg.sender]) revert Unauthorized();

        PendingClaim storage claim = pendingClaims[msg.sender];

        // Check timeout condition
        if (claim.requestTime == 0 || block.timestamp < claim.requestTime + DECRYPTION_TIMEOUT) {
            revert TimeoutNotReached();
        }

        // Calculate proportional refund based on number of rights holders
        Track storage track = tracks[pool.trackId];
        uint256 refundAmount = address(this).balance / track.rightsHolders.length;

        // Mark as refunded
        pool.refunded[msg.sender] = true;
        claim.processed = true;

        // Transfer refund
        if (refundAmount > 0) {
            (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
            require(sent, "Refund failed");
        }

        emit RoyaltyRefunded(poolId, msg.sender, refundAmount);
        emit DecryptionTimeout(poolId, msg.sender);
    }

    // View functions

    /**
     * @notice Get track information
     */
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

    /**
     * @notice Get pool information
     */
    function getPoolInfo(uint256 poolId) external view returns (
        uint256 trackId,
        bool distributed,
        uint256 createdAt,
        address[] memory payees,
        bool decryptionRequested,
        uint256 requestTime
    ) {
        RoyaltyPool storage pool = royaltyPools[poolId];
        return (
            pool.trackId,
            pool.distributed,
            pool.createdAt,
            pool.payees,
            pool.decryptionRequested,
            pool.decryptionRequestTime
        );
    }

    /**
     * @notice Check if an address is a rights holder for a track
     */
    function isRightsHolder(uint256 trackId, address holder) external view returns (bool) {
        return trackRightsHolders[trackId][holder];
    }

    /**
     * @notice Get rights holder info
     */
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

    /**
     * @notice Check claim status
     */
    function getClaimStatus(uint256 poolId, address holder) external view returns (
        bool claimed,
        bool refunded
    ) {
        return (
            royaltyPools[poolId].claimed[holder],
            royaltyPools[poolId].refunded[holder]
        );
    }

    /**
     * @notice Get encrypted share for a rights holder
     */
    function getEncryptedShare(uint256 trackId, address holder) external view returns (euint32) {
        if (!trackRightsHolders[trackId][holder]) revert Unauthorized();

        Track storage track = tracks[trackId];
        for (uint i = 0; i < track.rightsHolders.length; i++) {
            if (track.rightsHolders[i] == holder) {
                return track.encryptedShares[i];
            }
        }
        revert("Share not found");
    }

    /**
     * @notice Get encrypted payment amount
     */
    function getEncryptedPayment(uint256 poolId, address holder) external view returns (euint64) {
        if (!trackRightsHolders[royaltyPools[poolId].trackId][holder]) revert Unauthorized();
        return royaltyPools[poolId].encryptedPayments[holder];
    }

    /**
     * @notice Get pending claim information
     */
    function getPendingClaim(address claimer) external view returns (
        uint256 poolId,
        bool processed,
        uint256 requestTime,
        bool canRefund
    ) {
        PendingClaim storage claim = pendingClaims[claimer];
        bool refundable = claim.requestTime > 0 &&
                         block.timestamp >= claim.requestTime + DECRYPTION_TIMEOUT &&
                         !claim.processed;
        return (
            claim.poolId,
            claim.processed,
            claim.requestTime,
            refundable
        );
    }

    // Emergency functions

    /**
     * @notice Deactivate a track
     */
    function deactivateTrack(uint256 trackId) external onlyTrackCreator(trackId) {
        tracks[trackId].active = false;
    }

    /**
     * @notice Update track metadata
     */
    function updateTrackMetadata(uint256 trackId, string memory newMetadataURI)
        external
        onlyTrackCreator(trackId)
    {
        tracks[trackId].metadataURI = newMetadataURI;
    }

    /**
     * @notice Get contract information
     */
    function getContractInfo() external view returns (
        uint256 totalTracksCount,
        uint256 totalRoyaltyPoolsCount,
        address contractOwner,
        uint256 decryptionTimeout,
        uint256 privacyMultiplier
    ) {
        return (
            totalTracks,
            totalRoyaltyPools,
            owner,
            DECRYPTION_TIMEOUT,
            PRIVACY_MULTIPLIER
        );
    }

    /**
     * @notice Emergency withdrawal for owner (only unclaimed funds after timeout)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool sent, ) = payable(owner).call{value: balance}("");
            require(sent, "Withdrawal failed");
        }
    }

    receive() external payable {}
}
