const PasswordValidator = require('password-validator');

const schema = new PasswordValidator();

schema
  .is().min(8) // Minimum length is 8 characters
  .has().uppercase() // Must have uppercase letters
  .has().lowercase() // Must have lowercase letters
  .has().digits() // Must have digits
  .has().symbols() // Must have symbols
  .is().not().spaces(); // Must not have spaces

function validatePassword() {
  var password = document.getElementById("password").value;
  var msg = document.getElementById("passwordError");
  var signupButton = document.getElementById("signupButton");

  if (schema.validate(password)) {
    msg.innerHTML = "";
    signupButton.disabled = false;
  } else {
    msg.innerHTML = "Password must meet the specified criteria.";
    signupButton.disabled = true;
  }
}
