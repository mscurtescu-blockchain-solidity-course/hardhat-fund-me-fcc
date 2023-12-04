const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
        let fundMe
        let mockV3Aggregator
        let deployer
        // const sendValue = ethers.units.parseEther("1")
        const sendValue = ethers.parseEther("1")

        beforeEach(async function () {
            const accounts = await ethers.getSigners()
            deployer = accounts[0].address

            await deployments.fixture(["all"])

            const fundMeDeployment = await deployments.get("FundMe")
            fundMe = await ethers.getContractAt(
                fundMeDeployment.abi,
                fundMeDeployment.address
            )

            const mockV3AggregatorDeployment = await deployments.get(
                "MockV3Aggregator"
            )
            mockV3Aggregator = await ethers.getContractAt(
                mockV3AggregatorDeployment.abi,
                mockV3AggregatorDeployment.address
            )
        })

        describe("constructor", async function () {
            it("sets the aggregator addresses correctly", async function () {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.target)
            })
        })

        describe("fund", async function () {
            it("fails if you don't send enough ETH", async function () {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                )
            })

            it("updates the amound funded data structure", async function () {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })

            it("adds funder to array of funders", async () => {
                await fundMe.fund({ value: sendValue })
                const response = await fundMe.getFunder(0)
                assert.equal(response, deployer)
            })
        })

        describe("withdraw", async function () {
            beforeEach(async function () {
                await fundMe.fund({ value: sendValue })
            })

            it("withdraws ETH from a single founder", async function () {
                // arrange
                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, gasPrice } = transactionReceipt
                const gasCost = gasUsed * gasPrice

                const endingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance + startingDeployerBalance,
                    endingDeployerBalance + gasCost
                )
            })

            it("cheaperWithdraw ETH from a single founder", async function () {
                // arrange
                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, gasPrice } = transactionReceipt
                const gasCost = gasUsed * gasPrice

                const endingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // assert
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance + startingDeployerBalance,
                    endingDeployerBalance + gasCost
                )
            })

            it("allows us to withdraw with multiple funders", async function () {
                // arrange
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // act
                const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, gasPrice } = transactionReceipt
                const gasCost = gasUsed * gasPrice

                const endingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // assert
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(
                        await fundMe.getAddressToAmountFunded(accounts[i]),
                        0
                    )
                }

                assert.equal(endingFundMeBalance, 0)
            })

            it("cheaperWithdraw testing...", async function () {
                // arrange
                const accounts = await ethers.getSigners()
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const startingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // act
                const transactionResponse = await fundMe.cheaperWithdraw()
                const transactionReceipt = await transactionResponse.wait(1)

                const { gasUsed, gasPrice } = transactionReceipt
                const gasCost = gasUsed * gasPrice

                const endingFundMeBalance = await ethers.provider.getBalance(
                    fundMe.getAddress()
                )
                const endingDeployerBalance = await ethers.provider.getBalance(
                    deployer
                )

                // assert
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(
                        await fundMe.getAddressToAmountFunded(accounts[i]),
                        0
                    )
                }

                assert.equal(endingFundMeBalance, 0)
            })

            it("allows only the owner to withdraw", async function () {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)

                await expect(
                    attackerConnectedContract.withdraw()
                ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
            })
        })
    })
