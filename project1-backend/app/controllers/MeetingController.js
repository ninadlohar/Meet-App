const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const sendEmail = require('../libs/sendEmail')
const check = require('../libs/checkLib')
const AuthModel = mongoose.model('Auth')
const UserModel = mongoose.model('User')
const MeetingModel = mongoose.model('Meeting')

/** function to create meeting */

let createMeeting = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (req.body.title && req.body.startDate && req.body.endDate &&
        req.body.createdBy && req.body.createdByEmail && req.body.createdById &&
        req.body.createdFor && req.body.createdForEmail) {
        resolve(req)
      } else {
        let apiResponse = response.generate(true, 'some fields are invalid', 400, null)
        reject(apiResponse)
      }
    })
  }
  let addMeeting = () => {
    return new Promise((resolve, reject) => {
      let newMeeting = new MeetingModel({
        meetingId: shortid.generate(),
        title: req.body.title,
        startDate: req.body.endDate,
        endDate: req.body.endDate,
        createdBy: req.body.createdBy,
        createdById: req.body.createdById,
        createdByEmail: req.body.createdByEmail,
        createdFor: req.body.createdFor,
        createdForEmail: req.body.createdForEmail,
        createdOn: time.now(),
      })
      newMeeting.save((err, result) => {
        if (err) {
          let apiResponse = response.generate(true, 'failed to save the meeting details', 417, null)
          reject(apiResponse)
        } else {
          let newMeetingObj = result.toObject()
          sendEmail.sendEmail(newMeetingObj.createdForEmail, `<b>${newMeetingObj.createdByEmail} has set a meeting for you on ${newMeetingObj.startDate} and will end on ${newMeetingObj.endDate}`)
          resolve(newMeetingObj)
        }
      })
    })
  }
  validateUserInput(req, res)
    .then(addMeeting)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'meeting created', 200, resolve)
      res.send(apiResponse)
    }).catch(err => res.send(err))
}

/** function to display single meeting(offline) */

let getSingleMeeting = (req, res) => {
  MeetingModel.findOne({
      meetingId: req.params.meetingId
    })
    .select()
    .lean()
    .exec((err, meetingDetails) => {
      if (err) {
        let apiResponse = response.generate(true, 'Error finding meeting details', 500, null)
        res.send(apiResponse)
      } else if (check.isEmpty(meetingDetails)) {
        let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
        res.send(apiResponse)
      } else {
        let apiResponse = response.generate(false, 'Meeting Found', 200, meetingDetails)
        res.send(apiResponse)
      }
    })
}

/** function to display all meeting on ngOnInit */

let getAllMeetingsOnInit = (req, res) => {
  let findUser = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        userId: req.params.userId
      }, (err, result) => {
        if (err) {
          let apiResponse = response.generate(false, 'failed to find user', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'no user found', 404, null)
          reject(apiResponse)
        } else {
          resolve(result)
        }
      })
    })
  }
  let findMeeting = (result) => {
    return new Promise((resolve, reject) => {
      if (result.isAdmin == true) {
        MeetingModel.find({
            createdById: result.userId
          })
          .select('-__v -_id')
          .lean()
          .exec((err, meetings) => {
            if (err) {
              let apiResponse = response.generate(false, 'failed to find meetings', 500, null)
              reject(apiResponse)
            } else if (check.isEmpty(meetings)) {
              let apiResponse = response.generate(true, 'no meetings found', 404, null)
              reject(apiResponse)
            } else {
              resolve(meetings)
            }
          })
      } else {
        MeetingModel.findOne({
            createdFor: result.userId
          })
          .select('-__v -_id')
          .lean()
          .exec((err, meetings) => {
            if (err) {
              let apiResponse = response.generate(false, 'failed to find meetings', 500, null)
              reject(apiResponse)
            } else if (check.isEmpty(meetings)) {
              let apiResponse = response.generate(true, 'no meetings found', 404, null)
              reject(apiResponse)
            } else {
              resolve(meetings)
            }
          })
      }
    })
  }
  findUser(req, res)
    .then(findMeeting)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'all meetings found', 200, resolve)
      res.send(apiResponse)
    }).catch((err) => res.send(err))
}

