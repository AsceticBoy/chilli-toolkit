'use strict'

let IPromise = require('./core')

module.exports = IPromise

IPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}