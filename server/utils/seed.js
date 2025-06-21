const bcrypt = require('bcryptjs');
const { User } = require('../models');

const createDefaultAdmin = async () => {
  try {
    // Kiểm tra xem đã có admin nào chưa
    const adminExists = await User.findOne({ where: { role: 'admin' } });

    if (!adminExists) {
      // Tạo mật khẩu đã được hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      // Tạo tài khoản admin mặc định
      await User.create({
        name: 'Quản trị viên',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        emailVerified: true,
      });

      console.log('✅ Đã tạo tài khoản admin mặc định');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Mật khẩu: admin123');
    } else {
      console.log('ℹ️ Tài khoản admin đã tồn tại');
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo tài khoản admin mặc định:', error.message);
  }
};

module.exports = {
  createDefaultAdmin,
};
