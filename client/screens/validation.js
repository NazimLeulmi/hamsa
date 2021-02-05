import { isEmpty, isAlphanumeric, isEmail, isLength } from 'validator';

export function validateSignUp(name, email, password, passwordc) {
  let errors = [];
  // 1) Name Validation
  if (name === undefined || name === null || isEmpty(name)) {
    errors.push("The name is required to sign up");
  } else if (!isAlphanumeric(name)) {
    errors.push("The name must be alphanumeric");
  } else if (!isLength(name, { min: 5, max: 25 })) {
    errors.push("The name must be 5~25 characters");
  }
  // 2) Email Validation
  if (email === undefined || email === null || isEmpty(email)) {
    errors.push("The email is required to sign up");
  } else if (!isEmail(email)) {
    errors.push("The email is invalid");
  } else if (!isLength(email, { min: 8, max: 50 })) {
    errors.push("The email must be 8~50 characters");
  }
  // 3) Password Validation
  if (password === undefined || password === null || isEmpty(password)) {
    errors.push("The password is required to sign up");
  } else if (passwordc === undefined || isEmpty(passwordc)) {
    errors.push("The password confirmation is required");
  } else if (!isAlphanumeric(password)) {
    errors.push("The password must be alphanumeric");
  } else if (!isLength(password, { min: 8, max: 100 })) {
    errors.push("The password must be 8~100 characters");
  } else if (password !== passwordc) {
    errors.push("The password confirmation doesn't match");
  }
  return errors;
}
export function validateSignIn(email, password) {
  let errors = [];
  // 2) Email Validation
  if (email === undefined || email === null || isEmpty(email)) {
    errors.push("The email is required to sign up");
  } else if (!isEmail(email)) {
    errors.push("The email is invalid");
  } else if (!isLength(email, { min: 8, max: 50 })) {
    errors.push("The email must be 8~50 characters");
  }
  // 3) Password Validation
  if (password === undefined || password === null || isEmpty(password)) {
    errors.push("The password is required to sign up");
  } else if (!isAlphanumeric(password)) {
    errors.push("The password must be alphanumeric");
  } else if (!isLength(password, { min: 8, max: 100 })) {
    errors.push("The password must be 8~100 characters");
  }
  return errors;
}
