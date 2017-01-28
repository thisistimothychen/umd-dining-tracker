'use strict';

let	path = require('path'),
	q = require('q'),
	fitbitService = require(path.resolve('./services/fitbit.server.service.js'))();

module.exports.callFitbitAPI = function(req, res, params) {
	console.log("Hello World")
	console.log(req.body);

	fitbitService.functionName()
	.then(function(result) {
		res.render('fitbitTest.ejs', params);
	}, function(err) {
		res.status(400).json(err);
	});
};
