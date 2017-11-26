'use strict'

var adapter = require('./adapter')
var tests = require('promises-aplus-tests')

tests.mocha(adapter)