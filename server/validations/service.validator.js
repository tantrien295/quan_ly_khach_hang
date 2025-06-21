const { body } = require('express-validator');
const { Service } = require('../models');

// Middleware validate tạo mới dịch vụ
exports.createServiceValidation = [
  // Validate tên dịch vụ
  body('name')
    .trim()
    .notEmpty().withMessage('Tên dịch vụ không được để trống')
    .isLength({ max: 255 }).withMessage('Tên dịch vụ không được vượt quá 255 ký tự')
    .custom(async (value) => {
      // Kiểm tra tên dịch vụ đã tồn tại chưa
      const service = await Service.findOne({ 
        where: { 
          name: value,
        } 
      });
      if (service) {
        throw new Error('Tên dịch vụ đã tồn tại');
      }
      return true;
    }),
    
  // Validate mô tả
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả không được vượt quá 2000 ký tự'),
    
  // Validate giá
  body('price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Giá dịch vụ phải là số dương')
    .toFloat(),
    
  // Validate trạng thái
  body('is_active')
    .optional({ nullable: true })
    .isBoolean().withMessage('Trạng thái phải là true hoặc false')
    .toBoolean(),
];

// Middleware validate cập nhật thông tin dịch vụ
exports.updateServiceValidation = [
  // Validate tên dịch vụ
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên dịch vụ không được để trống')
    .isLength({ max: 255 }).withMessage('Tên dịch vụ không được vượt quá 255 ký tự')
    .custom(async (value, { req }) => {
      // Kiểm tra tên dịch vụ đã tồn tại chưa (trừ chính nó)
      const service = await Service.findOne({ 
        where: { 
          name: value,
          id: { [Symbol.for('ne')]: req.params.id } // Không tính bản ghi hiện tại
        } 
      });
      if (service) {
        throw new Error('Tên dịch vụ đã tồn tại');
      }
      return true;
    }),
    
  // Validate mô tả
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Mô tả không được vượt quá 2000 ký tự'),
    
  // Validate giá
  body('price')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Giá dịch vụ phải là số dương')
    .toFloat(),
    
  // Validate trạng thái
  body('is_active')
    .optional({ nullable: true })
    .isBoolean().withMessage('Trạng thái phải là true hoặc false')
    .toBoolean(),
];
