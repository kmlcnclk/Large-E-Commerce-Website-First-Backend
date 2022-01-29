const bcrypt = require("bcryptjs");

// Checking email and password
const validateUserInput = (email, password) => {
  return email && password;
};

// Compare password and hashPassword
const comparePassword = (password, hashPassword) => {
  return bcrypt.compareSync(password, hashPassword);
};

module.exports = { validateUserInput, comparePassword };
