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
  
  const privateMessagingContract = await ethers.getContractFactory("privateMessaging");
  const deployedPrivateMessagingContract = await privateMessagingContract.deploy(
    "0x2f4CeD9de445D0307F755E8056712bEdD284c5Bc",
    "0x359B25770754Fe31c8fCd5B64C01273FFE725A0a",
    "0x45D514682afaf49d3B31dc5544945E3058f9EEF1"
  );

  await deployedPrivateMessagingContract.deployed();

  console.log(
    `Private Messaging Contract deployed to ${deployedPrivateMessagingContract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
