'use strict';

let path = require('path'),
	q = require('q'),

	recordsService = require(path.resolve(path.join(__dirname, '../services/records.server.service.js')))(),
	Record = require(path.resolve(path.join(__dirname, '../models/Record')));

module.exports.create = (req, res) => {
	req.body.user = req.session.cas_username;
	recordsService.createRecord(req.body)
		.then((result) => {
			res.status(200).json(result);
		}, (err) => {
			res.status(400).json(err);
		});
};

module.exports.createManual = (req, res, params) => {
	req.body.user = req.session.cas_username;
	req.body.namee = req.body['food-name'];
	req.body['servings-quantity'] = req.body['food-quantity'];
	req.body.measurement = req.body['food-measurement'];
	req.body.calories = req.body['food-calories'];

	recordsService.createRecord(req.body)
		.then((result) => {
			res.render('food_insert.ejs', params);
			// res.status(200).json(result);
		}, (err) => {
			res.status(400).json(err);
		});
};

module.exports.update = (req, res) => {
	recordsService.updateRecord(req.body.oldRecord, req.body.newRecord)
		.then((result) => {
			res.status(200).json(result);
		}, (err) => {
			res.status(400).json(err);
		});
};

module.exports.search = (req, res) => {
	recordsService.searchRecords(req.body)
		.then((result) => {
			res.status(200).json(result);
		}, (err) => {
			res.status(400).json(err);
		});
};

module.exports.getData = (req, res, date) => {
	let start = new Date(date);
	start.setHours(0,0,0,0);

	let end = new Date(date);
	end.setHours(23,59,59,999);

	return recordsService.searchRecords({user: req.session.cas_username, date: {$gte: start, $lt: end}})
};
