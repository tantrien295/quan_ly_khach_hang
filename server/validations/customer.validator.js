const { body } = require('express-validator');
const { Op } = require('sequelize');
const { Customer } = require('../models');

// Validate số điện thoại
const validatePhone = (value) => {
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
  if (!phoneRegex.test(value)) {
    throw new Error('Số điện thoại không hợp lệ');
  }
  return true;
};

// Validate ngày sinh
const validateBirthDate = (value, { req }) => {
  if (!value) return true; // Không bắt buộc
  
  const { birth_day, birth_month, birth_year } = req.body;
  if ((birth_day || birth_month || birth_year) && !(birth_day && birth_month && birth_year)) {
    throw new Error('Vui lòng điền đầy đủ ngày, tháng, năm sinh');
  }
  
  if (birth_day && birth_month && birth_year) {
    const day = parseInt(birth_day, 10);
    const month = parseInt(birth_month, 10) - 1; // Tháng trong JavaScript bắt đầu từ 0
    const year = parseInt(birth_year, 10);
    
    // Kiểm tra ngày tháng năm hợp lệ
    const date = new Date(year, month, day);
    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
      throw new Error('Ngày tháng năm sinh không hợp lệ');
    }
    
    // Kiểm tra năm sinh không lớn hơn năm hiện tại
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
      throw new Error('Năm sinh không được lớn hơn năm hiện tại');
    }
  }
  
  return true;
};

// Middleware validate tạo mới khách hàng
exports.createCustomerValidation = [
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
    .custom(async (value, { req }) => {
      // Kiểm tra số điện thoại đã tồn tại chưa
      const customer = await Customer.findOne({ where: { phone: value } });
      if (customer) {
        throw new Error('Số điện thoại đã được sử dụng');
      }
      return true;
    }),
    
  // Validate ngày sinh
  body().custom(validateBirthDate),
  
  // Validate địa chỉ
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Địa chỉ không được vượt quá 1000 ký tự'),
    
  // Validate ghi chú
  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Ghi chú không được vượt quá 2000 ký tự'),
];

// Middleware validate cập nhật thông tin khách hàng
exports.updateCustomerValidation = [
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
      const customer = await Customer.findOne({ 
        where: { 
          phone: value,
          id: { [Op.ne]: req.params.id } // Không tính bản ghi hiện tại
        } 
      });
      if (customer) {
        throw new Error('Số điện thoại đã được sử dụng');
      }
      return true;
    }),
    
  // Validate ngày sinh
  body().custom(validateBirthDate),
  
  // Validate địa chỉ
  body('address')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Địa chỉ không được vượt quá 1000 ký tự'),
    
  // Validate ghi chú
  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Ghi chú không được vượt quá 2000 ký tự'),
];
