const router = require("express").Router()
const { body, param, validationResult, } = require('express-validator/check')
const { sanitizeBody, sanitizeParam } = require('express-validator/filter')
const Book = require('../models/Book')
const ObjectId = require('mongoose').Types.ObjectId


module.exports = () => {

  ///////////////////////////////////////////////////////////
  // Utility Endpoints
  ///////////////////////////////////////////////////////////
  router.get("/wipebooks", (req, res) => {
    Book.deleteMany({}, err => {
      if (err) return Error(err.message)
      const message = "Successfully wiped 'books' collection"
      res.json({ success: true, message, })
    })
  })


  ///////////////////////////////////////////////////////////
  // Validations
  ///////////////////////////////////////////////////////////
  const book_title_validation = [
    body('title')
      .trim()
      .isLength({ min: 1, })
        .withMessage('Book Title missing')
      .isAscii()
        .withMessage('Book Title should include only valid ascii characters'),

    sanitizeBody('title').trim(),
  ]

  const book_comment_validation = [
    body('comment')
      .trim()
      .isLength({ min: 1, })
        .withMessage('Book Comment missing')
      .isAscii()
        .withMessage('Book Comment should include only valid ascii characters'),

    sanitizeBody('comment').trim(),
  ]

  const book_id_validation = [
    param('_id')
      .trim()
      .isMongoId()
        .withMessage('Book ID is not a valid MongoID'),

    sanitizeParam('_id').trim(),
  ]


  ///////////////////////////////////////////////////////////
  // Manage Books Add/Update/Delete
  ///////////////////////////////////////////////////////////
  router.route('/books')

    // ** GET ** request
    .get((req, res, next) => {

      Book.find({}, 'title _id commentcount', (err, books) => {
        if (err) { 
          return next(Error(err.message))
        }

        res.json(books)
      })
    })


    // ** POST ** request
    .post(book_title_validation, (req, res, next) => {

      // Check validation and exit early if unsuccessful 
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      new Book({
        title: req.body.title
      }).save((err, doc) => {
        if (err) {
          return next(Error(err))
        }

        res.json({ title: doc.title, _id: doc._id })
      })
    })


    // ** DELETE ** request
    .delete((req, res, next) => {

      Book.deleteMany({}, (err, book) => {

        if (err) {
          return next(Error('could not delete books'))
        }

        res.json({success: true, message: 'complete delete successful'})
      })
    })


  router.route('/books/:_id')


    // ** GET ** request
    .get(book_id_validation, (req, res, next) => {

      // Check validation and exit early if unsuccessful 
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      const { _id } = req.params

      Book.findById(req.params._id, 'title _id comments')
      .exec((err, book) => {
        if (err) {
          return next(Error(err))
        }

        if (!book) {
          return next(Error(`Book with _id ${_id} not found`))
        }

        res.json(book)
      })

    })


    // ** POST ** request
    .post(book_comment_validation, book_id_validation, (req, res, next) => {

      // Check validation and exit early if unsuccessful 
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(Error(errors.array()[0].msg))
      }

      const { _id } = req.params
      const { comment } = req.body

      Book.findByIdAndUpdate(_id,
        {
          $push: { comments: comment },
          $inc: { commentcount: 1 },
        },
        {
          new: true,
          select: 'title comments'
        },
      )
        .exec((err, doc) => {
          if (err) {
            return next(Error(err))
          }
          if (!doc) {
            return next(Error(`Book with _id ${_id} not found`))
          }

          res.json(doc)
        })
    })


    // ** DELETE ** request
    .delete(book_id_validation, (req, res, next) => {

      const { _id } = req.params

      if (!_id) {
        return next(Error('_id error'))
      }

      if (!validationResult(req).isEmpty()) {
        return next(Error('no book exists'))
      }

      Book.findByIdAndRemove(_id, (err, book) => {

        if (err || !book) {
          return next(Error('no book exists'))
        }

        res.json({success: true, message: 'delete successful'})
      })
    })

  return router
  
}