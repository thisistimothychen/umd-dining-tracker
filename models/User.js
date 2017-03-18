'use strict';

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const path = require('path');

const schemaService = require(path.resolve(path.join(__dirname, '../services/schema.server.service')));
const GetterSchema = schemaService.GetterSchema;

const util = require(path.resolve(path.join(__dirname, '../services/util.server.service')));

/**
 * User Schema
 */

let UserSchema = new GetterSchema({
	firstName: {
		type: String,
		trim: true
	},
	lastName: {
		type: String,
		trim: true
	},
	username: {
		type: String,
		trim: true,
        unique: 'This username is already taken',
		required: 'Username/UID is required'
	},
	email: {
		type: String,
		trim: true,
		required: 'Email is required',
		match: [/.+\@.+\..+/, 'A valid email address is required']
	},
	age: {
		type: Number
	},
	gender: {
		type: String,
		trim: true
	},
	weight: {
		type: Number
	},
	height: {
		type: Number
	},
	updated: {
		type: Date,
		get: util.dateParse
	},
	created: {
		type: Date,
		default: Date.now,
		get: util.dateParse
	},
	lastLogin: {
		type: Date,
		default: null,
		get: util.dateParse
	}
});

/**
 * Index declarations
 */

// Text-search index
UserSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  username: 'text',
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
