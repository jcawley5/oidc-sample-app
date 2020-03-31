function triggerUserPopOver() {
  const userPopOver = document.getElementById("userPopOver");
  const toggle = userPopOver.getAttribute("aria-hidden");
  userPopOver.setAttribute("aria-hidden", toggle == "false");
}

function logout() {
  window.location = "/logout";
}
