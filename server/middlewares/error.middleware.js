/**
 * Middleware xử lý lỗi toàn cục
 * @param {Error} err - Đối tượng lỗi
 * @param {Object} req - Đối tượng request
 * @param {Object} res - Đối tượng response
 * @param {Function} next - Hàm next
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Xử lý lỗi từ JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
    });
  }
  
  // Xử lý lỗi hết hạn token
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn',
    });
  }
  
  // Xử lý lỗi từ Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Lỗi xác thực dữ liệu',
      errors,
    });
  }
  
  // Xử lý lỗi tải lên file
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Kích thước file quá lớn. Vui lòng tải lên file nhỏ hơn 5MB',
    });
  }
  
  // Xử lý lỗi không tìm thấy tài nguyên
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Không tìm thấy tài nguyên',
    });
  }
  
  // Xử lý lỗi xác thực
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Không có quyền truy cập',
    });
  }
  
  // Xử lý lỗi từ Joi validation
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Lỗi xác thực dữ liệu',
      errors: err.details.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  
  // Xử lý các lỗi khác
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi không xác định',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware xử lý route không tồn tại
 * @param {Object} req - Đối tượng request
 * @param {Object} res - Đối tượng response
 * @param {Function} next - Hàm next
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Không tìm thấy ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
