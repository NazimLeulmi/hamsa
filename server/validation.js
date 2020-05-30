const v = require('validator');

function regValidation(name, password, passwordc, answer, a, b) {
  const errors = [];
  ////////////////////////////////
  ///// Name Validation /////////
  //////////////////////////////
  if (v.isEmpty(name)) {
    errors.push("The name is required");
  }
  else if (v.isAlphanumeric(name) === false) {
    errors.push('The name must contain numbers and letters only')
  }
  else if (v.isLength(name, { min: 3, max: 150 }) === false) {
    errors.push('The name has to be (3 ~ 150) characters')
  }
  /////////////////////////////////////
  /////// Password Validation ////////
  ///////////////////////////////////
  if (v.isEmpty(password)) {
    errors.push("The password is required");
  }
  else if (v.isLength(password, { min: 10, max: 150 }) === false) {
    errors.push('The password has to be (10 ~ 150) characters')
  } else if (v.equals(password, passwordc) === false) {
    errors.push("the password confirmation doesn't match");
  }
  /////////////////////////////////////
  /////// Antispam Validation ////////
  ///////////////////////////////////
  if (v.isEmpty(answer)) {
    errors.push("The question must be answered");
  }
  else if (v.isInt(`${a}`) === false || v.isInt(`${b}`) === false || v.isInt(answer) === false) {
    errors.push('The answer must be an integer')
  }
  else if (a + b !== parseInt(answer)) {
    errors.push('Incorrect answer')
  }
  return { isValid: errors.length === 0, errors }
}
function loginValidation(name, password) {
  const errors = [];
  ////////////////////////////////
  ///// Name Validation /////////
  //////////////////////////////
  if (v.isEmpty(name)) {
    errors.push("The name is required");
  }
  else if (v.isAlphanumeric(name) === false) {
    errors.push('The name must contain numbers and letters only')
  }
  if (v.isEmpty(password)) {
    errors.push("The password is required");
  }
  return { isValid: errors.length === 0, errors }
}

function addContactValidation(name) {
  const errors = [];
  if (v.isEmpty(name)) {
    errors.push("The name is required");
  }
  else if (v.isAlphanumeric(name) === false) {
    errors.push('The name must be alphanumeric')
  }
  return { isValid: errors.length === 0, errors }
}

module.exports = { loginValidation, regValidation, addContactValidation }
