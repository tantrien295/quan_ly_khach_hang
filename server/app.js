const fs = require('fs');
const path = require('path');
const http = require('http');

// Load environment variables
require('dotenv').config();

// Import các thư viện
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const cookieParser = require('cookie-parser');

// Import các module nội bộ
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { testConnection, sequelize } = require('./config/db');
const seed = require('./utils/seed');

// Hàm đồng bộ hóa cơ sở dữ liệu
const syncDatabase = async () => {
  try {
    console.log('🔄 Đang đồng bộ hóa cơ sở dữ liệu...');

    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ hóa cơ sở dữ liệu thành công!');
    // Tạo dữ liệu mẫu nếu cần
    // await seed();
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ hóa cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

// Khởi tạo ứng dụng Express
const app = express();

// Trust proxy
app.enable('trust proxy');

// CORS
app.use(cors());
app.options('*', cors());

// Đặt bảo mật HTTP headers
app.use(helmet());

// Giới hạn request từ cùng một IP
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 phút
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút!',
});
app.use('/api', limiter);

// Body parser, đọc dữ liệu từ body vào req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization chống NoSQL query injection
app.use(mongoSanitize());

// Data sanitization chống XSS
app.use(xss());

// Nén văn bản
app.use(compression());

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Khởi tạo HTTP server
const server = http.createServer(app);

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logging HTTP requests (chỉ trong môi trường development)
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line global-require
  const morgan = require('morgan');
  app.use(morgan('dev'));

  // Ghi log vào file
  const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Phục vụ các file tĩnh
app.use('/uploads', express.static(uploadsDir));

// Khởi tạo Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Lưu trữ đối tượng io để sử dụng ở các nơi khác
app.set('io', io);

// Kết nối và đồng bộ hóa cơ sở dữ liệu
testConnection()
  .then(() => {
    console.log('✅ Kết nối cơ sở dữ liệu thành công');
    // Đồng bộ hóa cơ sở dữ liệu
    return syncDatabase();
  })
  .catch((err) => {
    console.error('❌ Lỗi kết nối cơ sở dữ liệu:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api', require('./routes'));

// Xử lý lỗi 404
app.use(notFoundHandler);

// Xử lý lỗi
app.use(errorHandler);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Khởi động máy chủ
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`\n🚀 Server đang chạy trên cổng ${PORT}...`);
      console.log(`🌐 Môi trường: ${process.env.NODE_ENV}`);
      console.log(`📝 API Documentation: http://localhost:${PORT}/api/docs`);

      // Tạo admin mặc định nếu chưa có
      seed.createDefaultAdmin();
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error.message);
    process.exit(1);
  }
};

// Xử lý các lỗi chưa được bắt
process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Bắt đầu ứng dụng
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Lỗi khi khởi động server:', error);
    process.exit(1);
  });
}

module.exports = { app, server };