/** function to display meetings when clicked on user */

let getAllMeetingsOnClick = (req, res) => {
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.query.createdById) || check.isEmpty(req.query.createdFor)) {
        let apiResponse = response.generate(true, 'parameters missing', 403, null)
        reject(apiResponse)
      } else {
        resolve()
      }
    })
  }
  let findMeetings = () => {
    return new Promise((resolve, reject) => {
      let findQuery = {
        $or: [{
          $and: [{
              createdById: req.query.createdById
            },
            {
              createdFor: req.query.createdFor
            }
          ]
        }, {
          $and: [{
              createdFor: req.query.createdFor
            },
            {
              createdById: req.query.createdById
            }
          ]
        }]
      }
      MeetingModel.find(findQuery)
        .select('-_id -__v')
        .lean()
        .exec((err, result) => {
          if (err) {
            let apiResponse = response.generate(true, 'error while finding meetings', 500, null)
            reject(apiResponse)
          } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, 'no meetings found', 404, null)
            reject(apiResponse)
          } else {
            resolve(result)
          }
        })
    })
  }
  validateParams()
    .then(findMeetings)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'all meetings found', 200, resolve)
      res.send(apiResponse)
    }).catch((err) => res.send(err))
}

/** function to update meeting */

let updateMeeting = (req, res) => {
  let findMeetings = () => {
    return new Promise((resolve, reject) => {
      MeetingModel.findOne({
        meetingId: req.params.meetingId
      }, (err, result) => {
        if (err) {
          let apiResponse = response.generate(true, 'error finding meeting', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'failed to find meeting', 404, null)
          reject(apiResponse)
        } else {
          resolve(result)
        }
      })
    })
  }
  let update = (result) => {
    return new Promise((resolve, reject) => {
      let options = req.body
      MeetingModel.update({
        meetingId: req.params.meetingId
      }, options, (err, result1) => {
        if (err) {
          let apiResponse = response.generate(true, 'failed to update meeting', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(result1)) {
          let apiResponse = response.generate(true, 'error finding meeting', 404, null)
          reject(apiResponse)
        } else {
          let meeting = result
          sendEmail.sendEmail(meeting.createdForEmail, `Hello, your meeting has been rescheduled on ${meeting.startDate} and will be ending on ${meeting.endDate}`)
          resolve(result1)
        }
      })
    })
  }
  findMeetings()
    .then(update)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'updated successfully', 200, resolve)
      res.send(apiResponse)
    }).catch((err) => res.send(err))
}

/** function to get non admin meetings on ngOnInit */

let getNormalMeetingsOnInit = (req, res) => {
  let validateUserInput = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.params.userId)) {
        let apiResponse = response.generate(true, 'userID parameter is missing', 401, null)
        reject(apiResponse)
      } else {
        resolve(req)
      }
    })
  }
  let findUser = (req) => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        userId: req.params.userId
      }, (err, result) => {
        if (err) {
          let apiResponse = response.generate(true, 'error finding user', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'failed to find user details', 404, null)
          reject(apiResponse)
        } else {
          resolve(result)
        }
      })
    })
  }
  let findMeetings = (result) => {
    if (result.isAdmin == false) {
      return new Promise((resolve, reject) => {
        MeetingModel.find({
            createdFor: result.userId
          })
          .select()
          .lean()
          .exec((err, result1) => {
            if (err) {
              let apiResponse = response.generate(true, 'error finding meetings', 500, null)
              reject(apiResponse)
            } else if (check.isEmpty(result)) {
              let apiResponse = response.generate(true, 'failed to find meeting', 404, null)
              reject(apiResponse)
            } else {
              resolve(result1)
            }
          })
      })
    }
  }
  validateUserInput()
    .then(findUser)
    .then(findMeetings)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'meetings found', 200, resolve)
      res.send(apiResponse)
    }).catch((err) => res.send(err))
}

