'use strict';

let
	_ = require('lodash'),
	path = require('path'),
	q = require('q');

module.exports = function() {
	/**
	 * Normal function interacting with db and doing heavy lifting
	 */
	function functionName(parameters) {
		// Return a promise
		return q();
	}

	return {
		functionName: functionName
	};
};
