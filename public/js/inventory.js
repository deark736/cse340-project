'use strict'

const classificationList = document.querySelector("#classificationList")
classificationList.addEventListener("change", () => {
  const classification_id = classificationList.value
  const url = `/inv/getInventory/${classification_id}`

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not OK")
      return res.json()
    })
    .then(data => buildInventoryList(data))
    .catch(err => console.error("Fetch error:", err.message))
})

// Build and inject the table rows
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay")
  let html = `
    <thead>
      <tr>
        <th>Vehicle Name</th>
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
  `
  data.forEach(item => {
    html += `
      <tr>
        <td>${item.inv_make} ${item.inv_model}</td>
        <td><a href="/inv/edit/${item.inv_id}" title="Click to update">Modify</a></td>
        <td><a href="/inv/delete/${item.inv_id}" title="Click to delete">Delete</a></td>
      </tr>
    `
  })
  html += `</tbody>`
  inventoryDisplay.innerHTML = html
}