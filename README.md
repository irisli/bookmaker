# Stellar Bookmaker: A tool for correctly setting up an example orderbook in the [Stellar](https://www.stellar.org/) network

Bookmaker populates the orderbook for a [Stellar](https://www.stellar.org/) asset with the prices, amounts, and buy/sell ordering. Prices, amounts, and the trading pair is framed in the traditional concept of base and counter currencies.

## Purpose and origins
This tool is useful for making sure that a trading client displays data properly. It is extremely important that trading clients display the data correctly because if done incorrectly, it could result in the loss of users' money.

This is surprisingly difficult to do since there are about 8 different ways that these orders could be built (2 prices * 2 amounts * 2 buy/sell ordering). This repository is the product of my 15 hours of figuring out how to get the orderbook populated in the correct way.

## Full cycle order creation from 0 to 5
The bookmaker does all the necessary steps to get from accounts to having the asset have a valid orderbook with the right prices. The bookmaker does the following:

1. Buyer and seller trusts the issuer
2. Trusts the issuer
3. Gives the buyer and seller some of the asset (super important step)
4. Deletes the whole orderbook (can be easily commented out)
5. Creates the offers to buy and sell the asset
6. Displays the resulting orderbook

## Example output
```js
// Trust extended to issuer
// Buyer and seller funded with asset
// Buyer balances:
 [ { balance: '850.0000018',
    limit: '922337203685.4775807',
    asset_type: 'credit_alphanum4',
    asset_code: 'USD',
    asset_issuer: 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE' },
  { balance: '15987.4364787', asset_type: 'native' } ]
// Seller balances:
 [ { balance: '1349.9999982',
    limit: '922337203685.4775807',
    asset_type: 'credit_alphanum4',
    asset_code: 'USD',
    asset_issuer: 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE' },
  { balance: '16332.9592383', asset_type: 'native' } ]
// Orderbook contents cleared out
// Offers successfully created
// Resulting orderbook
{ bids: [ { price_r: [Object], price: '0.0023118', amount: '11.5590400' } ],
  asks: [ { price_r: [Object], price: '0.0024561', amount: '4000.0000000' } ],
  base: { asset_type: 'native' },
  counter:
   { asset_type: 'credit_alphanum4',
     asset_code: 'USD',
     asset_issuer: 'GBAMBOOZDWZPVV52RCLJQYMQNXOBLOXWNQAY2IF2FREV2WL46DBCH3BE' } }
```

## Usage

This uses the latest features available in Node.js. It uses async/await which is available as of Node.js and available under a harmony feature flag.

To run the bookmaker:

1. Install Node.js version 7 or later ([Node version manager](https://github.com/creationix/nvm) is recommended for keeping track of your Node versions)
2. Run `npm install --production`
3. Copy `keys.sample.js` to `keys.js` and fill in the specified secret keys and network name.
4. Make sure all the accounts in `keys.js` are funded
5. Run `npm start`

## License
Bookmaker is licensed under the Apache-2.0 license. Details can be found in the LICENSE file.
