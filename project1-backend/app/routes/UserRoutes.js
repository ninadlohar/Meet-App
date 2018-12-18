const userController = require('../controllers/UserController');
const appConfig = require('./../../config/appConfig')
const auth = require('../middlewares/auth')

let setRouter = (app) => {
  let baseUrl = `${appConfig.apiVersion}/users`;

  app.post(`${baseUrl}/signup`, userController.signUpFunction);
  app.post(`${baseUrl}/login`, userController.loginFunction);
  app.post(`${baseUrl}/logout/:userId`, userController.logout);
  app.post(`${baseUrl}/forgotPassword`, userController.forgotPassword)
  app.post(`${baseUrl}/resetPassword`, userController.resetPassword)
  app.get(`${baseUrl}/view/all`, auth.isAuthorized, userController.getAllUsers)

}

module.exports = {
  setRouter: setRouter
}