const mongoose = require('mongoose')
const Schema = mongoose.Schema
const time = require('../libs/timeLib')

const Meeting = new Schema({
  meetingId: {
    type: String,
    required: true,
    unique: true,
    default: ''
  },
  title: {
    type: String,
    required: true,
    default: ''
  },
  startDate: {
    type: Date,
    default: ''
  },
  endDate: {
    type: Date,
    default: ''
  },

  /* that's me */

  createdBy: {
    type: String,
    default: ''
  },
  createdByEmail: {
    type: String,
    default: '',
    required: true
  },
  createdById: {
    type: String,
    default: '',
    required: true
  },

  /* send meeting info to user */
  createdFor: {
    type: String,
    default: '',
    required: true
  },
  createdForEmail: {
    type: String,
    default: '',
    required: true
  },
  createdOn: {
    type: Date,
    default: ''
  }
})

module.exports = mongoose.model('Meeting', Meeting)