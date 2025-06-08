const invModel    = require("../models/inventory-model")
const utilities   = require("../utilities/")

const invCont = {}

/* ─────────────────────────────────────────
   1) Management View
───────────────────────────────────────── */
invCont.buildManagement = async (req, res, next) => {
  let nav = await utilities.getNav()
  // build the classification <select> for the page
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id, 10)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData.length) {
    return res.json(invData)
  }
  return next(new Error("No data returned"))
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  // 1) grab and parse the inv_id from the URL
  const inv_id = parseInt(req.params.inv_id, 10)

  // 2) build nav
  let nav = await utilities.getNav()

  // 3) fetch the single item’s data
  const itemData = await invModel.getInventoryById(inv_id)

  // 4) build the classification <select>, pre-selecting this item’s class
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  )

  // 5) formulate a friendly title
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  // 6) render the “edit” view, passing in every field
  res.render("inventory/edit-inventory", {
    title: `Edit ${itemName}`,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    classificationSelect,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  }

  // on failure, re-render edit form
  const classificationSelect = await utilities.buildClassificationList(
    classification_id
  )
  const itemName = `${inv_make} ${inv_model}`
  req.flash("error", "Sorry, the update failed.")
  return res.status(500).render("inventory/edit-inventory", {
    title: `Edit ${itemName}`,
    nav,
    errors: null,
    classificationSelect,
    inv_id,
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
  })
}

module.exports = invCont
// now includes getInventoryJSON via invCont object