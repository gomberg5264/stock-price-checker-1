/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Ticker = require('../models/Ticker')

chai.use(chaiHttp);

before(done => {
  Ticker.deleteMany({}, err => {
    if (err) console.error(err)
    console.log("Deleted all documents in `tickers` collection!")
    done()
  })
})

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aapl'})
        .end(function(err, res){
          assert.ok(res.status)
          assert.property(res.body, 'stockData', 'Response must include \'stockData\' property')
          assert.property(res.body.stockData, 'stock', 'stockData must include \'stock\' property')
          assert.property(res.body.stockData, 'likes', 'stockData must include \'likes\' property')
          assert.property(res.body.stockData, 'price', 'stockData must include \'price\' property')
          assert.equal(res.body.stockData.stock, 'AAPL')
          assert.equal(res.body.stockData.likes, '0')
          assert.isNumber(res.body.stockData.price)
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'aapl', like: true})
          .end(function (err, res) {
            assert.ok(res.status)
            assert.property(res.body, 'stockData', 'Response must include \'stockData\' property')
            assert.property(res.body.stockData, 'stock', 'stockData must include \'stock\' property')
            assert.property(res.body.stockData, 'likes', 'stockData must include \'likes\' property')
            assert.property(res.body.stockData, 'price', 'stockData must include \'price\' property')
            assert.equal(res.body.stockData.stock, 'AAPL')
            assert.equal(res.body.stockData.likes, '1')
            assert.isNumber(res.body.stockData.price)
            done();
          });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: 'aapl', like: true })
          .end(function (err, res) {
            assert.ok(res.status)
            assert.property(res.body, 'stockData', 'Response must include \'stockData\' property')
            assert.property(res.body.stockData, 'stock', 'stockData must include \'stock\' property')
            assert.property(res.body.stockData, 'likes', 'stockData must include \'likes\' property')
            assert.property(res.body.stockData, 'price', 'stockData must include \'price\' property')
            assert.equal(res.body.stockData.stock, 'AAPL')
            assert.equal(res.body.stockData.likes, '1')
            assert.isNumber(res.body.stockData.price)
            done();
          })
      })
      
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['csco', 'msft'] })
          .end(function (err, res) {
            assert.ok(res.status)
            assert.property(res.body, 'stockData', 'Response must include \'stockData\' property')
            const {stockData: data} = res.body
            assert.isArray(data)
            assert.property(data[0], 'stock', 'stockData must include \'stock\' property')
            assert.property(data[0], 'rel_likes', 'stockData must include \'rel_likes\' property')
            assert.property(data[0], 'price', 'stockData must include \'price\' property')
            assert.property(data[1], 'stock', 'stockData must include \'stock\' property')
            assert.property(data[1], 'rel_likes', 'stockData must include \'rel_likes\' property')
            assert.property(data[1], 'price', 'stockData must include \'price\' property')
            assert.equal(data[0].stock, 'CSCO')
            assert.equal(data[0].rel_likes, '0', 'rel_likes value should be 0')
            assert.isNumber(data[0].price)
            assert.equal(data[1].stock, 'MSFT')
            assert.equal(data[1].rel_likes, '0', 'rel_likes value should be 0')
            assert.isNumber(data[1].price)
            done();
          });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: ['aapl', 'msft'], like: true })
          .end(function (err, res) {
            assert.ok(res.status)
            assert.property(res.body, 'stockData', 'Response must include \'stockData\' property')
            const { stockData: data } = res.body
            assert.isArray(data)
            assert.property(data[0], 'stock', 'stockData must include \'stock\' property')
            assert.property(data[0], 'rel_likes', 'stockData must include \'rel_likes\' property')
            assert.property(data[0], 'price', 'stockData must include \'price\' property')
            assert.property(data[1], 'stock', 'stockData must include \'stock\' property')
            assert.property(data[1], 'rel_likes', 'stockData must include \'rel_likes\' property')
            assert.property(data[1], 'price', 'stockData must include \'price\' property')
            assert.equal(data[0].stock, 'AAPL')
            assert.equal(data[0].rel_likes, '0', 'rel_likes value should be 0')
            assert.isNumber(data[0].price)
            assert.equal(data[1].stock, 'MSFT')
            assert.equal(data[1].rel_likes, '0', 'rel_likes value should be 0')
            assert.isNumber(data[1].price)
            done();
          });
      });

      test('0 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', 'Response must have \'success\' property')
            assert.property(res.body, 'error', 'Response must have \'error\' property')
            assert.isFalse(res.body.success, 'Response success must be false')
            assert.equal(res.body.error, 'Must include valid stock in request')
            done()
          })
      })

      test('no duplicate stocks with when two are passed', function (done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['aapl', 'aapl']})
          .end((err, res) => {
            assert.ok(res.status)
            assert.property(res.body, 'success', 'Response must have \'success\' property')
            assert.property(res.body, 'error', 'Response must have \'error\' property')
            assert.isFalse(res.body.success, 'Response success must be false')
            assert.equal(res.body.error, 'Stocks symbols must be unique when comparing')
            done()
          })
      })
      
    });

});
