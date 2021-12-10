// creates a keyStore that searches for keys in .near-credentials
// requires credentials stored locally by using a NEAR-CLI command: `near login`
// https://docs.near.org/docs/tools/near-cli#near-login
const nearAPI = require("near-api-js");
const path = require("path");

// creates keyStore using private key in local storage
// *** REQUIRES SignIn using walletConnection.requestSignIn() ***
async function initApp() {
  const { connect, keyStores, KeyPair } = nearAPI;
  const homedir = require("os").homedir();
  const CREDENTIALS_DIR = ".near-credentials";
  const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
  const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);
  const RANDOM_ACCOUNT_LENGTH = 40;

  let subAccount;

  const config = {
    networkId: "testnet",
    keyStore: keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };

  // connect to NEAR
  const near = await connect(config);

  // load your master account
  const masterAccount = await near.account("exampleAccount.testnet");

  // set the name of your new account here
  const newAccountName = "subaccount.exampleAccount.testnet";

  // global variable to store keypairs
  const keyPair = KeyPair.fromRandom("ed25519");

  /////////Functions /////////

  // create a New Account
  async function createAccount(near) {
    const publicKey = keyPair.publicKey.toString();

    // create the new account
    await masterAccount.createAccount(
      newAccountName, // new account name
      publicKey, // public key for new account
      "10000000000000000000000" // initial balance for new account in yoctoNEAR
    );
  }

  async function storeKeyFunction() {
    // store new keys in .near-credentials

    await config.keyStore.setKey("testnet", newAccountName, keyPair);
  }

  async function sendNearFromSubAccount() {
    subAccount = new nearAPI.Account(near.connection, newAccountName);

    subAccount.sendMoney(masterAccount.accountId, 1);
  }

  await createAccount(near);
  await storeKeyFunction();
  await sendNearFromSubAccount();
}

initApp();
