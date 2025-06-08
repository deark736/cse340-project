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

// Show edit-account view
router.get(
  "/edit/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildEditAccount)
)

// Process account-info update
router.post(
  "/edit",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdate,
  utilities.handleErrors(accountController.updateAccount)
)

// Process password change
router.post(
  "/password",
  utilities.checkLogin,
  regValidate.passwordRules(),
  regValidate.checkPasswordUpdate,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout
router.get("/logout", utilities.handleErrors(accountController.logout))

router.get(
  "/",
  utilities.checkLogin,                                  // ← our new gatekeeper
  utilities.handleErrors(accountController.buildAccount)
)

module.exports = router