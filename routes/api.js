const router = require("express").Router()
const { query, validationResult, } = require('express-validator/check')
const { sanitizeQuery } = require('express-validator/filter')
const fetch = require('node-fetch')
const Ticker = require('../models/Ticker')


module.exports = () => {

  ///////////////////////////////////////////////////////////
  // Utility Endpoints
  ///////////////////////////////////////////////////////////
  router.get("/wipeticker", (req, res) => {
    Ticker.deleteMany({}, err => {
      if (err) return Error(err.message)
      const message = "Successfully wiped 'tickers' collection"
      res.json({ success: true, message, })
    })
  })


  ///////////////////////////////////////////////////////////
  // Validations
  ///////////////////////////////////////////////////////////
  const parseQuery = (req, res, next) => {

    if (!req.query.stock) {
      return next(Error('Must include valid stock in request'))
    }

    if (typeof req.query.stock === 'string') {
      req.query.stock = [req.query.stock]
    }

    next()
  }


  const stock_ticker_validation = [
    query('stock')
      .isArray()
      .withMessage('stock query must be an array')
      .custom(q => q.length >= 1)
      .withMessage('Must include valid stock in query')
      .custom(q => q.length <= 2)
      .withMessage('Maximum of two stocks permitted')
      .custom(q => (
        q.length === 1 
          || q.length === 2
          && q[0].toLowerCase() !== q[1].toLowerCase())
      )
      .withMessage('Stocks symbols must be unique when comparing'),

    query('stock.*')
      .isLength({ min: 4, max: 5 })
      .withMessage('Stock Ticker invalid, should be four or five characters')
      .isAscii()
      .withMessage('Stock Ticker should include only valid ascii characters'),

    sanitizeQuery('stock.*').trim(),
  ]


  ///////////////////////////////////////////////////////////
  // Helper Methods
  ///////////////////////////////////////////////////////////

  const getStockPrice = ticker => 
    fetch(`https://api.iextrading.com/1.0/stock/${ticker}/quote`)
      .then(res => res.text())
      .then(text => {
        try {
          const { symbol: ticker, latestPrice: price } = JSON.parse(text)
          return { success: true, ticker, price }
        } catch (e) {
          return { success: false, error: text, ticker }
        }
      })
      .catch(err => {
        return {
          success: false,
          error: 'Unable to reach stock API',
          ticker
        }
      })


  ///////////////////////////////////////////////////////////
  // Manage Stock Prices GET
  ///////////////////////////////////////////////////////////
  router.route('/stock-prices')

    // ** GET ** request
    .get(parseQuery, stock_ticker_validation, async (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }
      
      const { stock:tickers } = req.query
      const like = req.query.like === 'true' ? true : false

      // Fetch stock information from API asynchronously
      const stocks = await Promise.all(tickers.map(getStockPrice))

      // Return error message if api is unreachable or symbol is invalid
      for (let stock of stocks) {
        if (!stock.success) {
          return next(Error(`${stock.ticker}: ${stock.error}`))
        }
      }

      // Get user IP from req headers or socket/connections
      const userIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress

      // Update DB with likes and ip address
      const updatedDocs = await Promise.all(stocks.map(async stock => {

        const doc = await Ticker.findOne({ stock: stock.ticker})
        if (!doc) {
          return (await new Ticker({
            stock: stock.ticker,
            likes: like ? 1 : 0,
            ip_addresses: like ? [userIp] : [],
            price: stock.price
          }).save()).getPublicFields()
        }

        const update = {
          price: stock.price,
        }

        if (like && !doc.ip_addresses.includes(userIp)) {
          Object.assign(update, {
            $inc: { likes: 1 },
            $push: { ip_addresses: userIp },
          })
        }
        return (
          await Ticker.findByIdAndUpdate(doc._id, update, {new: true})
        ).getPublicFields()
      }))

      if (stocks.length === 1) {
        return res.json({stockData: updatedDocs[0]})
      }

      // Add rel_likes property and calculate relative likes
      updatedDocs.forEach((doc, i) => {
        doc.rel_likes = (
          i === 0
          ? updatedDocs[0].likes - updatedDocs[1].likes
          : updatedDocs[1].likes - updatedDocs[0].likes
          )
        })

      // Return final object, filtering out `likes` property
      res.json({stockData: updatedDocs.map(({likes, ...doc}) => doc)})

    })

  router.route('/stock-prices/all')
    // Return all stocks saved in DB
    .get((req, res, next) => {
      Ticker.find({}, 'stock price likes -_id', (err, tickers) => {
        if (err) {
          return next(Error(err))
        }
        res.json(tickers)
      })
    })

  return router
  
}