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


  if (opts.type === 'buy') {
    sdkBuying = opts.baseBuying; // lumens
    sdkSelling = opts.counterSelling; // USD

    // 1 USD/500XLM = 0.0020
    sdkPrice = new BigNumber(opts.price).toPrecision(7);

    // Selling 10 USD (5000 lumens * 0.0020 price = $10)
    sdkAmount = new BigNumber(opts.amount).times(opts.price).toPrecision(7);
  } else if (opts.type === 'sell') {
    sdkBuying = opts.counterSelling; // USD
    sdkSelling = opts.baseBuying; // lumens

    // 450 XLM/1USD
    sdkPrice = new BigNumber(1).dividedBy(opts.price).toPrecision(7);

    // Buying 10 USD (10*450)
    sdkAmount = new BigNumber(opts.amount).toPrecision(7)
  } else {
    throw new Error('Invalid opts.type ' + opts.type);
  }

  var transaction = new StellarSdk.TransactionBuilder(account)
  transaction = transaction.addOperation(StellarSdk.Operation.manageOffer({
    buying: sdkBuying,
    selling: sdkSelling,
    amount: String(sdkAmount),
    price: String(sdkPrice),
    offerId: 0, // 0 for new offer
  }))

  transaction = transaction.addMemo(StellarSdk.Memo.text('bookmaker ' + version))
  transaction = transaction.build();

  transaction.sign(keypair);

  // Let's see the XDR (encoded in base64) of the transaction we just built
  // console.log(transaction.toEnvelope().toXDR('base64'));

  let transactionResult = await Server.submitTransaction(transaction);
  console.log(JSON.stringify(transactionResult, null, 2));
  console.log('\nSuccess! View the transaction at: ');
  console.log(transactionResult._links.transaction.href);
  // return offersForTarget.records.length;
}