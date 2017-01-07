const StellarSdk = require('stellar-sdk');
const keys = require('./keys');

const Server = new StellarSdk.Server('https://horizon.stellar.org');

async function main() {

// http://www.investopedia.com/ask/answers/06/eurusd.asp
// In a currency pair, the first currency in the pair is called the base currency and the second is called the quote currency.
// Using an example with a similarly "weak" currency, the Japanese Yen
// Base/Counter
// JPY/USD = 0.0085 (with a penny, you can buy a yen)
// Base: JPY
// Counter: USD

let baseBuying = new StellarSdk.Asset('XLM', null);
let counterSelling = new StellarSdk.Asset('USD', keys.issuer);


let res = await Server.orderbook(baseBuying, counterSelling).call();
console.log(res)





}
main();





