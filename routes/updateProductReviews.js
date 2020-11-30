/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const insecurity = require('../lib/insecurity')
const mongoSanitize = require('express-mongo-sanitize')

module.exports = function productReviews () {
  return (req, res, next) => {
    const user = insecurity.authenticatedUsers.from(req)
    mongoSanitize.sanitize(req.body.id, {
      replaceWith: '_'
    });
    db.reviews.update(
      { _id: req.body.id },
      { $set: { message: req.body.message } },
      { multi: false }
    ).then(
      result => {
        utils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 })
        if(result.original.length>0){
        utils.solveIf(challenges.forgedReviewChallenge, () => { return user && user.data && result.original[0].author !== user.data.email && result.modified === 1 })
        }
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}
