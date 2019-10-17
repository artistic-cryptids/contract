// Based on openzeppelin-contracts/test/token/ERC721/ERC721.test.js

const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const { shouldBehaveLikeERC721 } = require('./behaviours/ERC721.behavior.js');
const ArtifactRegistryMock = artifacts.require('./ArtifactRegistryMock.sol');

contract('ArtifactRegistry', async accounts => {
  const creator = accounts[0];
  const owner = accounts[0];

  beforeEach(async function () {
    this.token = await ArtifactRegistryMock.new(creator, { from: creator });
  });

  shouldBehaveLikeERC721(creator, creator, accounts);
}); // end Registry contract
