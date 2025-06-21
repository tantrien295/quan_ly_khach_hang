const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginValidation, registerValidation, refreshTokenValidation } = require('../validations/auth.validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// Đăng ký tài khoản mới
router.post('/register', registerValidation, validate, authController.register);

// Đăng nhập
router.post('/login', loginValidation, validate, authController.login);

// Làm mới token
router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken);

// Đăng xuất
router.post('/logout', authenticate, authController.logout);

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticate, authController.getCurrentUser);

// Đổi mật khẩu
router.post('/change-password', authenticate, authController.changePassword);

// Quên mật khẩu - Gửi email đặt lại mật khẩu
router.post('/forgot-password', authController.forgotPassword);

// Đặt lại mật khẩu với token
router.post('/reset-password', authController.resetPassword);

module.exports = router;
