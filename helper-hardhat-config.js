const networkConfig = {
    11155111: {
        name: "sepolia",
        // https://docs.chain.link/data-feeds/price-feeds/addresses?network=ethereum&page=1&search=#sepolia-testnet
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    137: {
        name: "polygon",
        // https://docs.chain.link/data-feeds/price-feeds/addresses?network=polygon&page=1&search=ETH%2FUSD
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
}

const developmentChains = ["hardhat", "localhost"]

const DECIMALS = 8
const INITIAL_ANSWER = 2000 * 10 ** DECIMALS

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
