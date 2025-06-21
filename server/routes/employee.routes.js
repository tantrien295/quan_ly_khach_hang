const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { createEmployeeValidation, updateEmployeeValidation } = require('../validations/employee.validator');
const { validate } = require('../middlewares/validate.middleware');

// Lấy danh sách nhân viên
router.get('/', employeeController.getAllEmployees);

// Tạo mới nhân viên
router.post('/', createEmployeeValidation, validate, employeeController.createEmployee);

// Lấy thông tin chi tiết nhân viên
router.get('/:id', employeeController.getEmployeeById);

// Cập nhật thông tin nhân viên
router.put('/:id', updateEmployeeValidation, validate, employeeController.updateEmployee);

// Xóa nhân viên
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
