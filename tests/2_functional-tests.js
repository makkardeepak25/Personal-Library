/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var savedBookId = ''
chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        // console.log(JSON.stringify(res))
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({title: 'Title'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.deepEqual(res.body.title,"Title")
          savedBookId = res.body._id
          done();

        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
         chai.request(server)
        .post('/api/books')
        .send()
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.deepEqual(res.text,"No title")
          done();

        })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          assert.strictEqual(res.status, 200);
          assert.isArray(res.body)
          done();
        })

      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
        .get('/api/books/5fa8f5ca9d9a3e0b7ec5563b')
        .end(function(err, res){
          console.log((res.text))
          assert.equal(res.status, 200);
          assert.deepEqual(res.text,"no book exists")
          done();
          
        })
        //done();
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
        .get('/api/books/' +savedBookId)
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body,'_id',"id should exist")
          assert.property(res.body,'title',"title should exist")
          done();
          
        })
        //done();
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
        .post('/api/books/'+savedBookId)
        .send({
          comment: 'Testing'
        })
        .end((err,res)=>{
          console.log(err)
          assert.equal(res.status,200);
          assert.equal(res.body.title,'Title');
          assert.property(res.body,'_id','id should exist');
          assert.property(res.body,'comments','Comments exist');
          assert.notEqual(-1, res.body.comments.indexOf('Testing'));

          done();          
        })
        //done();
      });
      
    });

  });

});
