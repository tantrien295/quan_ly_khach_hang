const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { version } = require('../package.json');

// Import các route con
const customerRoutes = require('./customer.routes');
const serviceRoutes = require('./service.routes');
const employeeRoutes = require('./employee.routes');
const serviceHistoryRoutes = require('./serviceHistory.routes');
const authRoutes = require('./auth.routes');

// API documentation route
router.get('/docs', (req, res) => {
  res.json({
    name: 'Customer Management API',
    version,
    description: 'API cho hệ thống quản lý khách hàng và dịch vụ',
    endpoints: {
      customers: '/api/customers',
      services: '/api/services',
      employees: '/api/employees',
      serviceHistories: '/api/service-histories',
      auth: '/api/auth'
    },
    documentation: 'https://documenter.getpostman.com/view/...', // Thêm link API docs thực tế
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    database: 'Connected',
    environment: process.env.NODE_ENV || 'development',
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    healthcheck.database = 'Disconnected';
    res.status(503).json(healthcheck);
  }
});

// Định nghĩa các route
router.use('/customers', customerRoutes);
router.use('/services', serviceRoutes);
router.use('/employees', employeeRoutes);
router.use('/service-histories', serviceHistoryRoutes);
router.use('/auth', authRoutes);

module.exports = router;
