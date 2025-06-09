const pool = require("../database/")

/* **********************
 * Fetch all classifications
 * *********************/
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
}

/* **************************************
 * Register a new classification
 * *************************************/
async function registerClassification(classification_name) {
  try {
    // Check for duplicates
    const checkExisting = await pool.query(
      "SELECT * FROM classification WHERE classification_name = $1",
      [classification_name]
    )
    if (checkExisting.rows.length) {
      throw new Error("Classification already exists.")
    }

    // Proceed with insert if not a duplicate
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    return result.rows[0]
  } catch (error) {
    console.error("registerClassification error:", error.message)
    throw error
  }
}

/* **************************************
 * Register a new inventory vehicle
 * *************************************/
async function registerInventory(
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
) {
  try {
    const sql = `
      INSERT INTO inventory
        (inv_make, inv_model, inv_year, inv_description,
         inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
         classification_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `
    const result = await pool.query(sql, [
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
    ])
    return result.rows[0]
  } catch (error) {
    console.error("registerInventory error:", error)
    return null
  }
}

/* **************************************
 * Get inventory by classification ID
 * *************************************/
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    return []
  }
}

/* **************************************
 * Get inventory by inventory ID
 * *************************************/
async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error:", error)
    return null
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        inv_make       = $1,
        inv_model      = $2,
        inv_description= $3,
        inv_image      = $4,
        inv_thumbnail  = $5,
        inv_price      = $6,
        inv_year       = $7,
        inv_miles      = $8,
        inv_color      = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *
    `
    const result = await pool.query(sql, [
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
      inv_id,
    ])
    return result.rows[0]
  } catch (error) {
    console.error("updateInventory model error:", error)
    return null
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data          // data.rowCount === 1 if deleted
  } catch (error) {
    console.error("deleteInventoryItem error:", error)
    return null
  }
}

/* ***************************
 *  Search Inventory with Filters
 * ************************** */
async function searchInventory(term, filters = {}) {
  // build base SQL & params
  let sql = `
    SELECT
      i.*,
      c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE (i.inv_make ILIKE $1 OR i.inv_model ILIKE $1)
  `
  const params = [`%${term}%`]

  // optional numeric filters
  if (filters.minPrice != null) {
    params.push(filters.minPrice)
    sql += ` AND i.inv_price >= $${params.length}`
  }
  if (filters.maxPrice != null) {
    params.push(filters.maxPrice)
    sql += ` AND i.inv_price <= $${params.length}`
  }
  if (filters.year != null) {
    params.push(filters.year)
    sql += ` AND i.inv_year = $${params.length}`
  }

  // order and execute
  sql += ` ORDER BY i.inv_make, i.inv_model`
  const data = await pool.query(sql, params)
  return data.rows
}

module.exports = {
  getClassifications,
  registerClassification,
  registerInventory,
  getInventoryByClassificationId,
  getInventoryById,
  updateInventory,
  deleteInventoryItem,
  searchInventory,
}