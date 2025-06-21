require('dotenv').config();

const config = {
  // Cài đặt ứng dụng
  app: {
    name: process.env.APP_NAME || 'Customer Management API',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
    apiPrefix: '/api',
  },

  // Cài đặt cơ sở dữ liệu
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'customer_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+07:00', // Múi giờ Việt Nam
  },

  // Cài đặt JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m', // 15 phút
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // 7 ngày
    resetPasswordExpiresIn: '1h', // 1 giờ
    emailVerificationExpiresIn: '24h', // 24 giờ
  },

  // Cài đặt email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@customer-management.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Customer Management',
  },

  // Cài đặt Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'customer_management',
  },

  // Cài đặt upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    uploadDir: 'uploads',
  },

  // Cài đặt bảo mật
  security: {
    saltRounds: 10,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 phút
      max: 100, // Giới hạn mỗi IP 100 request trong 15 phút
    },
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  },

  // Cài đặt logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    file: {
      enabled: process.env.LOG_TO_FILE === 'true',
      path: 'logs/app.log',
      maxSize: '20m',
      maxFiles: '14d',
    },
  },
};

// Kiểm tra các biến môi trường bắt buộc
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error('Lỗi: Thiếu các biến môi trường bắt buộc:', missingVars.join(', '));
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

module.exports = config;
