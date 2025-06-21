const { Sequelize } = require('sequelize');
require('dotenv').config();

// Kiểm tra các biến môi trường bắt buộc
const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST', 'DB_PORT'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Lỗi: Thiếu các biến môi trường bắt buộc: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Tạo kết nối đến cơ sở dữ liệu
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false,
      // Thiết lập múi giờ Việt Nam
      useUTC: false,
      dateStrings: true,
      typeCast: true,
    },
    timezone: '+07:00', // Múi giờ Việt Nam
    pool: {
      max: 5, // Số lượng kết nối tối đa trong pool
      min: 0, // Số lượng kết nối tối thiểu trong pool
      acquire: 30000, // Thời gian tối đa (ms) để lấy kết nối
      idle: 10000, // Thời gian tối đa (ms) một kết nối có thể không hoạt động trước khi bị hủy
    },
  }
);

// Hàm kiểm tra kết nối đến cơ sở dữ liệu
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối đến cơ sở dữ liệu thành công.');
  } catch (error) {
    console.error('Không thể kết nối đến cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

// Đồng bộ hóa mô hình với cơ sở dữ liệu
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log(`Đồng bộ hóa cơ sở dữ liệu ${force ? 'với tùy chọn force: true' : 'thành công'}.`);
  } catch (error) {
    console.error('Lỗi khi đồng bộ hóa cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};
