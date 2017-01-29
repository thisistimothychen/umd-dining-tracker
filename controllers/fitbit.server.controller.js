'use strict';

let	path = require('path'),
	q = require('q'),
	fitbitService = require(path.resolve('./services/fitbit.server.service.js'))();

module.exports.fitbit = function(req, res, params) {
	fitbitService.getFitbit()
	.then(function(result) {
		res.render('fitbitTest.ejs', params);
	}, function(err) {
		res.status(400).json(err);
	});
};
