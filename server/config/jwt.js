const jwt = require('jsonwebtoken');

/**
 * Tạo token JWT
 * @param {Object} payload - Dữ liệu cần mã hóa vào token
 * @param {string} expiresIn - Thời gian hết hạn của token (vd: '1d', '7d', '30d')
 * @returns {string} - Token JWT
 */
const generateToken = (payload, expiresIn = '30d') => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Giải mã token JWT
 * @param {string} token - Token cần giải mã
 * @returns {Object} - Dữ liệu đã giải mã
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
