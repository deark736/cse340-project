const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
  try {
    const match = await bcrypt.compare(account_password, accountData.account_password)
    if (match) {
      // remove the hash before signing
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }        // expiresIn is in seconds
      )
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600 * 1000,      // 1 hour in ms
      })
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccount(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account",
    nav
  })
}

/* ****************************************
 *  Deliver account-edit view (fresh from DB)
 **************************************** */
async function buildEditAccount(req, res) {
  const account_id = res.locals.accountData.account_id
  let nav = await utilities.getNav()

  // Pull the latest data
  const acct = await accountModel.getAccountById(account_id)
  if (!acct) {
    // handle missing user…
    req.flash("error","Couldn’t load your account.")
    return res.redirect("/account/")
  }

  // Render using the DB values
  res.render("account/edit-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_id:         acct.account_id,
    account_firstname:  acct.account_firstname,
    account_lastname:   acct.account_lastname,
    account_email:      acct.account_email,
  })
}

/* ****************************************
 *  Process account-info update
 **************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const result = await accountModel.updateAccountInfo(
    account_id, account_firstname, account_lastname, account_email
  )
  if (result) {
    // refresh token/payload so header and greeting update
    res.locals.accountData = { ...res.locals.accountData, account_firstname, account_lastname, account_email }
    req.flash("notice", "Account updated")
    return res.redirect("/account/")
  }
  req.flash("error", "Update failed")
  return res.redirect(`/account/edit/${account_id}`)
}

/* ****************************************
 *  Process password change
 **************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  const hash = await bcrypt.hash(account_password, 10)
  const result = await accountModel.updatePassword(account_id, hash)
  if (result) {
    req.flash("notice", "Password changed")
    return res.redirect("/account/")
  }
  req.flash("error", "Password update failed")
  return res.redirect(`/account/edit/${account_id}`)
}

/* ****************************************
 *  Logout
 **************************************** */
function logout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out")
  return res.redirect("/")
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccount,
  buildEditAccount,
  updateAccount,
  updatePassword,
  logout
}