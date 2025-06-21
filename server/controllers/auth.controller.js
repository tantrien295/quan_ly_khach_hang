const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { generateToken, verifyToken } = require('../config/jwt');
const { sendEmail } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

/**
 * Đăng ký tài khoản mới
 */
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          { username }
        ]
      } 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc tên đăng nhập đã được sử dụng',
      });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo mã xác nhận
    const emailVerificationToken = uuidv4();

    // Tạo người dùng mới
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      full_name: fullName,
      phone,
      email_verification_token: emailVerificationToken,
      is_active: true, // Tạm thời set là true, có thể cần xác thực email
      role: 'user', // Mặc định là user
    });

    // Gửi email xác nhận
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Xác nhận địa chỉ email',
      html: `
        <h2>Xin chào ${fullName},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng nhấp vào liên kết bên dưới để xác nhận địa chỉ email của bạn:</p>
        <p><a href="${verificationUrl}" target="_blank">Xác nhận email</a></p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      `,
    });

    // Tạo token
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateToken({ userId: user.id }, '7d');

    // Lưu refresh token vào database
    await user.update({ refresh_token: refreshToken });

    // Ẩn thông tin nhạy cảm trước khi gửi phản hồi
    const userResponse = user.get({ plain: true });
    delete userResponse.password;
    delete userResponse.refresh_token;
    delete userResponse.email_verification_token;
    delete userResponse.reset_password_token;
    delete userResponse.reset_password_expires;

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công. Vui lòng kiểm tra email để xác nhận tài khoản.',
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng ký tài khoản',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Đăng nhập
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra người dùng tồn tại
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Kiểm tra tài khoản đã được kích hoạt chưa
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email để kích hoạt tài khoản.',
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Tạo token
    const token = generateToken({ userId: user.id, role: user.role });
    const refreshToken = generateToken({ userId: user.id }, '7d');

    // Lưu refresh token vào database
    await user.update({ 
      refresh_token: refreshToken,
      last_login: new Date(),
    });

    // Ẩn thông tin nhạy cảm trước khi gửi phản hồi
    const userResponse = user.get({ plain: true });
    delete userResponse.password;
    delete userResponse.refresh_token;
    delete userResponse.email_verification_token;
    delete userResponse.reset_password_token;
    delete userResponse.reset_password_expires;

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: userResponse,
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Làm mới token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy refresh token',
      });
    }

    // Xác thực refresh token
    const decoded = verifyToken(refreshToken);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token không hợp lệ',
      });
    }

    // Tạo token mới
    const newToken = generateToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateToken({ userId: user.id }, '7d');

    // Cập nhật refresh token mới vào database
    await user.update({ refresh_token: newRefreshToken });

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token không hợp lệ hoặc đã hết hạn',
    });
  }
};

/**
 * Đăng xuất
 */
exports.logout = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Xóa refresh token
    await User.update(
      { refresh_token: null },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Đăng xuất thành công',
    });
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng xuất',
    });
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password', 'refresh_token', 'email_verification_token', 'reset_password_token', 'reset_password_expires'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin người dùng',
    });
  }
};

/**
 * Đổi mật khẩu
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.user;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại',
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới
    await user.update({ password: hashedPassword });

    // Gửi email thông báo đổi mật khẩu
    await sendEmail({
      to: user.email,
      subject: 'Đổi mật khẩu thành công',
      html: `
        <h2>Xin chào ${user.full_name},</h2>
        <p>Mật khẩu của bạn đã được thay đổi thành công vào lúc ${new Date().toLocaleString('vi-VN')}.</p>
        <p>Nếu không phải bạn thực hiện thay đổi này, vui lòng liên hệ ngay với quản trị viên.</p>
      `,
    });

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('Lỗi khi đổi mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đổi mật khẩu',
    });
  }
};

/**
 * Quên mật khẩu - Gửi email đặt lại mật khẩu
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Trả về thành công ngay cả khi email không tồn tại để tránh lộ thông tin
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu',
      });
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = uuidv4();
    const resetPasswordExpires = new Date(Date.now() + 3600000); // Hết hạn sau 1 giờ

    // Lưu token vào database
    await user.update({
      reset_password_token: resetToken,
      reset_password_expires: resetPasswordExpires,
    });

    // Gửi email đặt lại mật khẩu
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <h2>Xin chào ${user.full_name},</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu của bạn:</p>
        <p><a href="${resetUrl}" target="_blank">Đặt lại mật khẩu</a></p>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      `,
    });

    res.json({
      success: true,
      message: 'Đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn',
    });
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xử lý yêu cầu đặt lại mật khẩu',
    });
  }
};

/**
 * Đặt lại mật khẩu với token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Tìm người dùng với token hợp lệ
    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới và xóa token
    await user.update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    });

    // Gửi email thông báo đổi mật khẩu thành công
    await sendEmail({
      to: user.email,
      subject: 'Đặt lại mật khẩu thành công',
      html: `
        <h2>Xin chào ${user.full_name},</h2>
        <p>Mật khẩu của bạn đã được đặt lại thành công vào lúc ${new Date().toLocaleString('vi-VN')}.</p>
        <p>Nếu không phải bạn thực hiện thay đổi này, vui lòng liên hệ ngay với quản trị viên.</p>
      `,
    });

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
    });
  } catch (error) {
    console.error('Lỗi khi đặt lại mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đặt lại mật khẩu',
    });
  }
};
