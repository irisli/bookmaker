const StellarSdk = require('stellar-sdk');
const keys = require('./keys');
const version = require('./height');
const deleteAllOffers = require('./deleteAllOffers');
const createOffer = require('./createOffer');

// const Server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const Server = new StellarSdk.Server('https://horizon.stellar.org');
StellarSdk.Network.usePublicNetwork();

let baseBuying = new StellarSdk.Asset('XLM', null);
let counterSelling = new StellarSdk.Asset('USD', keys.issuer);
let OrderBookSetup = Server.orderbook(counterSelling, baseBuying);

async function main() {
try {

// http://www.investopedia.com/ask/answers/06/eurusd.asp
// In a currency pair, the first currency in the pair is called the base currency and the second is called the quote currency.
// Using an example with a similarly "weak" currency, the Japanese Yen
// Base/Counter
// JPY/USD = 0.0085 (with a penny, you can buy a yen)
// Base: JPY
// Counter: USD



// let offersForBuyer = await Server.offers('accounts', keys.buyer.accountId()).call()
// let offersForSeller = await Server.offers('accounts', keys.seller.accountId()).call()

let buyerAccount = await Server.loadAccount(keys.buyer.accountId());
let sellerAccount = await Server.loadAccount(keys.seller.accountId());

[
  await deleteAllOffers(Server, buyerAccount, keys.buyer),
  await deleteAllOffers(Server, sellerAccount, keys.seller)
];


let clearedOrderbook = await OrderBookSetup.call();
console.log('Orderbook successfully cleared')
// console.log(clearedOrderbook)


// Each of these two offers should be about $10 USD
let buyOpts = {
  type: 'buy',
  baseBuying,
  counterSelling,
  price: 0.0020, // + Math.random().toPrecision(5)/100000,
  amount: 5000, // 5000 lumens
};

let sellOpts = {
  type: 'sell',
  baseBuying,
  counterSelling,
  price: 0.0025,// + Math.random().toPrecision(5)/100000,
  amount: 4500, // 4500 lumens
};

[
  await createOffer(Server, buyerAccount, keys.buyer, buyOpts),
  await createOffer(Server, sellerAccount, keys.seller, sellOpts),
]
console.log('Offers successfully created');


let populatedOrderbook = await OrderBookSetup.call();
console.log('Resulting orderbook')
console.log(populatedOrderbook)




} catch(e) {
  console.error(e);
}
}

main();


