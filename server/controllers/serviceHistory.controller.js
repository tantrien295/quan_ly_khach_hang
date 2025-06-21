const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { ServiceHistory, Customer, Service, Employee } = require('../models');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Lấy danh sách lịch sử dịch vụ
exports.getAllServiceHistories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customerId,
      serviceId,
      employeeId,
      startDate,
      endDate,
    } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    const whereClause = {};
    
    if (customerId) whereClause.customer_id = customerId;
    if (serviceId) whereClause.service_id = serviceId;
    if (employeeId) whereClause.employee_id = employeeId;
    
    if (startDate || endDate) {
      whereClause.service_date = {};
      if (startDate) whereClause.service_date[Op.gte] = new Date(startDate);
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        whereClause.service_date[Op.lte] = endDateObj;
      }
    }

    const { count, rows } = await ServiceHistory.findAndCountAll({
      where: whereClause,
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Employee, attributes: ['id', 'full_name'] },
      ],
      limit: limitNum,
      offset,
      order: [
        ['service_date', 'DESC'],
        ['created_at', 'DESC'],
      ],
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Error getting service histories:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách lịch sử dịch vụ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Tạo mới lịch sử dịch vụ
exports.createServiceHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  let attachment = null;
  
  try {
    const {
      customerId,
      serviceId,
      employeeId,
      serviceDate,
      price,
      paymentMethod,
      notes,
    } = req.body;
    
    // Handle file upload if exists
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        attachment = {
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          resource_type: result.resource_type,
        };
      } catch (uploadError) {
        console.error('Error uploading file to Cloudinary:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Lỗi khi tải lên tệp đính kèm',
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined,
        });
      }
    }

    // Kiểm tra sự tồn tại của các khóa ngoại
    const [customer, service, employee] = await Promise.all([
      Customer.findByPk(customerId),
      Service.findByPk(serviceId),
      Employee.findByPk(employeeId),
    ]);

    if (!customer || !service || !employee) {
      // If we uploaded a file but validation failed, clean it up
      if (attachment && attachment.public_id) {
        try {
          await deleteFromCloudinary(attachment.public_id);
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded file:', cleanupError);
        }
      }
      
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng, dịch vụ hoặc nhân viên',
      });
    }

    // Tạo mới lịch sử dịch vụ
    const serviceHistory = await ServiceHistory.create({
      customer_id: customerId,
      service_id: serviceId,
      employee_id: employeeId,
      service_date: serviceDate || new Date(),
      price: price ? parseFloat(price) : service.price, // Sử dụng giá từ dịch vụ nếu không nhập
      payment_method: paymentMethod || 'Tiền mặt',
      notes: notes || null,
      attachment_url: attachment ? attachment.url : null,
      attachment_public_id: attachment ? attachment.public_id : null,
      attachment_format: attachment ? attachment.format : null,
      attachment_type: attachment ? attachment.resource_type : null,
    });

    // Lấy lại thông tin đầy đủ để trả về
    const result = await ServiceHistory.findByPk(serviceHistory.id, {
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Employee, attributes: ['id', 'full_name'] },
      ],
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Tạo lịch sử dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error creating service history:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo lịch sử dịch vụ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Cập nhật thông tin lịch sử dịch vụ
exports.updateServiceHistory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const {
      customerId,
      serviceId,
      employeeId,
      serviceDate,
      price,
      paymentMethod,
      notes,
    } = req.body;

    const serviceHistory = await ServiceHistory.findByPk(id);
    if (!serviceHistory) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch sử dịch vụ',
      });
    }

    // Kiểm tra sự tồn tại của các khóa ngoại nếu được cập nhật
    const [customer, service, employee] = await Promise.all([
      customerId ? Customer.findByPk(customerId) : Promise.resolve(null),
      serviceId ? Service.findByPk(serviceId) : Promise.resolve(null),
      employeeId ? Employee.findByPk(employeeId) : Promise.resolve(null),
    ]);

    if ((customerId && !customer) || (serviceId && !service) || (employeeId && !employee)) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng, dịch vụ hoặc nhân viên',
      });
    }

    // Cập nhật thông tin
    const updatedData = {};
    if (customerId) updatedData.customer_id = customerId;
    if (serviceId) updatedData.service_id = serviceId;
    if (employeeId) updatedData.employee_id = employeeId;
    if (serviceDate) updatedData.service_date = serviceDate;
    if (price) updatedData.price = parseFloat(price);
    if (paymentMethod) updatedData.payment_method = paymentMethod;
    if (notes !== undefined) updatedData.notes = notes;

    await serviceHistory.update(updatedData);

    // Lấy lại thông tin đầy đủ để trả về
    const result = await ServiceHistory.findByPk(id, {
      include: [
        { model: Customer, attributes: ['id', 'full_name', 'phone'] },
        { model: Service, attributes: ['id', 'name', 'price'] },
        { model: Employee, attributes: ['id', 'full_name'] },
      ],
    });

    return res.json({
      success: true,
      data: result,
      message: 'Cập nhật lịch sử dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error updating service history:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật lịch sử dịch vụ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

    // Xóa tệp đính kèm nếu có
    if (serviceHistory.attachment_public_id) {
      try {
        await deleteFromCloudinary(serviceHistory.attachment_public_id);
      } catch (cleanupError) {
        console.error('Error deleting attachment from Cloudinary:', cleanupError);
      }
    }

    await serviceHistory.destroy();

    return res.json({
      success: true,
      message: 'Xóa lịch sử dịch vụ thành công',
    });
  } catch (error) {
    console.error('Error deleting service history:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa lịch sử dịch vụ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

    return res.json({
      success: true,
      data: serviceHistory,
    });
  } catch (error) {
    console.error('Error getting service history by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin lịch sử dịch vụ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
