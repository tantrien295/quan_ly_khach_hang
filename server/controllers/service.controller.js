const { Service } = require('../models');
const { validationResult } = require('express-validator');

// Lấy danh sách dịch vụ
exports.getAllServices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', is_active } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const { count, rows } = await Service.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách dịch vụ',
    });
  }
};

// Tạo mới dịch vụ
exports.createService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { name, description, price, is_active = true } = req.body;
    
    const service = await Service.create({
      name,
      description: description || null,
      price: parseFloat(price) || 0,
      is_active,
    });

    res.status(201).json({
      success: true,
      data: service,
      message: 'Tạo dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo dịch vụ',
    });
  }
};

// Cập nhật thông tin dịch vụ
exports.updateService = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { id } = req.params;
    const { name, description, price, is_active } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ',
      });
    }

    const updateData = { name };
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (is_active !== undefined) updateData.is_active = is_active;

    await service.update(updateData);

    res.json({
      success: true,
      data: service,
      message: 'Cập nhật thông tin dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin dịch vụ',
    });
  }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ',
      });
    }

    // Kiểm tra xem dịch vụ có đang được sử dụng không
    const serviceHistories = await service.countServiceHistories();
    if (serviceHistories > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa dịch vụ đã được sử dụng',
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: 'Xóa dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa dịch vụ',
    });
  }
};

// Lấy thông tin chi tiết dịch vụ
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ',
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Error getting service by id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin dịch vụ',
    });
  }
};
