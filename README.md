# Hệ thống Quản lý Khách hàng

## Yêu cầu hệ thống

- Node.js 14.x trở lên
- PostgreSQL 12.x trở lên
- npm hoặc yarn

## Cài đặt môi trường phát triển

1. Clone dự án
   ```bash
   git clone [repository-url]
   cd quan_ly_khach_hang
   ```

2. Cài đặt dependencies
   ```bash
   cd server
   npm install
   ```

3. Tạo file .env từ .env.example và cập nhật thông tin kết nối database
   ```bash
   cp .env.example .env
   ```

4. Khởi tạo cơ sở dữ liệu
   ```bash
   npm run db:create
   npm run migrate
   ```

5. Khởi động server
   ```bash
   npm run dev
   ```

## API Documentation

Sau khi khởi động server, truy cập:
- API Documentation: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/api/health`

## Các lệnh thường dùng

- Chạy lệnh migration: `npm run migrate`
- Chạy test: `npm test`
- Format code: `npm run format`
- Lint code: `npm run lint`

## Triển khai lên môi trường production

Dự án đã được cấu hình sẵn để triển khai lên Render. Chỉ cần đẩy code lên nhánh chính của repository và kết nối với Render.

## Cấu trúc thư mục

```
server/
├── config/           # Cấu hình ứng dụng
├── controllers/       # Các controller xử lý logic
├── middlewares/       # Custom middlewares
├── models/            # Database models
├── routes/            # Định nghĩa các route
├── uploads/           # Thư mục lưu file tải lên
├── utils/             # Các tiện ích
├── validations/       # Các rule validate
├── .env               # Biến môi trường
├── .eslintrc.js       # Cấu hình ESLint
├── .prettierrc        # Cấu hình Prettier
├── app.js             # File khởi tạo ứng dụng
└── package.json       # Các dependencies và scripts
```

## Giấy phép

MIT
