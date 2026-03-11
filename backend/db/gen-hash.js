const bcrypt = require("bcryptjs");

const password = process.argv[2] || "Password123!";
const rounds = parseInt(process.argv[3] || "10", 10);

console.log(bcrypt.hashSync(password, rounds));

