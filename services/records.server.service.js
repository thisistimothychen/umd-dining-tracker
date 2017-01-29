'use strict';

let
	_ = require('lodash'),
	path = require('path'),
	q = require('q'),
	request = require('request'),

	Record = require(path.resolve('./models/Record'));

module.exports = function() {

	function createRecord(recordInfo) {
		let newRecord = new Record({});

		// Write the auto-generated metadata
		newRecord.created = Date.now();
		newRecord.updated = Date.now();
		newRecord.user = recordInfo.user;

		let start = new Date();
		start.setHours(0,0,0,0);

		let end = new Date();
		end.setHours(23,59,59,999);

		console.log(recordInfo.user);
		return Record.findOne({user: recordInfo.user, date: {$gte: start, $lt: end}}).exec()
			.then((result) => {
				console.log(result);
				if (result == null) {
					newRecord.food = [];

					newRecord.food.push({
						name: recordInfo.namee,
						quantity: recordInfo['servings-quantity'],
						measurement: recordInfo.measurement,
						calories: parseFloat(recordInfo['servings-quantity']) * recordInfo.calories
					});

					return newRecord.save();
				}
				else {
					result.food.push({
						name: recordInfo.namee,
						quantity: recordInfo['servings-quantity'],
						measurement: recordInfo.measurement,
						calories: parseFloat(recordInfo['servings-quantity']) * recordInfo.calories
					});

					return result.save();
				}
			});
	}

	function updateRecord(record, newRecord) {
		record.updated = Date.now();
		let mergedUser = _.merge(record, newRecord);
		return mergedUser.save();
	}

	function searchRecords(query) {
		return Record.find(query).exec().then(function(result) {
			if (null == result) {
				return q({
					length: 0,
					elements: []
				});
			} else {
				return q({
					length: result.length,
					elements: result
				});
			}
		});
	}

	return {
		createRecord: createRecord,
		updateRecord: updateRecord,
		searchRecords: searchRecords
	};
};