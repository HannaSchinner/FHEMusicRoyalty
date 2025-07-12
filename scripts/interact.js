const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Contract Interaction Script");
  console.log("========================================\n");

  const networkName = hre.network.name;
  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.log("❌ Deployment file not found for network:", networkName);
    console.log("Please deploy the contract first");
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentData.contract.address;

  console.log("Network:", networkName);
  console.log("Contract Address:", contractAddress);
  console.log("");

  const [signer] = await ethers.getSigners();
  console.log("Interacting with account:", signer.address);
  console.log("");

  const contract = await ethers.getContractAt("PrivateMusicRoyalty", contractAddress);

  console.log("========================================");
  console.log("Reading Contract State");
  console.log("========================================\n");

  try {
    const contractInfo = await contract.getContractInfo();
    console.log("Contract Information:");
    console.log("- Total Tracks:", contractInfo[0].toString());
    console.log("- Total Royalty Pools:", contractInfo[1].toString());
    console.log("- Contract Owner:", contractInfo[2]);
    console.log("");

    const rightsHolderInfo = await contract.getRightsHolderInfo(signer.address);
    console.log("Current Account Rights Holder Info:");
    console.log("- Verified:", rightsHolderInfo[0]);
    console.log("- Registered At:", rightsHolderInfo[1].toString());
    console.log("- Track IDs:", rightsHolderInfo[2].length > 0 ? rightsHolderInfo[2].toString() : "None");
    console.log("");

  } catch (error) {
    console.error("Error reading contract state:", error.message);
  }

  console.log("========================================");
  console.log("Available Interaction Functions");
  console.log("========================================\n");
  
  console.log("Rights Holder Management:");
  console.log("1. registerRightsHolder()");
  console.log("2. verifyRightsHolder(address)");
  console.log("");
  
  console.log("Track Management:");
  console.log("3. registerTrack(metadataURI, holders[], shares[])");
  console.log("4. getTrackInfo(trackId)");
  console.log("5. deactivateTrack(trackId)");
  console.log("6. updateTrackMetadata(trackId, newMetadataURI)");
  console.log("");
  
  console.log("Royalty Management:");
  console.log("7. createRoyaltyPool(trackId) {value: amount}");
  console.log("8. distributeRoyalties(poolId)");
  console.log("9. claimRoyalty(poolId)");
  console.log("10. getPoolInfo(poolId)");
  console.log("");

  console.log("Example Usage:");
  console.log("================\n");
  
  console.log("// Register as a rights holder");
  console.log('const tx1 = await contract.registerRightsHolder();');
  console.log('await tx1.wait();');
  console.log("");
  
  console.log("// Register a track (after being verified)");
  console.log('const holders = ["0x...", "0x..."];');
  console.log('const shares = [7000, 3000]; // 70% and 30%');
  console.log('const tx2 = await contract.registerTrack("ipfs://metadata", holders, shares);');
  console.log('await tx2.wait();');
  console.log("");
  
  console.log("// Create royalty pool");
  console.log('const tx3 = await contract.createRoyaltyPool(1, {');
  console.log('  value: ethers.parseEther("1.0")');
  console.log('});');
  console.log('await tx3.wait();');
  console.log("");
  
  console.log("// Distribute royalties");
  console.log('const tx4 = await contract.distributeRoyalties(1);');
  console.log('await tx4.wait();');
  console.log("");

  console.log("========================================");
  console.log("Interaction Script Complete");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
