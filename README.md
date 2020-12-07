# stock-price-checker
Stock price checker that can also compare two stocks and allow users to like stocks

## This App currently does not work as the API provider now requires an API key.

### User Stories:
- [X] Set the content security policies to only allow loading of scripts and css from your server.
- [X] I can `GET` `/api/stock-prices` with form data containing a Nasdaq stock ticker and recieve back an object `stockData`.
- [X] In stockData, I can see the stock(`string`, the ticker), price(`decimal` in string format), and likes(`int`).
- [X] I can also pass along field `like` as true(`boolean`) to have my like added to the stock(s). **Only 1 like per ip should be accepted.**
- [X] If I pass along 2 stocks, the return object will be an `array` with both stock's info but instead of likes, it will display `rel_likes`(the difference between the likes) on both.
- [X] A good way to recieve current price is the following external API(replacing 'GOOG' with your stock): https://finance.google.com/finance/info?q=NASDAQ%3aGOOG (Used `https://api.iextrading.com/1.0/stock/${ticker}/quote`)
- [X] All 5 functional tests are complete and passing.


Example usage:
----
```
/api/stock-prices?stock=goog
/api/stock-prices?stock=goog&like=true
/api/stock-prices?stock=goog&stock=msft
/api/stock-prices?stock=goog&stock=msft&like=true
```

Example return:
----
```
{"stockData":{"stock":"GOOG","price":"786.90","likes":1}}
{"stockData":[{"stock":"MSFT","price":"62.30","rel_likes":-1},{"stock":"GOOG","price":"786.90","rel_likes":1}]}
```

Completed Project:
----
 * https://stock-price-checker-fcc-cmccormack.glitch.me/
 