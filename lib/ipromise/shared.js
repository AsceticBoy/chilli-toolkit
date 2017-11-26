'use strict';

// constants
const PENDING =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('PENDING')) ||
  'PENDING'; // Pending
const FULFILLED =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('FULFILLED')) ||
  'FULFILLED'; // Success
const REJECTED =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('REJECTED')) ||
  'REJECTED'; // Rejected [error or fail]

// utils
function isObject(obj) {
  return typeof obj === 'object';
}

function isFunction(func) {
  return typeof func === 'function';
}

function noop() {}

module.exports = {
  PENDING,
  FULFILLED,
  REJECTED,
  isObject,
  isFunction,
  noop,
};
