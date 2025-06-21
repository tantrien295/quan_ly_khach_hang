const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { createCustomerValidation, updateCustomerValidation } = require('../validations/customer.validator');
const { validate } = require('../middlewares/validate.middleware');

// Lấy danh sách khách hàng
router.get('/', customerController.getAllCustomers);

// Tạo mới khách hàng
router.post('/', createCustomerValidation, validate, customerController.createCustomer);

// Lấy thông tin chi tiết khách hàng
router.get('/:id', customerController.getCustomerById);

// Cập nhật thông tin khách hàng
router.put('/:id', updateCustomerValidation, validate, customerController.updateCustomer);

// Xóa khách hàng
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
