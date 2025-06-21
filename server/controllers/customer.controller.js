const { Customer } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
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
    console.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng',
    });
  }
};

// Tạo mới khách hàng
exports.createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { full_name, phone, birth_date, address, notes } = req.body;

    const customer = await Customer.create({
      full_name,
      phone,
      birth_date: birth_date || null,
      address: address || null,
      notes: notes || null,
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Tạo khách hàng thành công',
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo khách hàng',
    });
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const { full_name, phone, birth_date, address, notes } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    await customer.update({
      full_name,
      phone,
      birth_date: birth_date || null,
      address: address || null,
      notes: notes || null,
    });

    res.json({
      success: true,
      data: customer,
      message: 'Cập nhật thông tin khách hàng thành công',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin khách hàng',
    });
  }
};

// Xóa khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    await customer.destroy();

    res.json({
      success: true,
      message: 'Xóa khách hàng thành công',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khách hàng',
    });
  }
};

// Lấy thông tin chi tiết khách hàng
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error getting customer by id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng',
    });
  }
};
