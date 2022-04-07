PriStorage
==================

This [React] app was initialized with [create-near-app]

Exploring The Code
==================

1. The "backend" code lives in the `/contract` folder. See the README there for
   more info.
2. The frontend code lives in the `/src` folder. `/src/index.html` is a great
   place to start exploring. Note that it loads in `/src/index.js`, where you
   can learn how the frontend connects to the NEAR blockchain.
3. Tests: there are different kinds of tests for the frontend and the smart
   contract. See `contract/README` for info about how it's tested. The frontend
   code gets tested with [jest]. You can run both of these at once with `yarn
   run test`.


Deploy & Run PriStorage DApp
======

1. **Prerequisites**: Make sure you've installed [Node.js] ≥ 12
2. **Install dependencies**: `yarn install`

Every smart contract in NEAR has its [own associated account][NEAR accounts]. When you're ready to deploy your smart contract permanent on the NEAR TestNet, here's how.


Step 0: Install near-cli
-------------------------------------

[near-cli] is a command line interface (CLI) for interacting with the NEAR blockchain. It was installed to the local `node_modules` folder when you ran `yarn install`, but for best ergonomics you may want to install it globally:

    yarn global add near-cli

Or, if you'd rather use the locally-installed version, you can prefix all `near` commands with `npx`

Ensure that it's installed with `near --version` (or `npx near --version`)


Step 1: Create an account for the contract
------------------------------------------

Each account on NEAR can have at most one contract deployed to it. If you've already created an account such as `YOUR-ACCOUNT-NAME.testnet`, you can deploy your contract to `vi-storage.YOUR-ACCOUNT-NAME.testnet`. Assuming you've already created an account on [NEAR Wallet], here's how to create `vi-storage.your-name.testnet`:

1. Authorize NEAR CLI, following the commands it gives you:

      ```bash
      near login
      ```
2. Create a subaccount (replace `YOUR-ACCOUNT-NAME` below with your actual account name):

   ```bash
   near create-account vi-storage.YOUR-ACCOUNT-NAME.testnet --masterAccount YOUR-ACCOUNT-NAME.testnet
   ```

Step 2: Set contract name in code
---------------------------------

Add CONTRACT_NAME to the .env file at the root folder.

```bash
CONTRACT_NAME=vi-storage.YOUR-ACCOUNT-NAME.testnet
```

Modify the line in `src/config.js` that sets the account name of the contract. Set it to the account id you used above.

    const CONTRACT_NAME = process.env.CONTRACT_NAME || 'vi-storage.YOUR-ACCOUNT-NAME.testnet'


Step 3: Deploy smart contract & run DApp!
---------------

One command:

    yarn dev

As you can see in `package.json`, this does two things:

1. ```prestart script```: builds & deploys smart contract to NEAR TestNet.
2. Using CONTRACT_NAME variable in .env to run DApp authorization on the localhost.

Troubleshooting
===============

On Windows, if you're seeing an error containing `EPERM` it may be related to spaces in your path. Please see [this issue](https://github.com/zkat/npx/issues/209) for more details.


  [React]: https://reactjs.org/
  [create-near-app]: https://github.com/near/create-near-app
  [Node.js]: https://nodejs.org/en/download/package-manager/
  [jest]: https://jestjs.io/
  [NEAR accounts]: https://docs.near.org/docs/concepts/account
  [NEAR Wallet]: https://wallet.testnet.near.org/
  [near-cli]: https://github.com/near/near-cli
  [gh-pages]: https://github.com/tschaub/gh-pages
