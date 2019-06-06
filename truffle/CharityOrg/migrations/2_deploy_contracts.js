const CharityOrg = artifacts.require("CharityOrg");
const SafeMath = artifacts.require("SafeMath");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, CharityOrg);
  deployer.deploy(CharityOrg, "CharityCo");
};
