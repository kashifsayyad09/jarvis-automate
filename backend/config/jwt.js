require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-fallback-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtAlgorithm: 'HS256'
};
