const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

// Tạo transporter cho email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Chỉ sử dụng trong môi trường development
  },
});

// Kiểm tra kết nối email
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Kết nối email thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối email:', error);
    return false;
  }
};

// Hàm gửi email
const sendEmail = async (options) => {
  try {
    // Nếu đang trong môi trường test, không gửi email thật
    if (process.env.NODE_ENV === 'test') {
      console.log('Test environment - Email not sent:', options);
      return { messageId: 'test-message-id' };
    }

    // Kiểm tra các trường bắt buộc
    if (!options.to || !options.subject) {
      throw new Error('Thiếu thông tin bắt buộc: to, subject');
    }

    // Tạo nội dung email từ template nếu có
    let html = options.html;
    if (options.template) {
      const templatePath = path.join(
        __dirname,
        '..',
        'templates',
        'emails',
        `${options.template}.ejs`
      );

      try {
        const template = await readFile(templatePath, 'utf-8');
        html = ejs.render(template, options.data || {});
      } catch (error) {
        console.error('Lỗi khi đọc template email:', error);
        throw new Error('Không thể tải template email');
      }
    }

    // Cấu hình email
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Customer Management'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: html,
      attachments: options.attachments || [],
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi:', info.messageId);
    return info;
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    throw new Error('Không thể gửi email: ' + error.message);
  }
};

// Hàm gửi email xác nhận đăng ký
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Xác nhận địa chỉ email',
    template: 'verify-email',
    data: {
      name: user.full_name,
      verificationUrl,
      year: new Date().getFullYear(),
    },
  });
};

// Hàm gửi email đặt lại mật khẩu
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  
  return sendEmail({
    to: user.email,
    subject: 'Đặt lại mật khẩu',
    template: 'reset-password',
    data: {
      name: user.full_name,
      resetUrl,
      year: new Date().getFullYear(),
    },
  });
};

// Hàm gửi thông báo đổi mật khẩu thành công
const sendPasswordChangedEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: 'Mật khẩu đã được thay đổi',
    template: 'password-changed',
    data: {
      name: user.full_name,
      date: new Date().toLocaleDateString('vi-VN'),
      year: new Date().getFullYear(),
    },
  });
};

module.exports = {
  transporter,
  verifyEmailConnection,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
};
