'use strict';

let IPromise = require('./core.js');
let Shared = require('./shared.js');

module.exports = IPromise;

// Prevent last IPromise error can not catch
IPromise.prototype.done = function(onFulfilled, onRejected) {
  let self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function(err) {
    setTimeout(() => {
      throw err;
    }, 0);
  });
};

// whatever fulfilled or rejected exec callback
IPromise.prototype.finally = function(callback) {
  // return a IPromise
  this.then(
    function(val) {
      IPromise.resolve(callback()).then(() => val);
    },
    function(err) {
      IPromise.resolve(callback()).then(() => {
        throw err;
      });
    }
  );
};
