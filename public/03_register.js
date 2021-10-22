const inputs = document.querySelectorAll('input'); // Getting all inputs on the page

const fnameError = document.getElementById('firstname-error');
const lnameError = document.getElementById('lastname-error');
const emailError = document.getElementById('email-error');
const usernameError = document.getElementById('username-error');
const passwordError = document.getElementById('password-error');
const confirmpasswordError = document.getElementById('confirmPassword-error');

// Patterns
const name_pattern = /^[a-z'-]{2,}$/i;
const username_pattern = /^[a-z'-]{4,}$/i;
const email_pattern = /\w+@\w{2,}\.\w{2,}/i;
const age_pattern = /^\d{2,}$/;
const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*[-_=+|\\].*).{8,}$/;

var no_errors = false;
const validate = (evt) => {

    let id = evt.target.id;
    if (id === "registerForm") {

        no_errors = true;
        var childDivs = document.getElementById('user-details-div').getElementsByTagName('input');

        for (i = 0; i < childDivs.length; i++) {
            validateInput(
                ((i == 0 || i == 1) ? name_pattern :
                    i == 2 ? email_pattern :
                        i == 3 ? username_pattern :
                            i == 4 ? password_pattern :
                                password_pattern),
                
                childDivs[i].value,

                (i == 0 ? fnameError :
                    i == 1 ? lnameError :
                        i == 2 ? emailError :
                            i == 3 ? usernameError :
                                i == 4 ? passwordError :
                                    confirmpasswordError),
                    
                (i == 0 ? "Invalid First Name" :
                    i == 1 ? "Invalid Last Name" :
                        i == 2 ? "Invalid Email" :
                            i == 3 ? "Invalid Username" :
                                i == 4 ? "Invalid Password" :
                                    "Passwords Do Not Match"),
            );
        }

        return no_errors;

    }

    let inputElement = document.getElementById(id);
    let inputText = inputElement.value;

    switch (id) {
        case 'firstname':
            validateInput(name_pattern, inputText, fnameError,"Invalid First Name" )
            break;
        case 'lastname':
            validateInput(name_pattern, inputText, lnameError, "Invalid Last Name")
            break;
        case 'username':
            validateInput(username_pattern, inputText, usernameError, "Invalid Username")
            break;
        case 'email':
            validateInput(email_pattern, inputText, emailError, "Invalid Email")
            break;
        case 'password':
            validateInput(password_pattern, inputText, passwordError, "Invalid Password")
            break;
        case 'confirmpassword':
            confirmpasswordError.innerText = document.getElementById("password").value === inputText ? "" : "Passwords Do Not Match";
            break;
        default:
            console.log("ERROR");
    }
}

// Validates input for any given input box when provided regex, text, element, and the error to display
const validateInput = (pattern, inputText, errorElement, errorText) => {
    console.log("IN VALIDATE INPUT")
    console.log(inputText);
    if (!pattern.test(inputText)) {
        errorElement.innerText = errorText;
        no_errors = false;
        console.log(inputText, "FAILED");
    } else { errorElement.innerText = ""; }
}

// Giving event listener to all inputs
inputs.forEach(element => { element.addEventListener('input', validate); });



