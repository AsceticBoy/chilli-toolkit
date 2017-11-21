'use strict'

const Constants = require('./constants')

function noop() { }

function isFunction(func) {
  return typeof func === 'function'
}

function isObject(obj) {
  return typeof obj === 'object'
}

module.exports = IPromise

/**
 * ----- IPromise Codebase -----
 * 
 * Promise Code Implement Standard https://promisesaplus.com/#point-46
 * 
 * @param { Function } executor => I want to do in this function
 */
function IPromise(executor) {
  const self = this
  if (!isObject(self)) {
    throw new TypeError('IPromise must be a object')
  }
  if (!isFunction(executor)) {
    throw new TypeError('executor must be a function')
  }
  this.currentState = Constants.PENDING // default
  this.valOonrErr = null // if fulfilled result to it else rejected error to it
  this.onFulfilledCallback = [] // if current state PENDING push the func wait onFulfilled to exec
  this.onRejectedCallback = [] // if current state PENDING push the func wait onRejected to exec
  
  // safely executor when executor not a empty function
  if (noop !== executor) {
    safelyToExecutor(self, executor) 
  }
}

/**
 * onResolved or onRejected only one called once
 * 
 * @param { object } self current IPromise
 * @param { function } executor this's user operater
 */
function safelyToExecutor(self, executor) {
  let done = false
  try {
    executor(
      function(result) {
        if (done) return
        done = true
        doResolve.call(self, result)
      }, // doResolve
      function(error) {
        if (done) return
        done = true
        doReject.call(self, error)
      } // doReject
    )
  } catch (error) {
    if (done) return
    done = true
    doReject.call(self, error)
  }
}

/**
 * if resolve(result) result is a thenable return or wait util onFulfilled or onRejected
 * 
 * @param { all } maybeThenable 
 */
function safelyToThen(maybeThenable) {
  // Promise Standard 2.3.3.1
  let then = maybeThenable && maybeThenable.then
  if (maybeThenable && (isFunction(maybeThenable) || isObject(maybeThenable)) && isFunction(then)) {
    return function applyThen() {
      then.apply(maybeThenable, arguments)
    }
  }
}

/**
 * Safely exec executor then doResolve or doReject
 * The most important function call
 */
function doResolve(result) {
  // Promise Standard 2.3.3.2
  try {
    // Promise Standard 2.3.2 and 2.3.3 can be merge
    // if result is a thenable(.then)
    let then = safelyToThen(result)
    if (then) {
      // Promise Standard 2.3.3.3
      safelyToExecutor(this, then)
    } else {
      // commonly case
      this.currentState = Constants.FULFILLED
      this.valOrErr = result
      for (let i = 0; i < this.onFulfilledCallback.length; i++) {
        this.onFulfilledCallback[i](result)
      }
    }
  } catch (error) {
    doReject.call(this, error)
  }
}

function doReject(error) {
  this.currentState = Constants.REJECTED
  this.valOrErr = error
  for (let i = 0; i < this.onRejectedCallback.length; i++) {
    this.onRejectedCallback[i](error)
  }
}

function asyncToResolveOrReject(self, func, arg) {
  // Promise is a Microtask, but setTimeout is a Macrotask, strictly use process.nextTick will be better, but browser not support
  setTimeout(function () {
    try {
      let result = func(arg)
      if (result === self) { // Promise Standard 2.3.1
        return doReject.call(self, new TypeError('Can not resolve \'Promise\' itself'))
      }
      doResolve.call(self, result)
    } catch (error) {
      doReject.call(self, error)
    }
  }, 0)
}

/**
 * IPromise prototype func then renturn a new IPromise Instance
 * 
 * @param { function } onFulfilled 
 * @param { function } onRejected 
 */
IPromise.prototype.then = function (onFulfilled, onRejected) {
  let self = this
  /**
   * self.constructor otherwise IPromise --> different Promise implement need communicate to each other
   * noop --> only new a 'Promise' then inject currentState/valOrErr etc...
   */
  let ownerPromise = new self.constructor(noop)

  /**
   * Value Penetration
   * -----------------
   * new IPromise(resolve => resolve(8))
   *     .then()
   *     .then()
   *     .then((data) => {console.log(data)})
   * Value Penetration means log '8' otherwise 'undefined'
   */
  onFulfilled = isFunction(onFulfilled) ? onFulfilled : function(val) { return val }
  onRejected = isFunction(onRejected) ? onRejected : function(err) { throw err }

  if (self.currentState !== Constants.PENDING) {
    let func = self.currentState === Constants.FULFILLED ? onFulfilled : onRejected
    // valOrErr stable self's status or func's thenable determine it's status
    asyncToResolveOrReject(ownerPromise, func, self.valOonrErr)
  } else {
    // push pending func
    self.onFulfilledCallback.push(function (value) {
      asyncToResolveOrReject(ownerPromise, onFulfilled, value)
    })
    self.onRejectedCallback.push(function (error) {
      asyncToResolveOrReject(ownerPromise, onRejected, error)
    })
  }

  return ownerPromise
}