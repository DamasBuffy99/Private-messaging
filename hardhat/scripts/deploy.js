// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers} = require("hardhat");
const {FIRST_ADDRESS, SECOND_ADDRESS, THIRD_ADDRESS} = require("../constants");

async function main() {
  const address1 = FIRST_ADDRESS;
  const address2 = SECOND_ADDRESS;
  const address3 = THIRD_ADDRESS;
  
  const privateMessagerieContract = await ethers.getContractFactory("privateMessagerie");
  const deployedPrivateMessagerieContract = await privateMessagerieContract.deploy(
    address1,
    address2,
    address3
  );

  await deployedPrivateMessagerieContract.deployed();

  console.log(
    `Private Messagerie Contract deployed to ${deployedPrivateMessagerieContract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
