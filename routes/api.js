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
      const message = "Successfully wiped 'books' collection"
      res.json({ success: true, message, })
    })
  })


  ///////////////////////////////////////////////////////////
  // Validations
  ///////////////////////////////////////////////////////////
  const parseQuery = (req, res, next) => {

    const { stock } = req.query

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
      .withMessage('Maximum of two stocks permitted'),

    query('stock.*')
      .isLength({ min: 4, max: 5 })
      .withMessage('Stock Ticker invalid, should be four or five characters')
      .isAscii()
      .withMessage('Stock Ticker should include only valid ascii characters'),

    sanitizeQuery('stock.*').trim(),
  ]


  ///////////////////////////////////////////////////////////
  // Manage Stock Prices GET
  ///////////////////////////////////////////////////////////
  router.route('/stock-prices')

    // ** GET ** request
    .get(parseQuery, stock_ticker_validation, (req, res, next) => {

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        // console.log('errors', errors.array())
        return next(Error(errors.array()[0].msg))
      }

      const stocks = req.query.stock.map(stock => {
        console.log(stock)
        fetch(`https://api.iextrading.com/1.0/stock/${stock}/quote`)
          .then(data => data.json())
          .then(data => res.json(data))
        // Ticker.findOneAndUpdate(
        //   {
        //     ticker: stock
        //   }, 
        //   {

        //   },
        //   { 
        //     upsert: true,
        //     new: true
        //   }
        // )
      })
    })

  return router
  
}