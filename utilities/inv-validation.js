const utilities         = require(".")
const { body, query, validationResult } = require("express-validator")

const validate = {}

/* ─────────────────────────────────────────
   Classification Validation Rules
───────────────────────────────────────── */
validate.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty()
    .withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("No spaces or special characters allowed."),
]

/* ─────────────────────────────────────────
   Inventory Validation Rules
───────────────────────────────────────── */
validate.inventoryRules = () => [
  body("inv_make")
    .trim()
    .notEmpty()
    .withMessage("Make is required."),
  body("inv_model")
    .trim()
    .notEmpty()
    .withMessage("Model is required."),
  body("inv_year")
    .trim()
    .isLength({ min: 4, max: 4 })
    .withMessage("Year must be 4 digits."),
  body("inv_description")
    .trim()
    .notEmpty()
    .withMessage("Description is required."),
  body("inv_image")
    .trim()
    .notEmpty()
    .withMessage("Image path is required."),
  body("inv_thumbnail")
    .trim()
    .notEmpty()
    .withMessage("Thumbnail path is required."),
  body("inv_price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),
  body("inv_miles")
    .isInt({ min: 0 })
    .withMessage("Miles must be a positive integer."),
  body("inv_color")
    .trim()
    .notEmpty()
    .withMessage("Color is required."),
  body("classification_id")
    .isInt({ min: 1 })
    .withMessage("You must choose a classification."),
]

/* ─────────────────────────────────────────
   Classification Error Handler
───────────────────────────────────────── */
validate.checkClassification = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // re‐render form with errors + sticky input
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name: req.body.classification_name,
    })
  }
  next()
}

/* ─────────────────────────────────────────
   Inventory Error Handler (Add)
───────────────────────────────────────── */
validate.checkInventory = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // rebuild classification dropdown, sticky selection
    let classificationList = await utilities.buildClassificationList(
      req.body.classification_id
    )
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors,
      classificationList,
      // spread body so all fields are sticky
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
    })
  }
  next()
}

/* ─────────────────────────────────────────
   Inventory Error Handler (Update)
   — redirect back to edit view if errors
───────────────────────────────────────── */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(
      req.body.classification_id
    )
    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,
      nav,
      errors,
      classificationSelect,
      // re-insert all fields so form is sticky
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: req.body.inv_price,
      inv_miles: req.body.inv_miles,
      inv_color: req.body.inv_color,
      classification_id: req.body.classification_id,
    })
  }
  next()
}

/* ─────────────────────────────────────────
   Search/Filter Validation Rules
───────────────────────────────────────── */
validate.searchRules = () => [
  query("q")
    .trim()
    .notEmpty()
    .withMessage("Please enter a search term."),
  query("minPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Min price must be ≥ 0."),
  query("maxPrice")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Max price must be ≥ 0."),
  query("year")
    .optional({ checkFalsy: true })
    .isInt({ min: 1900, max: 2100 })
    .withMessage("Year must be a 4-digit number."),
]

validate.checkSearchData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.status(400).render("inventory/search", {
      title: "Search Inventory",
      nav,
      vehicles: [],               // no results
      q:       req.query.q,       // sticky
      minPrice:req.query.minPrice,
      maxPrice:req.query.maxPrice,
      year:    req.query.year,
      errors   // pass the full error object
    })
  }
  next()
}

module.exports = validate