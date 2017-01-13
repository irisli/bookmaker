const StellarSdk = require('stellar-sdk');
const keys = require('./keys');
const deleteAllOffers = require('./deleteAllOffers');
const createOffer = require('./createOffer');
const changeTrust = require('./changeTrust');
const simplePayment = require('./simplePayment');
var sleep = require('sleep');
const https = require('https');

const Server = new StellarSdk.Server(keys.horizon);

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

    console.log('Issuer: ' + keys.issuer.accountId() + ' ' + keys.issuer.seed());
    console.log('Bidder: ' + keys.buyer.accountId() + ' ' + keys.buyer.seed());
    console.log('Seller: ' + keys.seller.accountId() + ' ' + keys.seller.seed());
    console.log('Random: ' + keys.random.accountId() + ' ' + keys.random.seed());

    console.log();

    await Promise.all([
      friendBot(keys.buyer.accountId()),
      friendBot(keys.seller.accountId()),
      friendBot(keys.issuer.accountId()),
      friendBot(keys.random.accountId()),
    ]);
    console.log('// Funded accounts with Friendbot');

    let buyerAccount = await Server.loadAccount(keys.buyer.accountId());
    let sellerAccount = await Server.loadAccount(keys.seller.accountId());
    const issuerAccount = await Server.loadAccount(keys.issuer.accountId());
    const randomAccount = await Server.loadAccount(keys.random.accountId());



    // Extend trust lines to issuer
    const changeTrustOp = {
      asset: counterSelling,
    };
    await Promise.all([
      changeTrust(Server, buyerAccount, keys.buyer, changeTrustOp),
      changeTrust(Server, sellerAccount, keys.seller, changeTrustOp),
      changeTrust(Server, randomAccount, keys.random, changeTrustOp),
    ]);
    console.log('// Trust extended to issuer')


   // Give the testers some money
    await Promise.all([
      simplePayment(Server, issuerAccount, keys.issuer, {
        destination: buyerAccount.accountId(),
        asset: counterSelling,
        amount: '2500', // $2500 fake USD
      }),
      simplePayment(Server, issuerAccount, keys.issuer, {
        destination: sellerAccount.accountId(),
        asset: counterSelling,
        amount: '2500', // $2500 fake USD
      }),
    ]);
    console.log('// Buyer and seller funded with asset')

    // Look at the new balances
    buyerAccount = await Server.loadAccount(keys.buyer.accountId());
    sellerAccount = await Server.loadAccount(keys.seller.accountId());
    console.log('// Buyer balances:\n', buyerAccount.balances);
    console.log('// Seller balances:\n', sellerAccount.balances);

    const offersForBuyer = await Server.offers('accounts', keys.buyer.accountId()).call();
    const offersForSeller = await Server.offers('accounts', keys.seller.accountId()).call();

    await Promise.all([
      deleteAllOffers(Server, buyerAccount, keys.buyer),
      deleteAllOffers(Server, sellerAccount, keys.seller),
    ]);
    // console.log('// Orderbook contents cleared out');
    // Only can clear orders made by the buyer and seller since we dont
    // have control to others offers

    let separation = 0.00001;
    const numOffers = 15;

    let offerPromises = [];

    for (let i = 0; i < numOffers; i++) {
      let buyOpts = {
        type: 'buy',
        baseBuying,
        counterSelling,
        price: 0.0025 - separation * (i + 1),
        // price: 0.00235 - Math.random().toPrecision(5) / 1000,
        // amount: Math.random()*Math.random()*10000, // 0-10000 lumens
        amount: 5000
      };
      offerPromises.push(
        createOffer(Server, buyerAccount, keys.buyer, buyOpts)
      )
      sleep.msleep(250);
    }
    for (let i = 0; i < numOffers; i++) {
      let sellOpts = {
        type: 'sell',
        baseBuying,
        counterSelling,
        price: 0.0025 + separation * (i + 1),
        amount: 5000,
        // price: 0.00235 + Math.random().toPrecision(5) / 1000,
        // amount: Math.random()*Math.random()*10000, // 0-10000 lumens
      };
      offerPromises.push(
        createOffer(Server, sellerAccount, keys.seller, sellOpts)
      )
      sleep.msleep(250);
    }

    await Promise.all(offerPromises);
    console.log('// Offers successfully created');

    const populatedOrderbook = await OrderBookSetup.call();
    console.log('// Resulting orderbook');
    console.log(populatedOrderbook);

  } catch (e) {
    console.error(e);
  }
}

main();


function httpsAsync(url) {
  return new Promise((resolve, reject) => {
    // Thanks https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
    const request = https.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};

function friendBot(accountId) {
  return httpsAsync('https://horizon-testnet.stellar.org/friendbot?addr=' + accountId)
}
