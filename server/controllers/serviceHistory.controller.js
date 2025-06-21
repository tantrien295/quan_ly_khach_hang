const { ServiceHistory, Customer, Service, Employee } = require('../models');
const { validationResult } = require('express-validator');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Lấy danh sách lịch sử dịch vụ
exports.getAllServiceHistories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      customer_id, 
      service_id, 
      employee_id,
      start_date,
      end_date,
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    if (customer_id) whereClause.customer_id = customer_id;
    if (service_id) whereClause.service_id = service_id;
    if (employee_id) whereClause.employee_id = employee_id;
    
    if (start_date || end_date) {
      whereClause.service_date = {};
      if (start_date) whereClause.service_date[Op.gte] = new Date(start_date);
      if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        whereClause.service_date[Op.lte] = endDate;
      }
    }

    const { count, rows } = await ServiceHistory.findAndCountAll({
      where: whereClause,
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Employee, attributes: ['id', 'full_name'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['service_date', 'DESC'], ['created_at', 'DESC']],
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
    console.error('Error getting service histories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch sử dịch vụ',
    });
  }
};

// Tạo mới lịch sử dịch vụ
exports.createServiceHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const {
      customer_id,
      service_id,
      employee_id,
      service_date,
      price,
      payment_method,
      notes,
    } = req.body;

    // Kiểm tra sự tồn tại của các khóa ngoại
    const [customer, service, employee] = await Promise.all([
      Customer.findByPk(customer_id),
      Service.findByPk(service_id),
      Employee.findByPk(employee_id),
    ]);

    if (!customer || !service || !employee) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng, dịch vụ hoặc nhân viên',
      });
    }

    // Xử lý tải lên hình ảnh nếu có
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.path, 'service_histories')
        );
        imageUrls = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi tải lên hình ảnh',
        });
      }
    }

    const serviceHistory = await ServiceHistory.create({
      customer_id,
      service_id,
      employee_id,
      service_date: service_date || new Date(),
      price: parseFloat(price) || 0,
      payment_method: payment_method || 'Tiền mặt',
      notes: notes || null,
      images: imageUrls,
    });

    // Lấy lại thông tin đầy đủ để trả về
    const result = await ServiceHistory.findByPk(serviceHistory.id, {
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Employee, attributes: ['id', 'full_name'] },
      ],
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Tạo lịch sử dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error creating service history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lịch sử dịch vụ',
    });
  }
};

// Cập nhật thông tin lịch sử dịch vụ
exports.updateServiceHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { id } = req.params;
    const {
      customer_id,
      service_id,
      employee_id,
      service_date,
      price,
      payment_method,
      notes,
    } = req.body;

    const serviceHistory = await ServiceHistory.findByPk(id);
    if (!serviceHistory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử dịch vụ',
      });
    }

    // Kiểm tra sự tồn tại của các khóa ngoại nếu có thay đổi
    if (customer_id || service_id || employee_id) {
      const [customer, service, employee] = await Promise.all([
        customer_id ? Customer.findByPk(customer_id) : Promise.resolve(null),
        service_id ? Service.findByPk(service_id) : Promise.resolve(null),
        employee_id ? Employee.findByPk(employee_id) : Promise.resolve(null),
      ]);

      if ((customer_id && !customer) || 
          (service_id && !service) || 
          (employee_id && !employee)) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin khách hàng, dịch vụ hoặc nhân viên',
        });
      }
    }

    // Xử lý tải lên hình ảnh mới nếu có
    let imageUrls = serviceHistory.images || [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.path, 'service_histories')
        );
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      } catch (uploadError) {
        console.error('Error uploading images:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi tải lên hình ảnh',
        });
      }
    }

    // Xử lý xóa ảnh nếu có
    if (req.body.removed_images) {
      const removedImages = Array.isArray(req.body.removed_images) 
        ? req.body.removed_images 
        : [req.body.removed_images];
      
      imageUrls = imageUrls.filter(img => !removed_images.includes(img));
    }

    const updateData = {};
    if (customer_id) updateData.customer_id = customer_id;
    if (service_id) updateData.service_id = service_id;
    if (employee_id) updateData.employee_id = employee_id;
    if (service_date) updateData.service_date = service_date;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (payment_method) updateData.payment_method = payment_method;
    if (notes !== undefined) updateData.notes = notes;
    updateData.images = imageUrls;

    await serviceHistory.update(updateData);

    // Lấy lại thông tin đầy đủ để trả về
    const result = await ServiceHistory.findByPk(id, {
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Employee, attributes: ['id', 'full_name'] },
      ],
    });

    res.json({
      success: true,
      data: result,
      message: 'Cập nhật lịch sử dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error updating service history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch sử dịch vụ',
    });
  }
};

// Xóa lịch sử dịch vụ
exports.deleteServiceHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceHistory = await ServiceHistory.findByPk(id);
    if (!serviceHistory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử dịch vụ',
      });
    }

    await serviceHistory.destroy();

    res.json({
      success: true,
      message: 'Xóa lịch sử dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error deleting service history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch sử dịch vụ',
    });
  }
};

// Lấy thông tin chi tiết lịch sử dịch vụ
exports.getServiceHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceHistory = await ServiceHistory.findByPk(id, {
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Employee, attributes: ['id', 'full_name'] },
      ],
    });

    if (!serviceHistory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử dịch vụ',
      });
    }

    res.json({
      success: true,
      data: serviceHistory,
    });
  } catch (error) {
    console.error('Error getting service history by id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lịch sử dịch vụ',
    });
  }
};
