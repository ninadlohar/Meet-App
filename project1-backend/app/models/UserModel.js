const mongoose = require('mongoose')

let Schema = mongoose.Schema

let userSchema = new Schema({
  firstName: {
    type: String,
    default: ''
  },
  userId: {
    required: true,
    unique: true,
    index: true,
    default: '',
    type: String
  },
  userName: {
    required: true,
    unique: true,
    index: true,
    type: String,
  },
  lastName: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: Number,
    default: '',
    min: 10,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    default: 'password'
  },
  isAdmin: {
    type: Boolean,
    default: '',
  },
  createdOn: {
    type: Date,
    default: ''
  }
})

mongoose.model('User', userSchema)