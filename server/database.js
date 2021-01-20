const mysql = require('mysql');

// Connect to MySQL database
module.exports = mysql.createConnection({
  host: 'localhost',
  user: 'naz',
  password: 'kerfa123',
  database: 'hamsa'
});