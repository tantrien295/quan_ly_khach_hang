const path = require('path');
const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const basename = path.basename(__filename);
const db = {};

// Khởi tạo sequelize instance
const sequelizeInstance = sequelize;

// Hàm tạo tài khoản admin mặc định
const createDefaultAdmin = async (userModel) => {
  try {
    if (!userModel) return;

    const admin = await userModel.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      await userModel.create({
        full_name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        is_active: true,
        email_verified: true,
      });
      console.log('✅ Đã tạo tài khoản admin mặc định');
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản admin mặc định:', error);
  }
};

// Đọc tất cả các file model trong thư mục hiện tại
fs.readdirSync(__dirname)
  .filter((file) => {
    const isJsFile = file.endsWith('.js');
    const isNotTestFile = !file.endsWith('.test.js');
    const isNotIndex = file !== basename;
    const isNotHidden = !file.startsWith('.');

    return isJsFile && isNotTestFile && isNotIndex && isNotHidden;
  })
  .forEach((file) => {
    try {
      // Sử dụng dynamic import thay vì require
      const modelPath = path.join(__dirname, file);
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const model = require(modelPath)(sequelizeInstance, DataTypes);
      db[model.name] = model;
      console.log(`✅ Đã tải model: ${model.name}`);
    } catch (error) {
      console.error(`❌ Lỗi khi tải model từ file ${file}:`, error);
    }
  });

// Thiết lập quan hệ giữa các model
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Thêm các model vào đối tượng db
db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;

// Đồng bộ hóa cơ sở dữ liệu
const syncDb = async (force = false) => {
  try {
    // Tạo bảng nếu chưa tồn tại
    await sequelizeInstance.sync({ force });
    
    // Tạo tài khoản admin mặc định nếu có model User
    if (db.User) {
      await createDefaultAdmin(db.User);
    }
    
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};



// Thêm hàm syncDb vào đối tượng db
db.syncDb = syncDb;

module.exports = db;
