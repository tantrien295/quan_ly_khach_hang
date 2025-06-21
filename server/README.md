# Customer Management API

Hệ thống quản lý khách hàng và dịch vụ với Node.js, Express, PostgreSQL và JWT Authentication.

## Yêu cầu hệ thống

- Node.js (v14.x trở lên)
- PostgreSQL (v12 trở lên)
- npm hoặc yarn

## Cài đặt

1. **Sao chép repository**

```bash
git clone [repository-url]
cd quan_ly_khach_hang/server
```

2. **Cài đặt các phụ thuộc**

```bash
npm install
# hoặc
yarn install
```

3. **Cấu hình môi trường**

- Tạo file `.env` từ file `.env.example`
- Cập nhật các biến môi trường phù hợp

```bash
cp .env.example .env
```

4. **Cấu hình cơ sở dữ liệu**

- Tạo cơ sở dữ liệu PostgreSQL
- Cập nhật thông tin kết nối trong file `.env`

5. **Chạy migrations**

```bash
# Đồng bộ hóa cơ sở dữ liệu
npx sequelize-cli db:migrate

# Tạo dữ liệu mẫu (tùy chọn)
npx sequelize-cli db:seed:all
```

## Khởi động ứng dụng

### Chế độ phát triển

```bash
# Chạy với nodemon (tự động reload khi có thay đổi)
npm run dev

# Hoặc chạy thông thường
npm start
```

### Chế độ sản xuất

```bash
# Build ứng dụng
npm run build

# Chạy ứng dụng đã build
npm run start:prod
```

## API Endpoints

### Xác thực

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh-token` - Làm mới token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `POST /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Khách hàng

- `GET /api/customers` - Lấy danh sách khách hàng
- `POST /api/customers` - Tạo mới khách hàng
- `GET /api/customers/:id` - Lấy thông tin chi tiết khách hàng
- `PUT /api/customers/:id` - Cập nhật thông tin khách hàng
- `DELETE /api/customers/:id` - Xóa khách hàng

### Dịch vụ

- `GET /api/services` - Lấy danh sách dịch vụ
- `POST /api/services` - Tạo mới dịch vụ
- `GET /api/services/:id` - Lấy thông tin chi tiết dịch vụ
- `PUT /api/services/:id` - Cập nhật thông tin dịch vụ
- `DELETE /api/services/:id` - Xóa dịch vụ

### Nhân viên

- `GET /api/employees` - Lấy danh sách nhân viên
- `POST /api/employees` - Tạo mới nhân viên
- `GET /api/employees/:id` - Lấy thông tin chi tiết nhân viên
- `PUT /api/employees/:id` - Cập nhật thông tin nhân viên
- `DELETE /api/employees/:id` - Xóa nhân viên

### Lịch sử dịch vụ

- `GET /api/service-histories` - Lấy danh sách lịch sử dịch vụ
- `POST /api/service-histories` - Tạo mới lịch sử dịch vụ
- `GET /api/service-histories/:id` - Lấy thông tin chi tiết lịch sử dịch vụ
- `PUT /api/service-histories/:id` - Cập nhật thông tin lịch sử dịch vụ
- `DELETE /api/service-histories/:id` - Xóa lịch sử dịch vụ

## Công nghệ sử dụng

- **Backend Framework**: Node.js, Express
- **Database**: PostgreSQL với Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer với Cloudinary
- **Validation**: express-validator
- **Logging**: Winston
- **Email**: Nodemailer
- **API Documentation**: Swagger (sẽ được thêm sau)

## Cấu trúc thư mục

```
server/
├── config/               # Cấu hình ứng dụng
├── controllers/          # Xử lý logic nghiệp vụ
├── middlewares/          # Các middleware tùy chỉnh
├── models/               # Định nghĩa models và quan hệ
├── routes/               # Định nghĩa các route
├── services/             # Các service xử lý nghiệp vụ
├── utils/                # Các tiện ích hỗ trợ
├── validations/          # Xác thực dữ liệu đầu vào
├── uploads/              # Thư mục lưu file tải lên (tạm thời)
├── .env                 # Biến môi trường
├── .env.example         # Mẫu cấu hình biến môi trường
├── app.js               # File khởi tạo ứng dụng
└── package.json         # Cấu hình dự án và dependencies
```

## Triển khai

### Lên môi trường production

1. Cập nhật file `.env` với cấu hình production
2. Build ứng dụng:

```bash
npm run build
```

3. Chạy ứng dụng với PM2 (recommended):

```bash
# Cài đặt PM2 toàn cục (nếu chưa có)
npm install -g pm2

# Khởi động ứng dụng
pm2 start dist/server.js --name "customer-management-api"

# Khởi động lại ứng dụng khi server khởi động lại
pm2 startup
pm2 save
```

### Sử dụng Docker (tùy chọn)

1. Tạo file `docker-compose.yml`
2. Build và chạy container:

```bash
docker-compose up -d --build
```

## Bảo mật

- Luôn sử dụng HTTPS trong môi trường production
- Không commit file `.env` lên repository
- Sử dụng các biến môi trường cho thông tin nhạy cảm
- Giới hạn tỷ lệ truy cập API (rate limiting)
- Xác thực và phân quyền đầy đủ

## Đóng góp

1. Fork repository
2. Tạo nhánh mới (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên nhánh (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Giấy phép

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc đóng góp nào, vui lòng liên hệ qua email: your.email@example.com
