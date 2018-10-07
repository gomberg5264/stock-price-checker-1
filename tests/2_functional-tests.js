/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.ok(res.status)
          console.log('body', res.body)
          done();
        });
      });
      
      // test('1 stock with like', function(done) {
        
      // });
      
      // test('1 stock with like again (ensure likes arent double counted)', function(done) {
        
      // });
      
      // test('2 stocks', function(done) {
        
      // });
      
      // test('2 stocks with like', function(done) {
        
      // });

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
      
    });

});
