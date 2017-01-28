'use strict';

let
	_ = require('lodash'),
	path = require('path'),
	q = require('q'),

	Record = require(path.resolve('./models/Record'));

module.exports = function() {

	function createRecord(recordInfo) {
		// Create the new tag model
		let newRecord = new Record(recordInfo);

		// Write the auto-generated metadata
		newRecord.created = Date.now();
		newRecord.updated = Date.now();

		return newRecord.save().then(() => {
			return searchRecords({_id: newRecord._id});
		}).then((result) => {
			return q(result.elements[0]);
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