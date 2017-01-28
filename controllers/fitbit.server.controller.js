'use strict';

let	path = require('path'),
	q = require('q'),
	fitbitService = require(path.resolve('./services/fitbit.server.service.js'))();

module.exports.overarchingFunctionNameToCallFromAppJs = function(req, res) {
	console.log(req.body);

	fitibtService.functionName()
	.then(function(result) {
		res.render('index.ejs');
	}, function(err) {
		res.status(400).json(err);
	});
};
