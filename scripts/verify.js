const { run } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Contract Verification on Etherscan");
  console.log("========================================\n");

  const networkName = hre.network.name;
  
  if (networkName === "hardhat" || networkName === "localhost") {
    console.log("❌ Cannot verify contracts on local networks");
    console.log("Please use Sepolia or another supported network");
    process.exit(1);
  }

  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.log("❌ Deployment file not found:", deploymentFile);
    console.log("Please deploy the contract first using:");
    console.log(`npm run deploy:${networkName}`);
    process.exit(1);
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentData.contract.address;

  console.log("Network:", networkName);
  console.log("Contract Address:", contractAddress);
  console.log("\nVerifying contract on Etherscan...\n");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      contract: "contracts/PrivateMusicRoyalty.sol:PrivateMusicRoyalty"
    });

    console.log("\n✓ Contract verified successfully!");
    
    if (networkName === "sepolia") {
      console.log("\nEtherscan URL:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
    }

    deploymentData.verification = {
      verified: true,
      verifiedAt: new Date().toISOString(),
      network: networkName
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log("\n✓ Verification status updated in deployment file");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✓ Contract is already verified!");
      
      if (networkName === "sepolia") {
        console.log("\nEtherscan URL:");
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
      }
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log("\n========================================");
  console.log("Verification Complete!");
  console.log("========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
