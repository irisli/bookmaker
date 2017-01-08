const StellarSdk = require('stellar-sdk');
const keys = require('./keys');
const deleteAllOffers = require('./deleteAllOffers');
const createOffer = require('./createOffer');
const changeTrust = require('./changeTrust');
const simplePayment = require('./simplePayment');

// const Server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const Server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();

const baseBuying = new StellarSdk.Asset('XLM', null);
const counterSelling = new StellarSdk.Asset('USD', keys.issuer.accountId());
const OrderBookSetup = Server.orderbook(baseBuying, counterSelling);

async function main() {
  try {
// http://www.investopedia.com/ask/answers/06/eurusd.asp
//   "In a currency pair, the first currency in the pair is called the base
//   currency and the second is called the quote currency.""
// Using an example with a similarly "weak" currency, the Japanese Yen
// Base/Counter
// JPY/USD = 0.0085 (with a penny, you can buy a yen)
// Base: JPY
// Counter: USD


    let buyerAccount = await Server.loadAccount(keys.buyer.accountId());
    let sellerAccount = await Server.loadAccount(keys.seller.accountId());
    const issuerAccount = await Server.loadAccount(keys.issuer.accountId());


// Extend trust lines to issuer
    const changeTrustOp = {
      asset: counterSelling,
    };

// Trust the issuer
    await Promise.all([
      changeTrust(Server, buyerAccount, keys.buyer, changeTrustOp),
      changeTrust(Server, sellerAccount, keys.seller, changeTrustOp),
    ]);


// Give the testers some money
    await Promise.all([
      simplePayment(Server, issuerAccount, keys.issuer, {
        destination: buyerAccount.accountId(),
        asset: counterSelling,
        amount: '25', // $25 USD
      }),
      simplePayment(Server, issuerAccount, keys.issuer, {
        destination: sellerAccount.accountId(),
        asset: counterSelling,
        amount: '25', // $25 USD
      }),
    ]);

// Look at the new balances
    buyerAccount = await Server.loadAccount(keys.buyer.accountId());
    sellerAccount = await Server.loadAccount(keys.seller.accountId());
    console.log('Buyer balances ', buyerAccount.balances);
    console.log('Seller balances ', sellerAccount.balances);

    const offersForBuyer = await Server.offers('accounts', keys.buyer.accountId()).call();
    const offersForSeller = await Server.offers('accounts', keys.seller.accountId()).call();

    // await Promise.all([
    //   deleteAllOffers(Server, buyerAccount, keys.buyer),
    //   deleteAllOffers(Server, sellerAccount, keys.seller),
    // ]);
    // console.log('Orderbook successfully cleared');


// Each of these two offers should be about $10 USD
    const buyOpts = {
      type: 'buy',
      baseBuying,
      counterSelling,
      price: 0.0020 + Math.random().toPrecision(5) / 10000 / 2,
      amount: 5000, // 5000 lumens
    };

    const sellOpts = {
      type: 'sell',
      baseBuying,
      counterSelling,
      price: 0.0025 + Math.random().toPrecision(5) / 10000 / 2,
      amount: 4000, // 4500 lumens
    };

    await Promise.all([
      createOffer(Server, buyerAccount, keys.buyer, buyOpts), // This one is bugged
      createOffer(Server, sellerAccount, keys.seller, sellOpts),
    ]);
    console.log('Offers successfully created');

    const populatedOrderbook = await OrderBookSetup.call();
    console.log('Resulting orderbook');
    console.log(populatedOrderbook);
  } catch (e) {
    console.error(e);
  }
}

main();

