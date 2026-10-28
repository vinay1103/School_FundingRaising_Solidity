import { expect } from "chai";
import { parseEther } from "ethers";
import { network } from "hardhat";

describe("FundRaising Smart Contract", function () {
  let ethers;
  let fundRaising;
  let owner;
  let donor1;
  let donor2;
  let donor3;
  let nonDonor;

  const FUND_REQ = parseEther("10.0");
  const DURATION = 3600; // 1 hour

  async function increaseTime(seconds) {
    await ethers.provider.send("evm_increaseTime", [seconds]);
    await ethers.provider.send("evm_mine", []);
  }

  async function expectRevert(promise, expectedReason) {
    try {
      await promise;
      expect.fail(`Expected transaction to revert with "${expectedReason}", but it succeeded.`);
    } catch (err) {
      if (err.name === "AssertionError" && err.message.startsWith("Expected transaction to revert")) {
        throw err;
      }
      if (expectedReason) {
        expect(err.message).to.include(expectedReason);
      }
    }
  }

  beforeEach(async function () {
    const net = await network.create();
    ethers = net.ethers;
    [owner, donor1, donor2, donor3, nonDonor] = await ethers.getSigners();

    fundRaising = await ethers.deployContract("FundRaising", [
      FUND_REQ,
      DURATION,
    ]);
  });

  describe("Deployment & Initialization", function () {
    it("Should correctly set the owner, totalFundReq, and initial state", async function () {
      expect(await fundRaising.owner()).to.equal(owner.address);
      expect(await fundRaising.totalFundReq()).to.equal(FUND_REQ);
      expect(await fundRaising.totalFundRaised()).to.equal(0n);
      expect(await fundRaising.totalDonar()).to.equal(0n);
      expect(await fundRaising.totalVote()).to.equal(0n);
      expect(await fundRaising.votingStatus()).to.equal(false);
    });
  });

  describe("Donations (sendFund)", function () {
    it("Should accept donations from donors and update accounting", async function () {
      const contribution = parseEther("1.0");

      await fundRaising.connect(donor1).sendFund({ value: contribution });

      expect(await fundRaising.donars(donor1.address)).to.equal(contribution);
      expect(await fundRaising.totalFundRaised()).to.equal(contribution);
      expect(await fundRaising.totalDonar()).to.equal(1n);
      expect(await fundRaising.getContractBalance()).to.equal(contribution);
    });

    it("Should correctly track multiple donations from same and different donors", async function () {
      const val1 = parseEther("1.0");
      const val2 = parseEther("2.0");

      await fundRaising.connect(donor1).sendFund({ value: val1 });
      await fundRaising.connect(donor1).sendFund({ value: val1 });
      await fundRaising.connect(donor2).sendFund({ value: val2 });

      expect(await fundRaising.donars(donor1.address)).to.equal(parseEther("2.0"));
      expect(await fundRaising.donars(donor2.address)).to.equal(val2);
      expect(await fundRaising.totalDonar()).to.equal(2n);
      expect(await fundRaising.totalFundRaised()).to.equal(parseEther("4.0"));
    });

    it("Should reject donation from school owner", async function () {
      await expectRevert(
        fundRaising.connect(owner).sendFund({ value: parseEther("1.0") }),
        "School cannot participate in fund raising!!"
      );
    });

    it("Should reject 0 value donation", async function () {
      await expectRevert(
        fundRaising.connect(donor1).sendFund({ value: 0 }),
        "Minimum contribution is 1"
      );
    });

    it("Should reject donations after deadline has passed", async function () {
      await increaseTime(DURATION + 10);

      await expectRevert(
        fundRaising.connect(donor1).sendFund({ value: parseEther("1.0") }),
        "Deadline has passed !!"
      );
    });
  });

  describe("Voting (startVoting & putVote)", function () {
    const contribution = parseEther("1.0");
    const votingDuration = 1800; // 30 minutes

    beforeEach(async function () {
      await fundRaising.connect(donor1).sendFund({ value: contribution });
      await fundRaising.connect(donor2).sendFund({ value: contribution });
      await fundRaising.connect(donor3).sendFund({ value: contribution });
    });

    it("Should revert if voting is started before deadline", async function () {
      await expectRevert(
        fundRaising.connect(owner).startVoting(votingDuration),
        "Deadline has not passed yet!!"
      );
    });

    it("Should revert if non-owner tries to start voting", async function () {
      await increaseTime(DURATION + 10);
      await expectRevert(
        fundRaising.connect(donor1).startVoting(votingDuration),
        "Only School can start voting"
      );
    });

    it("Should allow owner to start voting after deadline", async function () {
      await increaseTime(DURATION + 10);
      await fundRaising.connect(owner).startVoting(votingDuration);

      expect(await fundRaising.votingStatus()).to.equal(true);
    });

    it("Should allow eligible donors to cast a vote", async function () {
      await increaseTime(DURATION + 10);
      await fundRaising.connect(owner).startVoting(votingDuration);

      await fundRaising.connect(donor1).putVote();
      expect(await fundRaising.totalVote()).to.equal(1n);
      expect(await fundRaising.voted(donor1.address)).to.equal(true);
    });

    it("Should prevent non-contributors from voting", async function () {
      await increaseTime(DURATION + 10);
      await fundRaising.connect(owner).startVoting(votingDuration);

      await expectRevert(
        fundRaising.connect(nonDonor).putVote(),
        "You are not allowed to participate as you have not cotributed!!"
      );
    });

    it("Should prevent double voting by the same donor", async function () {
      await increaseTime(DURATION + 10);
      await fundRaising.connect(owner).startVoting(votingDuration);

      await fundRaising.connect(donor1).putVote();
      await expectRevert(
        fundRaising.connect(donor1).putVote(),
        "You have already voted!!"
      );
    });

    it("Should reject vote after voting window ends", async function () {
      await increaseTime(DURATION + 10);
      await fundRaising.connect(owner).startVoting(votingDuration);

      await increaseTime(votingDuration + 10);
      await expectRevert(
        fundRaising.connect(donor1).putVote(),
        "Voting time has passed!!"
      );
    });
  });

  describe("Claiming Funds (claimFund)", function () {
    const contribution = parseEther("10.0");
    const votingDuration = 1800; // 30 minutes

    beforeEach(async function () {
      await fundRaising.connect(donor1).sendFund({ value: contribution });
      await fundRaising.connect(donor2).sendFund({ value: contribution });
    });

    it("Should reject claim if crowdfunding is not over yet", async function () {
      await expectRevert(
        fundRaising.connect(owner).claimFund(),
        "Crowdfunding not over yet!!"
      );
    });

    it("Should reject claim from non-owner", async function () {
      await increaseTime(DURATION + 10);
      await expectRevert(
        fundRaising.connect(donor1).claimFund(),
        "Only School can claim the funds!!"
      );
    });

    it("Should allow initial 10% disbursement on first claim (totalAsk == 1)", async function () {
      await increaseTime(DURATION + 10);

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

      // Total raised is 20 ETH -> 10% is 2 ETH
      const tx = await fundRaising.connect(owner).claimFund();
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      const expectedPayout = parseEther("2.0");

      expect(finalOwnerBalance + gasCost - initialOwnerBalance).to.equal(expectedPayout);
      expect(await fundRaising.getContractBalance()).to.equal(parseEther("18.0"));
    });

    it("Should reject second claim if majority vote is not reached", async function () {
      await increaseTime(DURATION + 10);
      // First claim (10%)
      await fundRaising.connect(owner).claimFund();

      // Start voting: 2 donors total, requires > 2/2 (i.e. > 1, so 2 votes)
      await fundRaising.connect(owner).startVoting(votingDuration);
      // Only 1 donor votes
      await fundRaising.connect(donor1).putVote();

      await increaseTime(votingDuration + 10);

      await expectRevert(
        fundRaising.connect(owner).claimFund(),
        "Majority does not support"
      );
    });

    it("Should disburse remaining funds on second claim when majority supports", async function () {
      await increaseTime(DURATION + 10);
      // First claim (10%)
      await fundRaising.connect(owner).claimFund();

      // Start voting
      await fundRaising.connect(owner).startVoting(votingDuration);
      // Both donors vote (2/2 votes > 2/2 = 1)
      await fundRaising.connect(donor1).putVote();
      await fundRaising.connect(donor2).putVote();

      await increaseTime(votingDuration + 10);

      // Second claim should disburse remaining 18 ETH
      const tx = await fundRaising.connect(owner).claimFund();
      await tx.wait();

      expect(await fundRaising.getContractBalance()).to.equal(0n);

      // Attempting a third claim should fail
      await expectRevert(
        fundRaising.connect(owner).claimFund(),
        "Fund is already claim!!"
      );
    });
  });
});
