const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Private Music Royalty Contract Deployment");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("Network Information:");
  console.log("- Network Name:", hre.network.name);
  console.log("- Chain ID:", network.chainId.toString());
  console.log("\nDeployer Information:");
  console.log("- Address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("- Balance:", ethers.formatEther(balance), "ETH");
  
  console.log("\n========================================");
  console.log("Deploying PrivateMusicRoyalty Contract...");
  console.log("========================================\n");

  const PrivateMusicRoyalty = await ethers.getContractFactory("PrivateMusicRoyalty");
  
  console.log("Initiating deployment...");
  const startTime = Date.now();
  
  const contract = await PrivateMusicRoyalty.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  const deployTime = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log("\n✓ Contract deployed successfully!");
  console.log("- Contract Address:", contractAddress);
  console.log("- Deployment Time:", deployTime, "seconds");
  
  const deploymentReceipt = await contract.deploymentTransaction().wait();
  console.log("- Block Number:", deploymentReceipt.blockNumber);
  console.log("- Gas Used:", deploymentReceipt.gasUsed.toString());
  console.log("- Transaction Hash:", deploymentReceipt.hash);
  
  const deploymentInfo = {
    contract: {
      name: "PrivateMusicRoyalty",
      address: contractAddress,
      transactionHash: deploymentReceipt.hash
    },
    network: {
      name: hre.network.name,
      chainId: network.chainId.toString()
    },
    deployer: {
      address: deployer.address,
      balance: ethers.formatEther(balance)
    },
    deployment: {
      blockNumber: deploymentReceipt.blockNumber,
      gasUsed: deploymentReceipt.gasUsed.toString(),
      timestamp: new Date().toISOString(),
      deploymentTime: deployTime + " seconds"
    }
  };

  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const filename = `${hre.network.name}-deployment.json`;
  const filepath = path.join(deploymentDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n✓ Deployment information saved to:", filename);

  if (hre.network.name === "sepolia") {
    console.log("\n========================================");
    console.log("Etherscan Verification");
    console.log("========================================\n");
    console.log("Contract Address:", contractAddress);
    console.log("Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("\nTo verify, run:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
  }

  console.log("\n========================================");
  console.log("Deployment Complete!");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment Failed:");
    console.error(error);
    process.exit(1);
  });
