const { Employee } = require('../models');
const { validationResult } = require('express-validator');

// Lấy danh sách nhân viên
exports.getAllEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', is_active } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const { count, rows } = await Employee.findAndCountAll({
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
    console.error('Error getting employees:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhân viên',
    });
  }
};

// Tạo mới nhân viên
exports.createEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { full_name, phone, email, address, position, notes, is_active = true } = req.body;
    
    const employee = await Employee.create({
      full_name,
      phone,
      email: email || null,
      address: address || null,
      position: position || null,
      notes: notes || null,
      is_active,
    });

    res.status(201).json({
      success: true,
      data: employee,
      message: 'Tạo nhân viên thành công',
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo nhân viên',
    });
  }
};

// Cập nhật thông tin nhân viên
exports.updateEmployee = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { id } = req.params;
    const { full_name, phone, email, address, position, notes, is_active } = req.body;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên',
      });
    }

    const updateData = { 
      full_name,
      phone,
      email: email || null,
      address: address || null,
      position: position || null,
      notes: notes || null,
    };
    
    if (is_active !== undefined) updateData.is_active = is_active;

    await employee.update(updateData);

    res.json({
      success: true,
      data: employee,
      message: 'Cập nhật thông tin nhân viên thành công',
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin nhân viên',
    });
  }
};

// Xóa nhân viên
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên',
      });
    }

    // Kiểm tra xem nhân viên có đang phụ trách dịch vụ nào không
    const serviceHistories = await employee.countServiceHistories();
    if (serviceHistories > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa nhân viên đã từng phụ trách dịch vụ',
      });
    }

    await employee.destroy();

    res.json({
      success: true,
      message: 'Xóa nhân viên thành công',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa nhân viên',
    });
  }
};

// Lấy thông tin chi tiết nhân viên
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên',
      });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error('Error getting employee by id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin nhân viên',
    });
  }
};
