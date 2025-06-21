const { body, param } = require('express-validator');

// Quy tắc validate cho đăng ký tài khoản
exports.registerValidation = [
  // Validate username
  body('username')
    .trim()
    .notEmpty().withMessage('Tên đăng nhập là bắt buộc')
    .isLength({ min: 3, max: 30 }).withMessage('Tên đăng nhập phải từ 3 đến 30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  // Validate email
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  // Validate password
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/[0-9]/).withMessage('Mật khẩu phải chứa ít nhất 1 số')
    .matches(/[a-z]/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa'),
  
  // Validate confirm password
  body('confirmPassword')
    .notEmpty().withMessage('Xác nhận mật khẩu là bắt buộc')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),
  
  // Validate full name
  body('fullName')
    .trim()
    .notEmpty().withMessage('Họ và tên là bắt buộc')
    .isLength({ min: 2, max: 100 }).withMessage('Họ và tên phải từ 2 đến 100 ký tự'),
  
  // Validate phone
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{10,15}$/).withMessage('Số điện thoại không hợp lệ')
];

// Quy tắc validate cho đăng nhập
exports.loginValidation = [
  // Validate email
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  // Validate password
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
];

// Quy tắc validate cho refresh token
exports.refreshTokenValidation = [
  // Validate refresh token
  body('refreshToken')
    .notEmpty().withMessage('Refresh token là bắt buộc')
];

// Quy tắc validate cho đổi mật khẩu
exports.changePasswordValidation = [
  // Validate current password
  body('currentPassword')
    .notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),
  
  // Validate new password
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/[0-9]/).withMessage('Mật khẩu mới phải chứa ít nhất 1 số')
    .matches(/[a-z]/).withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ thường')
    .matches(/[A-Z]/).withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ hoa')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      }
      return true;
    }),
  
  // Validate confirm new password
  body('confirmNewPassword')
    .notEmpty().withMessage('Xác nhận mật khẩu mới là bắt buộc')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    })
];

// Quy tắc validate cho quên mật khẩu
exports.forgotPasswordValidation = [
  // Validate email
  body('email')
    .trim()
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail()
];

// Quy tắc validate cho đặt lại mật khẩu
exports.resetPasswordValidation = [
  // Validate token
  body('token')
    .notEmpty().withMessage('Token đặt lại mật khẩu là bắt buộc'),
  
  // Validate new password
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/[0-9]/).withMessage('Mật khẩu mới phải chứa ít nhất 1 số')
    .matches(/[a-z]/).withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ thường')
    .matches(/[A-Z]/).withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ hoa'),
  
  // Validate confirm new password
  body('confirmNewPassword')
    .notEmpty().withMessage('Xác nhận mật khẩu mới là bắt buộc')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    })
];

// Quy tắc validate cho xác minh email
exports.verifyEmailValidation = [
  // Validate token
  param('token')
    .notEmpty().withMessage('Token xác minh email là bắt buộc')
];
