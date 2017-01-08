const StellarSdk = require('stellar-sdk');

// account should be in the format of StellarSdk.Account
// keypair should be in the format of StellarSdk.Keypair
module.exports = async function changeTrust(Server, account, keypair, opts) {
  let sdkLimit;
  if (typeof opts.limit === 'string' || opts.limit instanceof String) {
    sdkLimit = opts.limit;
  } else if (opts.limit !== undefined) {
    throw new Error('changeTrust opts.limit must be a string');
  }

  const operationOpts = {
    asset: opts.asset,
    limit: sdkLimit,
  };

  const transaction = new StellarSdk.TransactionBuilder(account)
    .addOperation(StellarSdk.Operation.changeTrust(operationOpts))
    .build();
  transaction.sign(keypair);

  const transactionResult = await Server.submitTransaction(transaction);
  // console.log('\n');
  // console.log(opts.type + ' transaction');
  // console.log(operationOpts);
  // console.log('View the transaction at: https://www.stellar.org/laboratory/#xdr-viewer?type=TransactionEnvelope&network=public&input=' + encodeURIComponent(transactionResult.envelope_xdr));
  // console.log('\n');
};
