import { parseEther } from "ethers";
import { network } from "hardhat";

async function main() {
  console.log("Starting deployment of FundRaising contract...");

  const net = await network.create();
  const ethers = net.ethers;

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const totalFundReq = parseEther("10.0"); // 10 ETH target
  const durationInSeconds = 7 * 24 * 60 * 60; // 7 days

  const fundRaising = await ethers.deployContract("FundRaising", [
    totalFundReq,
    durationInSeconds,
  ]);

  await fundRaising.waitForDeployment();
  const address = await fundRaising.getAddress();

  console.log("-----------------------------------------------");
  console.log("FundRaising contract deployed successfully!");
  console.log("Contract Address:", address);
  console.log("Owner Address:   ", deployer.address);
  console.log("Fund Goal:       ", ethers.formatEther(totalFundReq), "ETH");
  console.log("Duration:        ", durationInSeconds, "seconds (7 days)");
  console.log("-----------------------------------------------");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
