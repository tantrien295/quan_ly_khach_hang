const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// Middleware xác thực JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực',
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Tìm người dùng trong database
      const user = await User.findOne({
        where: {
          id: decoded.userId,
          is_active: true,
        },
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Người dùng không tồn tại hoặc đã bị vô hiệu hóa',
        });
      }
      
      // Lưu thông tin người dùng vào request để sử dụng trong các route
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token đã hết hạn',
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
    });
  }
};

// Middleware kiểm tra quyền truy cập (role-based access control)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng',
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này',
      });
    }
    
    next();
  };
};
