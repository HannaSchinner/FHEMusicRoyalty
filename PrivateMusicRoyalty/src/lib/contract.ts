export const CONTRACT_ADDRESS = "0xB6082579c37D6974EcFfB87d29309eDB80f8bC90";

export const CONTRACT_ABI = [
  "function registerRightsHolder() external",
  "function verifyRightsHolder(address holder) external",
  "function registerTrack(string memory metadataURI, address[] memory holders, uint32[] memory shares) external",
  "function createRoyaltyPool(uint256 trackId) external payable",
  "function distributeRoyalties(uint256 poolId) external",
  "function claimRoyalty(uint256 poolId) external",
  "function getContractInfo() external view returns (uint256, uint256, address)",
  "function getRightsHolderInfo(address holder) external view returns (bool, uint256, uint256[])",
  "function getTrackInfo(uint256 trackId) external view returns (bool, string, uint256, address[], uint32[])",
  "function getPoolInfo(uint256 poolId) external view returns (uint256, uint256, bool, uint256, address[])",
  "function isRightsHolder(uint256 trackId, address holder) external view returns (bool)",
  "function getClaimStatus(uint256 poolId, address holder) external view returns (bool)",
  "function getPaymentAmount(uint256 poolId, address holder) external view returns (uint256)"
];
