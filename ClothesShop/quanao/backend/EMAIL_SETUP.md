# Hướng dẫn cấu hình Email

## Cài đặt nodemailer

```bash
npm install nodemailer
```

## Cấu hình Gmail

### 1. Tạo App Password cho Gmail

1. Đăng nhập vào Gmail
2. Vào Settings > Security
3. Bật 2-Factor Authentication nếu chưa bật
4. Tạo App Password:
   - Vào Security > App passwords
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên: "ClothesShop App"
   - Copy mật khẩu được tạo (16 ký tự)

### 2. Thêm vào file .env

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

### 3. Các biến môi trường cần thiết

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=uteshop

# JWT
JWT_SECRET=your_jwt_secret_key

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## API Endpoints

### 1. Đăng ký tài khoản

```
POST /api/users/register
Body: {
  "name": "Tên người dùng",
  "email": "email@example.com",
  "password": "mật_khẩu"
}
```

### 2. Xác thực OTP

```
POST /api/users/verify-otp
Body: {
  "userId": "user_id_từ_đăng_ký",
  "otpCode": "123456"
}
```

### 3. Gửi lại OTP

```
POST /api/users/resend-otp
Body: {
  "userId": "user_id"
}
```

### 4. Đăng nhập

```
POST /api/users/login
Body: {
  "email": "email@example.com",
  "password": "mật_khẩu"
}
```

## Lưu ý

- Mã OTP có hiệu lực trong 10 phút
- Chỉ tài khoản đã xác thực mới có thể đăng nhập
- Nếu gửi email thất bại, tài khoản sẽ bị xóa tự động
