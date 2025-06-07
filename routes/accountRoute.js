const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Route to login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Route to registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration form
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/",
  utilities.checkLogin,                                  // ← our new gatekeeper
  utilities.handleErrors(accountController.buildAccount)
)

module.exports = router