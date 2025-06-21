const { sequelize, testConnection } = require('./config/db');
const db = require('./models');

async function testDatabase() {
  console.log('🔍 Đang kiểm tra kết nối cơ sở dữ liệu...');

  try {
    // Kiểm tra kết nối
    await testConnection();

    // Đồng bộ hóa cơ sở dữ liệu (không xóa dữ liệu cũ)
    console.log('🔄 Đang đồng bộ hóa cơ sở dữ liệu...');
    await db.syncDb(false);

    console.log('\n✅ Kết nối và đồng bộ cơ sở dữ liệu thành công!');
    console.log('📊 Các bảng đã được tạo/cập nhật.');

    // Đóng kết nối sau khi hoàn thành
    await sequelize.close();
    console.log('👋 Đã đóng kết nối cơ sở dữ liệu.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra cơ sở dữ liệu:', error);
    process.exit(1);
  }
}

// Chạy hàm kiểm tra
testDatabase();
