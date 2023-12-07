# Lesson 7: Hardhat Fund Me

Lesson 7 from the Web3, Full Stack Solidity, Smart Contract & Blockchain - Beginner to Expert ULTIMATE
Course | Javascript Edition:
https://github.com/smartcontractkit/full-blockchain-solidity-course-js#lesson-7-hardhat-fund-me

Official code at:
https://github.com/PatrickAlphaC/hardhat-fund-me-fcc

## Notes

* using **hardhat-toolbox** instead of **hardhat-waffle**
    * this also forces **ethers** version 6.x instead of 5.x
    * `ethers.utils.parseEther` was replaced with `ethers.parseEther`
    * replaced
        ```javascript
        fundMe = await ethers.getContract("FundMe", deployer)
        ```
        with
        ```javascript
        const fundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt(
            fundMeDeployment.abi,
            fundMeDeployment.address
        )
        ```
    * similar replacement for `mockV3Aggregator`.
    * **ethers** migration guide from 5 to 6: https://docs.ethers.org/v6/migrating/
    * **hardhat-toolbox** migration from **hardhat-waffle**: https://hardhat.org/hardhat-runner/docs/advanced/migrating-from-hardhat-waffle
