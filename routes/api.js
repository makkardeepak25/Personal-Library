/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var _ = require('underscore')
var mongoose = require('mongoose')
var mongo_url = process.env.DB
mongoose.connect(mongo_url, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).catch(error => console.log(error));
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

const bookSchema = new mongoose.Schema({
  title:{type:String,required:true},
  commentcount:{type:Number},
  // comments:[{
  //   _id:false,
  //   comment:{type:String,required:true}
  // }]
  comments:[String]
}, {
    toObject: {
      transform: function (doc, ret, game) {
        delete ret.__v;
      }
    },
        toJSON: {
      transform: function (doc, ret, game) {
        delete ret.__v;
      }
    }
})

const Library = mongoose.model("Library",bookSchema)

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      Library.find().then(result=>{
        var omitted = []
        result.forEach(myFunction);
        function myFunction(item) {
          var omittedbook = _.omit(item.toJSON(),"comments")
          omitted.push(omittedbook)
        }
        res.json(omitted)
      }).catch(err=>{
        res.send(err)
      })
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(!title){
        res.status(400).send("No title")
      }else{
        var newBook = new Library({
          title:title,
          commentcount:0
        })
        newBook.save((err,data)=>{
          if(err){
            console.log(err)
        	res.status(500).send("Internal Server Error")
          }else{
            console.log(data);
            res.json(data);
          }
        })
      }
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Library.deleteMany().then(result=>{
        res.send('delete successful')

      }).catch(err=>{
          res.send('could not delete')
      })
      });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    console.log('find book by id ' + bookid)
  Library.findById({_id: bookid}).then(result=>{
    if(!result){
      res.send("no book exists")
      return
    }
result = _.omit(result.toJSON(),"commentcount")
        console.log(result)

      res.json(result)
  }).catch(err=>{
    console.log('err is '+ err)
    res.send(err)
  })

    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get

    Library.findOneAndUpdate({
      _id:bookid
    },{
      $inc: { commentcount: 1},
      $push:{comments:comment},
    },{new: true}).then(result=>{
      if(!result){
        console.log("could not find book")
        res.send("no book exists")
        return;
      }
      result = _.omit(result.toJSON(),"commentcount")
        console.log(result)
      console.log(result)
      res.json(result)
    }).catch(err=>{
   console.log("could not find book")
        res.send("no book exists")
        return;
    })

    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      if(!bookid){
        res.send("id should not be empty") 
        return       
      }
      Library.findByIdAndRemove({
				"_id": bookid
        },{useFindAndModify:false}, function(err,data){
            if (err) {
                res.send('could not delete')
            }
            else {
              if(!data){
                res.send('could not delete')                
              }else{
                res.send('delete successful');
              }
            }
        });
    });
  
};
