const express        = require("express")
const router         = express.Router()
const utilities      = require("../utilities/")
const invController  = require("../controllers/invController")
const invValidate    = require("../utilities/inv-validation")

/* ─────────────────────────────────────────
   Existing Inventory Routes
───────────────────────────────────────── */
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId))

router.get("/error", (req, res, next) => {
  next({ status: 500, message: "Intentional server crash for testing." })
})

/* ─────────────────────────────────────────
   Search & Filter Inventory View
───────────────────────────────────────── */
router.get(
  "/search",
  utilities.handleErrors(invController.searchForm)
)

/* ─────────────────────────────────────────
   Process Search Results
───────────────────────────────────────── */
router.get(
  "/search/results",
  invValidate.searchRules(),
  invValidate.checkSearchData,
  utilities.handleErrors(invController.searchResults)
)

/* ─────────────────────────────────────────
   Management View
───────────────────────────────────────── */
router.get(
  "/",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildManagement)
)

/* ─────────────────────────────────────────
   Add Classification
───────────────────────────────────────── */
router.get(
  "/add-classification",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/add-classification",
  utilities.checkAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassification,
  utilities.handleErrors(invController.addClassification)
)

/* ─────────────────────────────────────────
   Add Inventory Item
───────────────────────────────────────── */
router.get(
  "/add-inventory",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/add-inventory",
  utilities.checkAdmin,
  invValidate.inventoryRules(),
  invValidate.checkInventory,
  utilities.handleErrors(invController.addInventory)
)

// AJAX: return inventory JSON for a classification
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ─────────────────────────────────────────
   4) Edit Inventory — display the edit form
───────────────────────────────────────── */
router.get(
  "/edit/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.editInventoryView)
)

/* ─────────────────────────────────────────
   5) Update Inventory — process the edit form
───────────────────────────────────────── */
router.post(
  "/update",
  utilities.checkAdmin,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

/* ─────────────────────────────────────────
   6) Delete Inventory — display confirmation
───────────────────────────────────────── */
router.get(
  "/delete/:inv_id",
  utilities.checkAdmin,
  utilities.handleErrors(invController.buildDeleteView)
)

/* ─────────────────────────────────────────
   7) Delete Inventory — process the delete
───────────────────────────────────────── */
router.post(
  "/delete",
  utilities.checkAdmin,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router