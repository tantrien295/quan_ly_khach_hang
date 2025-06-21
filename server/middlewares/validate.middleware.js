const { validationResult } = require('express-validator');

// Middleware xử lý kết quả validate
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  // Nếu có lỗi validate, trả về lỗi 400 với danh sách lỗi
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        param: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  // Nếu không có lỗi, chuyển sang middleware tiếp theo
  next();
};
