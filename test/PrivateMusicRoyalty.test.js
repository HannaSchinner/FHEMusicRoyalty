const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateMusicRoyalty", function () {
  let contract;
  let contractAddress;
  let owner;
  let artist1;
  let artist2;
  let artist3;
  let listener;

  async function deployContract() {
    const PrivateMusicRoyalty = await ethers.getContractFactory("PrivateMusicRoyalty");
    const deployedContract = await PrivateMusicRoyalty.deploy();
    await deployedContract.waitForDeployment();

    const address = await deployedContract.getAddress();
    return { contract: deployedContract, contractAddress: address };
  }

  beforeEach(async function () {
    [owner, artist1, artist2, artist3, listener] = await ethers.getSigners();
    ({ contract, contractAddress } = await deployContract());
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set correct owner", async function () {
      const contractInfo = await contract.getContractInfo();
      expect(contractInfo[2]).to.equal(owner.address);
    });

    it("should initialize with zero tracks", async function () {
      const contractInfo = await contract.getContractInfo();
      expect(contractInfo[0]).to.equal(0);
    });

    it("should initialize with zero royalty pools", async function () {
      const contractInfo = await contract.getContractInfo();
      expect(contractInfo[1]).to.equal(0);
    });
  });

  describe("Rights Holder Registration", function () {
    it("should allow user to register as rights holder", async function () {
      await expect(contract.connect(artist1).registerRightsHolder())
        .to.not.be.reverted;
    });

    it("should prevent double registration", async function () {
      await contract.connect(artist1).registerRightsHolder();
      await expect(contract.connect(artist1).registerRightsHolder())
        .to.be.revertedWith("Already registered");
    });

    it("should store rights holder information", async function () {
      await contract.connect(artist1).registerRightsHolder();

      const info = await contract.getRightsHolderInfo(artist1.address);
      expect(info[0]).to.equal(false);
      expect(info[1]).to.be.gt(0);
    });
  });

  describe("Rights Holder Verification", function () {
    beforeEach(async function () {
      await contract.connect(artist1).registerRightsHolder();
    });

    it("should allow owner to verify rights holder", async function () {
      await expect(contract.connect(owner).verifyRightsHolder(artist1.address))
        .to.not.be.reverted;
    });

    it("should prevent non-owner from verifying", async function () {
      await expect(contract.connect(artist2).verifyRightsHolder(artist1.address))
        .to.be.revertedWith("Not authorized");
    });

    it("should emit RightsHolderVerified event", async function () {
      await expect(contract.connect(owner).verifyRightsHolder(artist1.address))
        .to.emit(contract, "RightsHolderVerified")
        .withArgs(artist1.address);
    });
  });

  describe("Track Registration", function () {
    beforeEach(async function () {
      await contract.connect(artist1).registerRightsHolder();
      await contract.connect(artist2).registerRightsHolder();
      await contract.connect(owner).verifyRightsHolder(artist1.address);
      await contract.connect(owner).verifyRightsHolder(artist2.address);
    });

    it("should allow verified rights holder to register track", async function () {
      const holders = [artist1.address, artist2.address];
      const shares = [7000, 3000];

      await expect(
        contract.connect(artist1).registerTrack("ipfs://track1", holders, shares)
      ).to.not.be.reverted;
    });

    it("should prevent unverified rights holder from registering track", async function () {
      await contract.connect(listener).registerRightsHolder();

      const holders = [listener.address];
      const shares = [10000];

      await expect(
        contract.connect(listener).registerTrack("ipfs://track1", holders, shares)
      ).to.be.revertedWith("Not verified rights holder");
    });

    it("should require shares to sum to 10000", async function () {
      const holders = [artist1.address, artist2.address];
      const shares = [6000, 3000];

      await expect(
        contract.connect(artist1).registerTrack("ipfs://track1", holders, shares)
      ).to.be.revertedWith("Total shares must equal 10000 (100%)");
    });

    it("should emit TrackRegistered event", async function () {
      const holders = [artist1.address];
      const shares = [10000];

      await expect(
        contract.connect(artist1).registerTrack("ipfs://track1", holders, shares)
      ).to.emit(contract, "TrackRegistered");
    });
  });

  describe("Royalty Pool Creation", function () {
    beforeEach(async function () {
      await contract.connect(artist1).registerRightsHolder();
      await contract.connect(owner).verifyRightsHolder(artist1.address);

      const holders = [artist1.address];
      const shares = [10000];
      await contract.connect(artist1).registerTrack("ipfs://track1", holders, shares);
    });

    it("should allow anyone to create royalty pool with ETH", async function () {
      await expect(
        contract.connect(listener).createRoyaltyPool(1, {
          value: ethers.parseEther("1.0")
        })
      ).to.not.be.reverted;
    });

    it("should prevent creating pool with zero value", async function () {
      await expect(
        contract.connect(listener).createRoyaltyPool(1, { value: 0 })
      ).to.be.revertedWith("Must send ETH for royalty distribution");
    });

    it("should emit RoyaltyPoolCreated event", async function () {
      await expect(
        contract.connect(listener).createRoyaltyPool(1, {
          value: ethers.parseEther("1.0")
        })
      ).to.emit(contract, "RoyaltyPoolCreated");
    });
  });

  describe("Royalty Distribution", function () {
    beforeEach(async function () {
      await contract.connect(artist1).registerRightsHolder();
      await contract.connect(artist2).registerRightsHolder();
      await contract.connect(owner).verifyRightsHolder(artist1.address);
      await contract.connect(owner).verifyRightsHolder(artist2.address);

      const holders = [artist1.address, artist2.address];
      const shares = [7000, 3000];
      await contract.connect(artist1).registerTrack("ipfs://track1", holders, shares);

      await contract.connect(listener).createRoyaltyPool(1, {
        value: ethers.parseEther("10.0")
      });
    });

    it("should allow distribution of royalties", async function () {
      await expect(contract.distributeRoyalties(1))
        .to.not.be.reverted;
    });

    it("should prevent double distribution", async function () {
      await contract.distributeRoyalties(1);

      await expect(contract.distributeRoyalties(1))
        .to.be.revertedWith("Royalties already distributed");
    });
  });

  describe("Access Control", function () {
    it("should only allow owner to verify rights holders", async function () {
      await contract.connect(artist1).registerRightsHolder();

      await expect(
        contract.connect(artist2).verifyRightsHolder(artist1.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Gas Optimization", function () {
    it("should have reasonable gas cost for track registration", async function () {
      await contract.connect(artist1).registerRightsHolder();
      await contract.connect(owner).verifyRightsHolder(artist1.address);

      const holders = [artist1.address];
      const shares = [10000];

      const tx = await contract.connect(artist1).registerTrack("ipfs://track", holders, shares);
      const receipt = await tx.wait();

      expect(receipt.gasUsed).to.be.lt(1000000);
    });
  });
});
