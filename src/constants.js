'use strict'

const PENDING = (typeof Symbol === 'function' && Symbol.for && Symbol.for('PENDING')) || 'PENDING' // Pending
const FULFILLED = (typeof Symbol === 'function' && Symbol.for && Symbol.for('FULFILLED')) || 'FULFILLED' // Success
const REJECTED = (typeof Symbol === 'function' && Symbol.for && Symbol.for('REJECTED')) || 'REJECTED' // Rejected [error or fail]

module.exports = {
  PENDING,
  FULFILLED,
  REJECTED
}