function validateRegister(name, password, passwordc, answer, a, b) {
  const errors = [];
  if (name === "" || name === undefined || name === null) {
    errors.push("The name is required");
  } else if (name.length > 150 || name.length < 5) {
    errors.push("The name has to be (5 ~ 150) characters")
  }
  if (password === "" || password === undefined || password === null) {
    errors.push("The password is required");
  } else if (password.length > 150 || password.length < 10) {
    errors.push("The password has to be (10 ~ 150) characters")
  }
  if (password !== null && password !== "" && password !== passwordc) {
    errors.push("The two passwords have to match")
  }

  if (answer === "" || answer === undefined || answer === null) {
    errors.push("You have to answer the question");
  } else if (a + b !== parseInt(answer)) {
    errors.push("Incorrect answer")
  }
  return { isValid: errors.length === 0, errors }
}

module.exports = { validateRegister }