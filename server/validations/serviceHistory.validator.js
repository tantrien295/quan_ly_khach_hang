const { body, param } = require('express-validator');
const { ServiceHistory, Customer, Service, Employee } = require('../models');

// Validate ngày dịch vụ
const validateServiceDate = (value) => {
  if (!value) return true; // Sử dụng ngày hiện tại nếu không có giá trị
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error('Ngày dịch vụ không hợp lệ');
  }
  
  // Kiểm tra ngày không được lớn hơn ngày hiện tại
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date > today) {
    throw new Error('Ngày dịch vụ không được lớn hơn ngày hiện tại');
  }
  
  return true;
};

// Validate hình ảnh
const validateImages = (value) => {
  if (!value || value.length === 0) return true; // Không bắt buộc
  
  if (!Array.isArray(value)) {
    throw new Error('Hình ảnh phải là một mảng');
  }
  
  // Kiểm tra mỗi phần tử trong mảng là URL hợp lệ
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  for (const img of value) {
    if (typeof img !== 'string' || !urlRegex.test(img)) {
      throw new Error('Một hoặc nhiều URL hình ảnh không hợp lệ');
    }
  }
  
  // Giới hạn số lượng ảnh tối đa
  if (value.length > 10) {
    throw new Error('Không được tải lên quá 10 ảnh');
  }
  
  return true;
};

// Middleware validate tạo mới lịch sử dịch vụ
exports.createServiceHistoryValidation = [
  // Validate customer_id
  body('customer_id')
    .notEmpty().withMessage('Vui lòng chọn khách hàng')
    .isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ')
    .toInt()
    .custom(async (value) => {
      const customer = await Customer.findByPk(value);
      if (!customer) {
        throw new Error('Không tìm thấy khách hàng');
      }
      return true;
    }),
    
  // Validate service_id
  body('service_id')
    .notEmpty().withMessage('Vui lòng chọn dịch vụ')
    .isInt({ min: 1 }).withMessage('ID dịch vụ không hợp lệ')
    .toInt()
    .custom(async (value) => {
      const service = await Service.findByPk(value);
      if (!service) {
        throw new Error('Không tìm thấy dịch vụ');
      }
      return true;
    }),
    
  // Validate employee_id
  body('employee_id')
    .notEmpty().withMessage('Vui lòng chọn nhân viên phụ trách')
    .isInt({ min: 1 }).withMessage('ID nhân viên không hợp lệ')
    .toInt()
    .custom(async (value) => {
      const employee = await Employee.findByPk(value);
      if (!employee) {
        throw new Error('Không tìm thấy nhân viên');
      }
      return true;
    }),
    
  // Validate service_date
  body('service_date')
    .optional()
    .custom(validateServiceDate),
    
  // Validate price
  body('price')
    .notEmpty().withMessage('Vui lòng nhập giá dịch vụ')
    .isFloat({ min: 0 }).withMessage('Giá dịch vụ phải là số dương')
    .toFloat(),
    
  // Validate payment_method
  body('payment_method')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Phương thức thanh toán không được vượt quá 100 ký tự'),
    
  // Validate notes
  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Ghi chú không được vượt quá 2000 ký tự'),
    
  // Validate images
  body('images')
    .optional({ nullable: true })
    .custom(validateImages),
];

// Middleware validate cập nhật lịch sử dịch vụ
exports.updateServiceHistoryValidation = [
  // Validate customer_id
  body('customer_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID khách hàng không hợp lệ')
    .toInt()
    .custom(async (value) => {
      const customer = await Customer.findByPk(value);
      if (!customer) {
        throw new Error('Không tìm thấy khách hàng');
      }
      return true;
    }),
    
  // Validate service_id
  body('service_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID dịch vụ không hợp lệ')
    .toInt()
    .custom(async (value) => {
      const service = await Service.findByPk(value);
      if (!service) {
        throw new Error('Không tìm thấy dịch vụ');
      }
      return true;
    }),
    
  // Validate employee_id
  body('employee_id')
    .optional()
    .isInt({ min: 1 }).withMessage('ID nhân viên không hợp lệ')
    .toInt()
    .custom(async (value) => {
      const employee = await Employee.findByPk(value);
      if (!employee) {
        throw new Error('Không tìm thấy nhân viên');
      }
      return true;
    }),
    
  // Validate service_date
  body('service_date')
    .optional()
    .custom(validateServiceDate),
    
  // Validate price
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Giá dịch vụ phải là số dương')
    .toFloat(),
    
  // Validate payment_method
  body('payment_method')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Phương thức thanh toán không được vượt quá 100 ký tự'),
    
  // Validate notes
  body('notes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage('Ghi chú không được vượt quá 2000 ký tự'),
    
  // Validate images
  body('images')
    .optional({ nullable: true })
    .custom(validateImages),
    
  // Validate removed_images
  body('removed_images')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value) return true;
      
      if (!Array.isArray(value)) {
        throw new Error('Danh sách ảnh cần xóa phải là một mảng');
      }
      
      // Kiểm tra mỗi phần tử trong mảng là URL hợp lệ
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      for (const img of value) {
        if (typeof img !== 'string' || !urlRegex.test(img)) {
          throw new Error('Một hoặc nhiều URL hình ảnh cần xóa không hợp lệ');
        }
      }
      
      return true;
    }),
];

// Middleware validate ID lịch sử dịch vụ
exports.validateServiceHistoryId = [
  param('id')
    .notEmpty().withMessage('ID lịch sử dịch vụ không được để trống')
    .isInt({ min: 1 }).withMessage('ID lịch sử dịch vụ không hợp lệ')
    .toInt()
    .custom(async (value) => {
      const serviceHistory = await ServiceHistory.findByPk(value);
      if (!serviceHistory) {
        throw new Error('Không tìm thấy lịch sử dịch vụ');
      }
      return true;
    }),
];
