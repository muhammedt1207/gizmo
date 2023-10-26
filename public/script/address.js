const pincodeInput = document.getElementById('pincode-input');
const validationMessage = document.getElementById('pincode-validation-message');
var signupButton = document.getElementById("submit-button");

pincodeInput.addEventListener('input', function () {
    const pincode = pincodeInput.value;
    const isValid = /^[0-9]{6}$/.test(pincode); 
    if (isValid) {
        validationMessage.textContent = 'Valid PIN Code';
        validationMessage.classList.remove('text-danger');
        validationMessage.classList.add('text-success');
        signupButton.disabled = false; // Enable the button
    } else {
        validationMessage.textContent = 'Invalid PIN Code (Must be a 6-digit number)';
        validationMessage.classList.remove('text-success');
        validationMessage.classList.add('text-danger');
        signupButton.disabled = true; // Disable the button

    }
});