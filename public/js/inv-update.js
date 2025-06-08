'use strict';

const form = document.querySelector("#updateForm")
if (form) {
  const updateBtn = form.querySelector("button[type=submit]")
  form.addEventListener("change", () => {
    updateBtn.removeAttribute("disabled")
  })
}