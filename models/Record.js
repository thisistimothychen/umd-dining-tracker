'use strict';

const mongoose = require('mongoose');
const path = require('path');

const schemaService = require(path.resolve(path.join(__dirname, '../services/schema.server.service')));
const GetterSchema = schemaService.GetterSchema;

const util = require(path.resolve(path.join(__dirname, '../services/util.server.service')));


/**
 * Record Schema
 */

let RecordSchema = new GetterSchema({
	user: {
		type: String,
		ref: 'User',
		required: 'A valid user is required'
	},
	date: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	food: [{
		name: {
			type: String,
			trim: true,
			required: 'Food name is required'
		},
		quantity: {
			type: Number,
			required: 'Food quantity is required'
		},
		measurement: {
			type: String,
			trim: true,
			required: 'Food measurement is required'
		},
		calories: {
			type: Number,
			required: 'Food calories is required'
		},
		time: {
			type: Date,
			default: Date.now,
			get: util.dateParse
		}
	}],
	steps: {
		type: Number,
		default: 0
	},
	sleep: {
		type: Number,
		default: 0
	},
	heartRate: {
		type: Number
	}
});

/**
 * Index declarations
 */

// Text-search index
RecordSchema.index({
	user: 'text',
	'food.name': 'text',
});

const Record = mongoose.model('Record', RecordSchema);
module.exports = Record;
