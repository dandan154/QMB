const SRC = artifacts.require("SRC");
const SRCLib = artifacts.require("SRCLib");
const SRCPosition = artifacts.require("SRCPosition")

module.exports = function(deployer) {
  deployer.deploy(SRCLib);
  deployer.link(SRCLib, SRCPosition);
  deployer.link(SRCLib, SRC);
  deployer.deploy(SRCPosition, "testPos", "0x61a1d66da840f1982dff9aba9407a0b708a9d6fe", '0x61a1d66da840f1982dff9aba9407a0b708a9d6fe', 0);
  deployer.link(SRCPosition, SRC);
  deployer.deploy(SRC);
};
