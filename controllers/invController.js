const invModel    = require("../models/inventory-model")
const utilities   = require("../utilities/")

const invCont = {}

/* ─────────────────────────────────────────
   1) Management View
───────────────────────────────────────── */
invCont.buildManagement = async (req, res, next) => {
  let nav = await utilities.getNav()
  // any flash messages are in res.locals.messages
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
  })
}

/* ─────────────────────────────────────────
   2) Add Classification
───────────────────────────────────────── */
// deliver form
invCont.buildAddClassification = async (req, res, next) => {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}
// process form
invCont.addClassification = async (req, res, next) => {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  try {
    const result = await invModel.registerClassification(classification_name)
    req.flash("notice", `Classification "${classification_name}" added.`)
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav: await utilities.getNav(),
    })
  } catch (error) {
    req.flash("error", error.message)
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      classification_name,
      errors: null,
    })
  }
}

/* ─────────────────────────────────────────
   3) Add Inventory Vehicle
───────────────────────────────────────── */
// deliver form
invCont.buildAddInventory = async (req, res, next) => {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    errors: null,
    classificationList,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
  })
}
// process form
invCont.addInventory = async (req, res, next) => {
  let nav = await utilities.getNav()
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const result = await invModel.registerInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )
  if (result) {
    req.flash("notice", `Vehicle ${inv_make} ${inv_model} added.`)
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  }
  req.flash("error", "Sorry, could not add vehicle.")
  let classificationList = await utilities.buildClassificationList(classification_id)
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    errors: null,
    classificationList,
  })
}

/* ─────────────────────────────────────────
   View Vehicles by Classification
───────────────────────────────────────── */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ─────────────────────────────────────────
   Vehicle Detail View
───────────────────────────────────────── */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)
  const detail = await utilities.buildDetailView(data)
  let nav = await utilities.getNav()
  const name = `${data.inv_make} ${data.inv_model}`
  res.render("inventory/detail", {
    title: name,
    nav,
    detail
  })
}

module.exports = invCont