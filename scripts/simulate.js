const { ethers } = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Privacy-Preserving Royalty Simulation");
  console.log("========================================\n");

  const [deployer, artist1, artist2, artist3, listener] = await ethers.getSigners();

  console.log("Test Accounts:");
  console.log("- Deployer/Owner:", deployer.address);
  console.log("- Artist 1:", artist1.address);
  console.log("- Artist 2:", artist2.address);
  console.log("- Artist 3:", artist3.address);
  console.log("- Listener:", listener.address);
  console.log("");

  console.log("========================================");
  console.log("Step 1: Deploying Contract");
  console.log("========================================\n");

  const PrivateMusicRoyalty = await ethers.getContractFactory("PrivateMusicRoyalty");
  const contract = await PrivateMusicRoyalty.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("✓ Contract deployed at:", contractAddress);
  console.log("");

  console.log("========================================");
  console.log("Step 2: Registering Rights Holders");
  console.log("========================================\n");

  console.log("Registering Artist 1...");
  let tx = await contract.connect(artist1).registerRightsHolder();
  await tx.wait();
  console.log("✓ Artist 1 registered");

  console.log("Registering Artist 2...");
  tx = await contract.connect(artist2).registerRightsHolder();
  await tx.wait();
  console.log("✓ Artist 2 registered");

  console.log("Registering Artist 3...");
  tx = await contract.connect(artist3).registerRightsHolder();
  await tx.wait();
  console.log("✓ Artist 3 registered");
  console.log("");

  console.log("========================================");
  console.log("Step 3: Verifying Rights Holders");
  console.log("========================================\n");

  console.log("Owner verifying Artist 1...");
  tx = await contract.connect(deployer).verifyRightsHolder(artist1.address);
  await tx.wait();
  console.log("✓ Artist 1 verified");

  console.log("Owner verifying Artist 2...");
  tx = await contract.connect(deployer).verifyRightsHolder(artist2.address);
  await tx.wait();
  console.log("✓ Artist 2 verified");

  console.log("Owner verifying Artist 3...");
  tx = await contract.connect(deployer).verifyRightsHolder(artist3.address);
  await tx.wait();
  console.log("✓ Artist 3 verified");
  console.log("");

  console.log("========================================");
  console.log("Step 4: Registering Music Track");
  console.log("========================================\n");

  const holders = [artist1.address, artist2.address, artist3.address];
  const shares = [5000, 3000, 2000]; // 50%, 30%, 20%

  console.log("Track Rights Distribution:");
  console.log("- Artist 1: 50%");
  console.log("- Artist 2: 30%");
  console.log("- Artist 3: 20%");
  console.log("");

  console.log("Registering track with encrypted shares...");
  tx = await contract.connect(artist1).registerTrack(
    "ipfs://QmExampleMusicTrackMetadata",
    holders,
    shares
  );
  const receipt = await tx.wait();
  console.log("✓ Track registered successfully");
  console.log("- Track ID: 1");
  console.log("- Metadata URI: ipfs://QmExampleMusicTrackMetadata");
  console.log("");

  const trackInfo = await contract.getTrackInfo(1);
  console.log("Track Information:");
  console.log("- Active:", trackInfo[0]);
  console.log("- Rights Holders Count:", trackInfo[4].toString());
  console.log("");

  console.log("========================================");
  console.log("Step 5: Creating Royalty Pool");
  console.log("========================================\n");

  const royaltyAmount = ethers.parseEther("10.0");
  console.log("Creating royalty pool with", ethers.formatEther(royaltyAmount), "ETH");

  tx = await contract.connect(listener).createRoyaltyPool(1, { value: royaltyAmount });
  await tx.wait();
  console.log("✓ Royalty pool created");
  console.log("- Pool ID: 1");
  console.log("- Track ID: 1");
  console.log("- Total Amount: 10.0 ETH (encrypted)");
  console.log("");

  console.log("========================================");
  console.log("Step 6: Distributing Royalties");
  console.log("========================================\n");

  console.log("Calculating encrypted payments for each artist...");
  tx = await contract.distributeRoyalties(1);
  await tx.wait();
  console.log("✓ Royalties distributed");
  console.log("");

  console.log("Expected Distribution (encrypted on-chain):");
  console.log("- Artist 1: 5.0 ETH (50%)");
  console.log("- Artist 2: 3.0 ETH (30%)");
  console.log("- Artist 3: 2.0 ETH (20%)");
  console.log("");

  const poolInfo = await contract.getPoolInfo(1);
  console.log("Pool Information:");
  console.log("- Distributed:", poolInfo[1]);
  console.log("- Payees Count:", poolInfo[3].length);
  console.log("");

  console.log("========================================");
  console.log("Step 7: Privacy Features Demonstration");
  console.log("========================================\n");

  console.log("Privacy Features:");
  console.log("✓ Individual share percentages are encrypted");
  console.log("✓ Payment amounts are encrypted on-chain");
  console.log("✓ Only rights holders can see their own shares");
  console.log("✓ Third parties cannot see distribution details");
  console.log("");

  console.log("========================================");
  console.log("Contract State Summary");
  console.log("========================================\n");

  const contractInfo = await contract.getContractInfo();
  console.log("Final Contract State:");
  console.log("- Total Tracks:", contractInfo[0].toString());
  console.log("- Total Royalty Pools:", contractInfo[1].toString());
  console.log("- Contract Owner:", contractInfo[2]);
  console.log("");

  console.log("========================================");
  console.log("Simulation Complete!");
  console.log("========================================\n");

  console.log("Summary:");
  console.log("✓ Contract deployed successfully");
  console.log("✓ 3 rights holders registered and verified");
  console.log("✓ 1 music track registered with encrypted shares");
  console.log("✓ 1 royalty pool created with 10 ETH");
  console.log("✓ Royalties distributed with privacy preservation");
  console.log("");

  console.log("Note: This simulation demonstrates the core functionality");
  console.log("of the privacy-preserving music royalty system using FHE.");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Simulation Failed:");
    console.error(error);
    process.exit(1);
  });
