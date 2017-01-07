const StellarSdk = require('stellar-sdk');
const version = require('./height');

// account should be in the format of StellarSdk.Account
// keypair should be in the format of StellarSdk.Keypair
module.exports = async function deleteAllOffers(Server, account, keypair) {
  // Get the sequence number
  let offersForTarget = await Server.offers('accounts', keypair.accountId())
    .order('asc')
    .call()

  var transaction = new StellarSdk.TransactionBuilder(account)
    // .addOperation(StellarSdk.Operation.payment({
    //   // It doesn't matter who the issuer is. So this is just the target's account
    //   destination: account.accountId(),
    //   asset: StellarSdk.Asset.native(),
    //   amount: '0.1',
    // }))

  if (offersForTarget.records.length === 0) {
    return 0;
  }

  for (var i = 0; i < offersForTarget.records.length; i++) {
    let offerId = offersForTarget.records[i].id;
    transaction = transaction.addOperation(StellarSdk.Operation.manageOffer({
      // It doesn't matter who the issuer is since this is just going to get deleted
      buying: StellarSdk.Asset.native(),
      selling: new StellarSdk.Asset('USD', account.accountId()),
      amount: '0',
      price: '1',
      offerId
    }))
  }

  transaction = transaction.addMemo(StellarSdk.Memo.text('bookmaker ' + version))
  transaction = transaction.build();

  transaction.sign(keypair);

  // Let's see the XDR (encoded in base64) of the transaction we just built
  // console.log(transaction.toEnvelope().toXDR('base64'));

  let transactionResult = await Server.submitTransaction(transaction);
  // console.log(JSON.stringify(transactionResult, null, 2));
  // console.log('\nSuccess! View the transaction at: ');
  // console.log(transactionResult._links.transaction.href);
  return offersForTarget.records.length;
}