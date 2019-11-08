const ENS = artifacts.require('ENSRegistry');
const FIFSRegistrar = artifacts.require('FIFSRegistrar');
const RinkebyRegistrar = require('./helper/RinkebyRegistrar');
const ENSResolver = artifacts.require('ENSResolver');

const registrarHelper = require('./helper/RegistrarHelper');

const utils = require('web3-utils');
const namehash = require('eth-ens-namehash');

// const ENS_MAINNET = 0x314159265dd8dbb310642f98f50c066173c1259b;
// const ENS_ROPSTEN = 0x112234455c3a32fd11230c42e7bccd4a84e02010;
const ENS_RINKEBY = '0xe7410170f87102df0055eb195163a03b7f2bff4a';

module.exports = async (deployer, network, accounts) => {
  switch (network) {
    case 'development':
    case 'test':
    case 'soliditycoverage':
    case 'ganache':
      console.log("Deploying ENS contracts on ganache");
      await localMigrate(deployer, network, accounts);
      return;
    case 'rinkeby':
    case 'rinkeby-fork':
      console.log("Deploying ENS contracts on rinkeby");
      await rinkebyDeploy(deployer, network);
      return;
    default:
      throw new Error('ENS deploy not configured for this network');
  }
};

// Migrate on a local ganache network
async function localMigrate(deployer, network, accounts) {
  console.log("Deploying ENS on ganache");
  await deployer.deploy(ENS);
  ens = await ENS.deployed();

  await registrarHelper.deployLocalRegistrar(accounts[0], artifacts);

  await deployer.deploy(ENSResolver, ens.address);
  const resolver = await ENSResolver.deployed();
  await setupResolver(ens, resolver, accounts);
}

// Migrate on the rinkeby network
async function rinkebyDeploy(deployer, network) {
  console.log("Finding ENS contract on rinkeby network " + ENS_RINKEBY);
  const ens = await ENS.at(ENS_RINKEBY);

  const registrarAddress = await ens.owner(namehash.hash('test'));
  console.log("Finding FIFSRegistrar on rinkeby network " + registrarAddress);
  const registrar = await new web3.eth.Contract(RinkebyRegistrar, registrarAddress);

  await setupRegistrarRinkeby(ens, registrar);

  await deployer.deploy(ENSResolver, ens.address);
  const resolver = await ENSResolver.deployed();
  await setupResolver(ens, resolver, [process.env.ACCOUNT_ADDRESS]);
}

// Setup functions
//////////////////

async function setupResolver (ens, resolver) {
  const resolverNode = namehash.hash(NAME +  "." + TLD);
  const resolverLabel = utils.sha3(NAME + "." + TLD);

  await ens.setResolver(resolverNode, resolver.address);
  await resolver.setAddr(resolverNode, resolver.address);

  console.log(resolver.address);
  console.log(await resolver.addr(namehash.hash(NAME +  "." + TLD)));
}

// Check if we have registered our ENS root name already, if not registered need to re register
async function setupRegistrarRinkeby (ens, registrar) {
  const time = await registrar.methods.expiryTimes(utils.sha3(NAME)).call();

  console.log("Registrar registration expirytime is current set to " + time);

  if (new Date(time * 1000) > Date.now()) {
    return;
  }

  await registrar.methods.register(utils.sha3(NAME), process.env.ACCOUNT_ADDRESS).send({
    from: process.env.ACCOUNT_ADDRESS
  });

  console.log("Registered");
}
