const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const serviceHistoryController = require('../controllers/serviceHistory.controller');
const { 
  createServiceHistoryValidation, 
  updateServiceHistoryValidation,
  validateServiceHistoryId 
} = require('../validations/serviceHistory.validator');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// Cấu hình multer để lưu file tạm
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'service-history-' + uniqueSuffix + ext);
  },
});

// Lọc file ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png)'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Lỗi từ multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Kích thước file quá lớn. Tối đa 5MB',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  } else if (err) {
    // Lỗi khác
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
};

// Lấy danh sách lịch sử dịch vụ
router.get('/', serviceHistoryController.getAllServiceHistories);

// Tạo mới lịch sử dịch vụ
router.post(
  '/',
  authenticate, // Yêu cầu xác thực
  upload.array('images', 10), // Tối đa 10 ảnh
  handleUploadError, // Xử lý lỗi upload
  createServiceHistoryValidation,
  validate,
  serviceHistoryController.createServiceHistory
);

// Lấy thông tin chi tiết lịch sử dịch vụ
router.get(
  '/:id',
  validateServiceHistoryId,
  validate,
  serviceHistoryController.getServiceHistoryById
);

// Cập nhật thông tin lịch sử dịch vụ
router.put(
  '/:id',
  authenticate, // Yêu cầu xác thực
  upload.array('images', 10), // Tối đa 10 ảnh
  handleUploadError, // Xử lý lỗi upload
  validateServiceHistoryId,
  updateServiceHistoryValidation,
  validate,
  serviceHistoryController.updateServiceHistory
);

// Xóa lịch sử dịch vụ
router.delete(
  '/:id',
  authenticate, // Yêu cầu xác thực
  validateServiceHistoryId,
  validate,
  serviceHistoryController.deleteServiceHistory
);

module.exports = router;
