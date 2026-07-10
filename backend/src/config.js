const path = require('path');

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'ganti_dengan_secret_yang_aman',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'app.db')
};
