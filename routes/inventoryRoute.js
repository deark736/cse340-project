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
   Management View
───────────────────────────────────────── */
router.get("/", utilities.handleErrors(invController.buildManagement))

/* ─────────────────────────────────────────
   Add Classification
───────────────────────────────────────── */
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassification,
  utilities.handleErrors(invController.addClassification)
)

/* ─────────────────────────────────────────
   Add Inventory Item
───────────────────────────────────────── */
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventory,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router