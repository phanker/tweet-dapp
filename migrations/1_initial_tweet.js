const Tweet = artifacts.require("Tweet")

module.exports = function (deployer) {
    deployer.deploy(Tweet)
}
