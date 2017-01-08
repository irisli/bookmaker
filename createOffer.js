const StellarSdk = require('stellar-sdk');
const version = require('./height');
const BigNumber = require('bignumber.js');

// account should be in the format of StellarSdk.Account
// keypair should be in the format of StellarSdk.Keypair

// This is a higher level function that frames the pricing and amount based on the
// base and counter currency. However, to make things less confusing, it's called
// baseBuying and counterSelling. And you specify the direction. This function will
// invert the price when necessary and figure out all the flippings.

// opts.baseBuying -- StellarSdk.Asset (example: JPY)
// opts.counterSelling -- StellarSdk.Asset (example: USD)
// opts.price -- Exchange ratio selling/buying
// opts.amount -- Here, it's relative to the base (JS-sdk does: Total amount selling)
// opts.type -- String of either 'buy' or 'sell' (relative to base currency)
module.exports = async function createOffer(Server, account, keypair, opts) {
  let sdkBuying;
  let sdkSelling;
  let sdkPrice;
  let sdkAmount;

  let bigOptsPrice = new BigNumber(opts.price.toPrecision(15));
  let bigOptsAmount = new BigNumber(opts.amount.toPrecision(15));

  if (opts.type === 'buy') {
    sdkBuying = opts.baseBuying; // lumens
    sdkSelling = opts.counterSelling; // USD

    // Docs says selling/buying = 1 USD/500XLM = 0.0020
    // But I think the docs are incorrect
    sdkPrice = new BigNumber(1).dividedBy(bigOptsPrice);

    // Selling 10 USD (5000 lumens * 0.0020 price = $10)
    sdkAmount = new BigNumber(bigOptsAmount).times(bigOptsPrice).toFixed(7);
  } else if (opts.type === 'sell') {
    sdkBuying = opts.counterSelling; // USD
    sdkSelling = opts.baseBuying; // lumens

    // Docs says selling/buying = 450 XLM/1USD
    // But I think the docs are incorrect
    sdkPrice = new BigNumber(bigOptsPrice);

    // Buying 10 USD (10*450)
    // Selling 4500 lumens
    sdkAmount = new BigNumber(bigOptsAmount).toFixed(7)
  } else {
    throw new Error('Invalid opts.type ' + opts.type);
  }

  let operationOpts = {
    buying: sdkBuying,
    selling: sdkSelling,
    amount: String(sdkAmount),
    price: String(sdkPrice),
    offerId: 0, // 0 for new offer
  };

  var transaction = new StellarSdk.TransactionBuilder(account)
    .addOperation(StellarSdk.Operation.manageOffer(operationOpts))
    .addMemo(StellarSdk.Memo.text('bookmaker ' + version))
    .build();
  transaction.sign(keypair);

  let transactionResult = await Server.submitTransaction(transaction);
  // console.log('\n');
  // console.log(operationOpts);
  // console.log('View the transaction at: https://www.stellar.org/laboratory/#xdr-viewer?type=TransactionEnvelope&network=public&input=' + encodeURIComponent(transactionResult.envelope_xdr));
  // console.log('\n');
}