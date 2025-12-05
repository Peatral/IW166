const CORRECT_PASSWORD = "3da541559918a808c2402bba5012f6c60b27661c";

const passwordForm = document.getElementById("password-form");
const passwordInput = document.getElementById("password-input");
const messageElement = document.getElementById("message");
const downloadArea = document.getElementById("download-area");

passwordForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent default form submission (page reload)

  if (passwordInput.value === CORRECT_PASSWORD) {
    messageElement.textContent = ""; // Clear any previous error message
    passwordForm.style.display = "none"; // Hide the password input
    downloadArea.style.display = "block"; // Show the download links
  } else {
    messageElement.textContent = "Incorrect password. Please try again.";
    passwordInput.value = ""; // Clear the input field
    passwordInput.focus(); // Put focus back on the input
  }
});
