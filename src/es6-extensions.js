'use strict'

let IPromise = require('./core.js')
let Shared = require('./shared.js')

module.exports = IPromise

function valueToIPromise(value, state) {
  let instance = new IPromise(Shared.noop)
  instance.currentState = state
  instance.valOonrErr = value
  return instance
}

// IPromise Instance catch 
IPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected)
}

// IPromise.resolve return a fulfilled IPromise
IPromise.resolve = function (value) {
  let self = this
  // if value is a IPromise return self
  if (value instanceof IPromise) return value

  // some special value
  if (value === undefined) return valueToIPromise(value, Shared.FULFILLED) // no value
  if (value === null) return valueToIPromise(value, Shared.FULFILLED)

  // value is thenable object
  if (Shared.isFunction(value) || Shared.isObject(value)) {
    let then = value.then
    try {
      if (Shared.isFunction(then)) {
        return new IPromise(then.bind(value))
      }
    } catch (error) {
      return new IPromise(function (resolve, reject) {
        reject(error)
      })
    }
  }

  return valueToIPromise(value, Shared.FULFILLED) // no Object no Function maybe a 'string' etc...
}

// IPromise.resolve return a rejected IPromise
IPromise.reject = function (error) {
  // if error is a thenable need not invoke then() return error self
  return valueToIPromise(error, Shared.REJECTED)
}

// IPromise.all wait allPromise stable then return new IPromise
IPromise.all = function (Iteratable) {
  // trigger a Array
  let array = Array.prototype.slice.call(Iteratable)

  // TODO
}

IPromise.race = function (Iteratable) {
  // TODO
}