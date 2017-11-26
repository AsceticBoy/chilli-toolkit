'use strict';

let IPromise = require('./core.js');
let Shared = require('./shared.js');

module.exports = IPromise;

function valueToIPromise(value, state) {
  let instance = new IPromise(Shared.noop);
  instance.currentState = state;
  instance.valOonrErr = value;
  return instance;
}

// IPromise Instance catch
IPromise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
};

// IPromise.resolve return a fulfilled IPromise
IPromise.resolve = function(value) {
  let self = this;
  // if value is a IPromise return self
  if (value instanceof IPromise) return value;

  // some special value
  if (value === undefined) return valueToIPromise(value, Shared.FULFILLED); // no value
  if (value === null) return valueToIPromise(value, Shared.FULFILLED);

  // value is thenable object
  if (Shared.isFunction(value) || Shared.isObject(value)) {
    try {
      let then = value.then; // [[ Must in try.catch beaceuse have on case IPromise.resolve(Object.create(null, { then: { get: function () { throw 123 } }})) you need catch '123' ]]
      if (Shared.isFunction(then)) {
        return new IPromise(then.bind(value));
      }
    } catch (error) {
      return new IPromise(function(resolve, reject) {
        reject(error);
      });
    }
  }

  return valueToIPromise(value, Shared.FULFILLED); // no Object no Function maybe a 'string' etc...
};

// IPromise.resolve return a rejected IPromise
IPromise.reject = function(error) {
  // if error is a thenable need not invoke then() return error self
  return valueToIPromise(error, Shared.REJECTED);
};

// IPromise.all wait allPromise stable then return new IPromise
IPromise.all = function(Iteratable) {
  try {
    // trigger a Array
    let array = Array.prototype.slice.call(Iteratable);
    return new IPromise(function(resolve, reject) {
      if (!array.length) return resolve([]);
      let rejectDone = false;
      let count = 0;
      function allResolver(idx, val) {
        if (val && (Shared.isObject(val) || Shared.isFunction(val))) {
          let then = val.then;
          // support IPromise and other 'Promise' Implement
          if (val instanceof IPromise && then === IPromise.prototype.then) {
            if (val.currentState === Shared.FULFILLED)
              return allResolver(idx, val.valOonrErr);
            if (val.currentState === Shared.REJECTED)
              return reject(val.valOonrErr);
            // pending
            then(function(val) {
              allResolver(idx, val);
            }, reject);
            return;
          } else {
            if (Shared.isFunction(then)) {
              let owner = new IPromise(then.bind(val));
              owner.then(function(val) {
                allResolver(idx, val);
              }, reject);
            }
            return;
          }
        }
        array[idx] = val;
        if (++count === array.length) {
          resolve(array);
        }
      }
      for (let i = 0; i < array.length; i++) {
        allResolver(i, array[i]);
      }
    });
  } catch (error) {
    return new IPromise(function(resolve, reject) {
      reject(error);
    });
  }
};

// IPromise.race means one Instance changeState then exec callback
IPromise.race = function(Iteratable) {
  try {
    let array = Array.prototype.slice.call(Iteratable);
    return new IPromise(function(resolve, reject) {
      if (!array.length) return resolve(Iteratable); // go back self like '' true false etc...
      for (let i = 0; i < array.length; i++) {
        IPromise.resolve(array[i]).then(resolve, reject);
      }
    });
  } catch (error) {
    return new IPromise(function(resolve, reject) {
      reject(error);
    });
  }
};
