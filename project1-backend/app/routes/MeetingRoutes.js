const express = require('express');
const meetingController = require("../controllers/MeetingController");
const appConfig = require("./../../config/appConfig")
const auth = require('../middlewares/auth')

let setRouter = (app) => {
  let baseUrl = `${appConfig.apiVersion}/meeting`;
  app.post(`${baseUrl}/createMeeting`, auth.isAuthorized, meetingController.createMeeting);
  app.put(`${baseUrl}/updateMeeting/:meetingId`, auth.isAuthorized, meetingController.updateMeeting)
  app.get(`${baseUrl}/allMeetings/:userId`, auth.isAuthorized, meetingController.getAllMeetingsOnInit)
  app.get(`${baseUrl}/getMeetingOnClick`, auth.isAuthorized, meetingController.getAllMeetingsOnClick)
  app.get(`${baseUrl}/getOneMeeting/:meetingId`, auth.isAuthorized, meetingController.getSingleMeeting)
  app.get(`${baseUrl}/getNormalMeetings/:userId`, auth.isAuthorized, meetingController.getNormalMeetingsOnInit)
  app.post(`${baseUrl}/deleteMeeting/:meetingId`, auth.isAuthorized, meetingController.deleteMeeting)
  app.post(`${baseUrl}/setReminder`, auth.isAuthorized, meetingController.setReminder)
}

module.exports = {
  setRouter: setRouter
}