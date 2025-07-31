const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Simple Music Royalty contract...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const SimpleMusicRoyalty = await ethers.getContractFactory("SimpleMusicRoyalty");
  const contract = await SimpleMusicRoyalty.deploy();

  await contract.deployed();

  console.log("SimpleMusicRoyalty contract deployed to:", contract.address);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contract.address,
    deployer: deployer.address,
    network: hre.network.name,
    deploymentTime: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    gasUsed: (await contract.deployTransaction.wait()).gasUsed.toString()
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment-info.json");

  // Verify contract on Etherscan (if on testnet/mainnet)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await contract.deployTransaction.wait(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contract.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });