const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { createServiceValidation, updateServiceValidation } = require('../validations/service.validator');
const { validate } = require('../middlewares/validate.middleware');

// Lấy danh sách dịch vụ
router.get('/', serviceController.getAllServices);

// Tạo mới dịch vụ
router.post('/', createServiceValidation, validate, serviceController.createService);

// Lấy thông tin chi tiết dịch vụ
router.get('/:id', serviceController.getServiceById);

// Cập nhật thông tin dịch vụ
router.put('/:id', updateServiceValidation, validate, serviceController.updateService);

// Xóa dịch vụ
router.delete('/:id', serviceController.deleteService);

module.exports = router;