/** function to delete meeting */

let deleteMeeting = (req, res) => {
  let findMeeting = () => {
    return new Promise((resolve, reject) => {
      MeetingModel.findOne({
        meetingId: req.params.meetingId
      }, (err, result) => {
        if (err) {
          let apiResponse = response.generate(true, 'error finding meeting', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'failed to find meeting', 404, null)
          reject(apiResponse)
        } else {
          resolve(result)
        }
      })
    })
  }
  let deleteM = (result) => {
    return new Promise((resolve, reject) => {
      MeetingModel.findOneAndRemove({
        meetingId: req.params.meetingId
      }, (err, result1) => {
        if (err) {
          let apiResponse = response.generate(true, 'error deleting meeting', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(result1)) {
          let apiResponse = response.generate(true, 'failed to deleting meeting', 404, null)
          reject(apiResponse)
        } else {
          sendEmail.sendEmail(result.createdForEmail, `<b>Meeting with title:${result.title} was deleted by ${result.createdBy}</b>`)
          sendEmail.sendEmail(result.createdByEmail, `<b>Meeting with title:${result.title} was deleted by ${result.createdBy}/You</b>`)
          resolve(result1)
        }
      })
    })
  }
  findMeeting()
    .then(deleteM)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'meeting was successfully deleted', 200, resolve)
      res.send(apiResponse)
    }).catch((err) => res.send(err))
}

let setReminder = (req, res) => {
  let findUser = () => {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        userId: req.body.userId
      }, (err, result) => {
        if (err) {
          let apiResponse = response.generate(true, 'error finding user', 500, null)
          reject(apiResponse)
        } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'no user found', 404, null)
          reject(apiResponse)
        } else {
          resolve(result)
        }
      })
    })
  }
  let findMeetings = (userDetails) => {
    return new Promise((resolve, reject) => {
      if (userDetails.isAdmin == true) {
        MeetingModel.find({
            createdById: req.body.userId
          })
          .select()
          .lean()
          .exec((err, meetingDetails) => {
            if (err) {
              let apiResponse = response.generate(true, 'Failed To Find Meetings', 500, null)
              reject(apiResponse)
            } else if (check.isEmpty(meetingDetails)) {
              let apiResponse = response.generate(true, 'No Meeting Found', 404, null)
              reject(apiResponse)
            } else {
              let i = 0;
              for (let meeting of meetingDetails) {
                if (time.getToday(meeting.startDate)) {
                  sendEmail.sendEmail(meeting.createdForEmail, `reminder for your meeting: ${meeting.title} on ${meeting.startDate}`)
                  i += 1;
                }
              }
              if (i > 0) {
                let apiResponse = response.generate(false, 'Meetings Found and sent reminders', 200, null)
                resolve(apiResponse)
              } else {
                let apiResponse = response.generate(true, 'No Meetings Today', 404, null)
                reject(apiResponse)
              }
            }
          })
      }
    })
  } // end findMeetings
  findUser()
    .then(findMeetings)
    .then((resolve) => {
      let apiResponse = response.generate(false, 'meetings found', 200, resolve)
      res.send(apiResponse)
    }).catch(err => res.send(err))
}


module.exports = {
  createMeeting: createMeeting,
  getSingleMeeting: getSingleMeeting,
  getAllMeetingsOnClick: getAllMeetingsOnClick,
  getAllMeetingsOnInit: getAllMeetingsOnInit,
  updateMeeting: updateMeeting,
  getNormalMeetingsOnInit: getNormalMeetingsOnInit,
  deleteMeeting: deleteMeeting,
  setReminder: setReminder
}