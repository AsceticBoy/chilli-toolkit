'use strict'

var IPromise = require('../../lib/ipromise/es6-extensions');

exports.deferred = function () {
  var resolve, reject;
  var promise = new IPromise(function (_resolve, _reject) {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise: promise,
    resolve: resolve,
    reject: reject
  };
};
exports.resolved = IPromise.resolve;
exports.rejected = IPromise.reject;