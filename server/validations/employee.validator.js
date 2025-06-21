const { body } = require('express-validator');
const { Op } = require('sequelize');
const { Employee } = require('../models');

// Validate số điện thoại
const validatePhone = (value) => {
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Số điện thoại không hợp lệ');
  }
  return true;
};

// Validate email
const validateEmail = (value) => {
  if (!value) return true; // Không bắt buộc
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error('Email không hợp lệ');
  }
  return true;
};

// Middleware validate tạo mới nhân viên
exports.createEmployeeValidation = [
  // Validate họ và tên
  body('full_name')
    .trim()
    .notEmpty().withMessage('Họ và tên không được để trống')
    .isLength({ max: 255 }).withMessage('Họ và tên không được vượt quá 255 ký tự'),
    
  // Validate số điện thoại
  body('phone')
    .trim()
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .custom(validatePhone)
    .custom(async (value) => {
      // Kiểm tra số điện thoại đã tồn tại chưa
      const employee = await Employee.findOne({ where: { phone: value } });
      if (employee) {
        throw new Error('Số điện thoại đã được sử dụng');
      }
      return true;
    }),
    
  // Validate email
  body('email')
    .optional({ nullable: true })
    .trim()
    .toLowerCase()
    .custom(validateEmail)
    .custom(async (value) => {
      if (!value) return true;
      
      // Kiểm tra email đã tồn tại chưa
      const employee = await Employee.findOne({ where: { email: value } });
      if (employee) {
        throw new Error('Email đã được sử dụng');
      }
      return true;
    })
    .isLength({ max: 255 }).withMessage('Email không được vượt quá 255 ký tự'),
    
  // Validate địa chỉ
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Địa chỉ không được vượt quá 1000 ký tự'),
    
  // Validate vị trí
  body('position')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Vị trí không được vượt quá 255 ký tự'),
    
  // Validate ghi chú
  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Ghi chú không được vượt quá 2000 ký tự'),
    
  // Validate trạng thái
  body('is_active')
    .optional({ nullable: true })
    .isBoolean().withMessage('Trạng thái phải là true hoặc false')
    .toBoolean(),
];

// Middleware validate cập nhật thông tin nhân viên
exports.updateEmployeeValidation = [
  // Validate họ và tên
  body('full_name')
    .optional()
    .trim()
    .notEmpty().withMessage('Họ và tên không được để trống')
    .isLength({ max: 255 }).withMessage('Họ và tên không được vượt quá 255 ký tự'),
    
  // Validate số điện thoại
  body('phone')
    .optional()
    .trim()
    .notEmpty().withMessage('Số điện thoại không được để trống')
    .custom(validatePhone)
    .custom(async (value, { req }) => {
      // Kiểm tra số điện thoại đã tồn tại chưa (trừ chính nó)
      const employee = await Employee.findOne({ 
        where: { 
          phone: value,
          id: { [Op.ne]: req.params.id } // Không tính bản ghi hiện tại
        } 
      });
      if (employee) {
        throw new Error('Số điện thoại đã được sử dụng');
      }
      return true;
    }),
    
  // Validate email
  body('email')
    .optional({ nullable: true })
    .trim()
    .toLowerCase()
    .custom(validateEmail)
    .custom(async (value, { req }) => {
      if (!value) return true;
      
      // Kiểm tra email đã tồn tại chưa (trừ chính nó)
      const employee = await Employee.findOne({ 
        where: { 
          email: value,
          id: { [Op.ne]: req.params.id } // Không tính bản ghi hiện tại
        } 
      });
      if (employee) {
        throw new Error('Email đã được sử dụng');
      }
      return true;
    })
    .isLength({ max: 255 }).withMessage('Email không được vượt quá 255 ký tự'),
    
  // Validate địa chỉ
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Địa chỉ không được vượt quá 1000 ký tự'),
    
  // Validate vị trí
  body('position')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Vị trí không được vượt quá 255 ký tự'),
    
  // Validate ghi chú
  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Ghi chú không được vượt quá 2000 ký tự'),
    
  // Validate trạng thái
  body('is_active')
    .optional({ nullable: true })
    .isBoolean().withMessage('Trạng thái phải là true hoặc false')
    .toBoolean(),
];
