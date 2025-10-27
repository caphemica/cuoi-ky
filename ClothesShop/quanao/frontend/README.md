# ClothesShop - E-commerce Application

Hệ thống bán hàng trực tuyến chuyên về quần áo và thời trang với đầy đủ các tính năng quản lý sản phẩm, giỏ hàng, đặt hàng và đánh giá.

## 🛠 Công nghệ sử dụng

### Frontend

- **React 19.1.1** - Thư viện UI hiện đại
- **Vite 7.1.2** - Build tool nhanh chóng
- **React Router DOM 7.8.2** - Điều hướng trang
- **Redux Toolkit 2.9.0** - Quản lý state tập trung
- **React Redux 9.2.0** - Kết nối React với Redux
- **Tailwind CSS 4.1.12** - Framework CSS utility-first
- **Axios 1.11.0** - HTTP client
- **Socket.IO Client 4.8.1** - Real-time communication
- **Ant Design 5.27.3** - UI component library
- **Chart.js 4.4.7** - Thư viện biểu đồ
- **React Chart.js 2** - Wrapper cho Chart.js
- **Sonner 2.0.7** - Toast notification
- **React Spinners 0.17.0** - Loading animations

### Backend

- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **Sequelize 6.37.7** - ORM cho database
- **MySQL2 3.14.3** - Database
- **Socket.IO 4.8.1** - Real-time bidirectional communication
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **Bcrypt 6.0.0** - Password hashing
- **Cloudinary 2.7.0** - Cloud image management
- **Nodemailer 7.0.6** - Email service
- **CORS 2.8.5** - Cross-origin resource sharing
- **Dotenv 17.2.1** - Environment variables management

## 📁 Cấu trúc thư mục dự án

```
ClothesShop/
├── backend/                      # Server-side application
│   ├── config/                   # Cấu hình
│   │   ├── cloudinary.js        # Cấu hình Cloudinary cho upload ảnh
│   │   └── mysql.js             # Cấu hình kết nối MySQL
│   ├── controllers/             # Business logic
│   │   ├── cartController.js    # Logic quản lý giỏ hàng
│   │   ├── couponController.js  # Logic xử lý mã giảm giá
│   │   ├── favoriteController.js # Logic yêu thích sản phẩm
│   │   ├── orderController.js    # Logic đặt hàng
│   │   ├── productController.js # Logic sản phẩm
│   │   ├── promotionScoreController.js # Logic điểm khuyến mãi
│   │   ├── reviewController.js   # Logic đánh giá sản phẩm
│   │   └── userController.js     # Logic người dùng
│   ├── middleware/               # Middleware
│   │   ├── admin.js             # Middleware kiểm tra admin
│   │   └── auth.js               # Middleware xác thực JWT
│   ├── models/                   # Database models
│   │   ├── cartModel.js         # Model giỏ hàng
│   │   ├── couponModel.js       # Model mã giảm giá
│   │   ├── couponTemplateModel.js # Model template mã giảm giá
│   │   ├── favoriteModel.js      # Model yêu thích
│   │   ├── orderModel.js         # Model đơn hàng
│   │   ├── productModel.js       # Model sản phẩm
│   │   ├── promotionScore.js     # Model điểm khuyến mãi
│   │   ├── reviewModel.js        # Model đánh giá
│   │   └── userModel.js          # Model người dùng
│   ├── routes/                   # API routes
│   │   ├── cartRoute.js          # Routes giỏ hàng
│   │   ├── couponRoute.js        # Routes mã giảm giá
│   │   ├── favoriteRoute.js      # Routes yêu thích
│   │   ├── orderRoute.js         # Routes đơn hàng
│   │   ├── productRoute.js       # Routes sản phẩm
│   │   ├── promotionScoreRoute.js # Routes điểm khuyến mãi
│   │   ├── reviewRoute.js        # Routes đánh giá
│   │   └── userRoute.js          # Routes người dùng
│   ├── services/                 # Services
│   │   ├── emailService.js       # Dịch vụ gửi email
│   │   └── socket.js             # WebSocket service
│   ├── templates/                # Email templates
│   │   └── verification.hbs      # Template email xác thực
│   ├── utils/                    # Utilities
│   │   └── helpers.js            # Helper functions
│   ├── node_modules/             # Dependencies
│   ├── server.js                 # Entry point của server
│   └── package.json              # Dependencies và scripts
│
└── frontend/                     # Client-side application
    ├── public/                   # Static files
    │   └── vite.svg
    ├── src/
    │   ├── assets/              # Images và assets
    │   │   ├── *.png            # Product images
    │   │   └── *.js             # Asset exports
    │   ├── components/           # React components
    │   │   ├── BestSeller.jsx   # Component sản phẩm bán chạy
    │   │   ├── Footer.jsx       # Footer component
    │   │   ├── Hero.jsx         # Hero section
    │   │   ├── LatestCollection.jsx # Bộ sưu tập mới nhất
    │   │   ├── MostPromotionProducts.jsx # Sản phẩm khuyến mãi
    │   │   ├── MostViewCollection.jsx # Sản phẩm xem nhiều
    │   │   ├── Navbar.jsx       # Navigation bar
    │   │   ├── NewsletterBox.jsx # Newsletter subscription
    │   │   ├── OurPolicy.jsx    # Chính sách
    │   │   ├── ProductItem.jsx  # Component hiển thị sản phẩm
    │   │   ├── ReviewForm.jsx   # Form đánh giá
    │   │   ├── ReviewList.jsx   # Danh sách đánh giá
    │   │   └── Title.jsx         # Title component
    │   ├── context/              # Context providers
    │   │   └── ShopContext.jsx   # Shop context
    │   ├── pages/               # Page components
    │   │   ├── About.jsx        # Trang giới thiệu
    │   │   ├── Cart.jsx         # Trang giỏ hàng
    │   │   ├── Collection.jsx   # Trang danh sách sản phẩm
    │   │   ├── Contact.jsx      # Trang liên hệ
    │   │   ├── Home.jsx         # Trang chủ
    │   │   ├── Login.jsx        # Trang đăng nhập
    │   │   ├── Register.jsx     # Trang đăng ký
    │   │   ├── Product.jsx      # Trang chi tiết sản phẩm
    │   │   ├── Profile.jsx      # Trang thông tin cá nhân
    │   │   ├── Orders.jsx       # Trang đơn hàng
    │   │   ├── PlaceOrder.jsx    # Trang thanh toán
    │   │   ├── ForgotPassword.jsx # Trang quên mật khẩu
    │   │   ├── MyFavorites.jsx  # Trang yêu thích
    │   │   ├── VerifyAccount.jsx # Xác thực tài khoản
    │   │   ├── Admin.jsx        # Trang admin
    │   │   └── admin/           # Admin pages
    │   │       ├── AdminDashboard.jsx # Dashboard admin
    │   │       ├── AdminLayout.jsx    # Layout admin
    │   │       ├── AdminOrders.jsx    # Quản lý đơn hàng
    │   │       └── AdminProducts.jsx  # Quản lý sản phẩm
    │   ├── services/             # API services
    │   │   ├── api.js           # API functions
    │   │   └── axios.customize.js # Axios configuration
    │   ├── store/               # Redux store
    │   │   ├── slices/          # Redux slices
    │   │   │   ├── authSlice.js         # Auth state
    │   │   │   ├── cartSlice.js         # Cart state
    │   │   │   ├── favoriteSlice.js     # Favorite state
    │   │   │   ├── promotionScoreSlice.js # Promotion state
    │   │   │   └── reviewSlice.js       # Review state
    │   │   └── index.js         # Store configuration
    │   ├── App.jsx              # Root component
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    ├── index.html               # HTML template
    ├── eslint.config.js         # ESLint configuration
    ├── tailwind.config.js        # Tailwind configuration
    ├── vite.config.js           # Vite configuration
    └── package.json             # Dependencies và scripts
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL >= 8.0
- npm hoặc yarn

### Backend Setup

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env với các biến môi trường:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=clothesshop
# JWT_SECRET=your_jwt_secret
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Chạy server (development)
npm run dev

# Hoặc chạy server (production)
npm start
```

### Frontend Setup

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

## 📝 Scripts có sẵn

### Backend

- `npm start` - Chạy server production
- `npm run dev` - Chạy server development mode với nodemon
- `npm run server` - Tương tự npm run dev

### Frontend

- `npm run dev` - Chạy development server (thường ở http://localhost:5173)
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run lint` - Chạy ESLint

## 🔑 Các tính năng chính

### Đối với người dùng

- ✅ Đăng ký/Đăng nhập với JWT authentication
- ✅ Xác thực email qua OTP
- ✅ Quên mật khẩu
- ✅ Xem danh sách sản phẩm với filtering và pagination
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm/Xóa sản phẩm vào giỏ hàng
- ✅ Tăng/Giảm/Xóa số lượng trong giỏ hàng
- ✅ Quản lý đơn hàng
- ✅ Yêu thích sản phẩm
- ✅ Đánh giá và review sản phẩm
- ✅ Nhận thông báo real-time về review mới
- ✅ Sử dụng mã giảm giá
- ✅ Đổi điểm thành voucher
- ✅ Quản lý profile

### Đối với Admin

- ✅ Dashboard với thống kê
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Upload ảnh lên Cloudinary
- ✅ Xem và quản lý đánh giá

## 🌐 API Endpoints

### Authentication

- `POST /api/v1/user/register` - Đăng ký
- `POST /api/v1/user/login` - Đăng nhập
- `POST /api/v1/user/verify-otp` - Xác thực OTP
- `POST /api/v1/user/password/request-reset` - Yêu cầu reset mật khẩu

### Products

- `GET /api/v1/product` - Lấy danh sách sản phẩm
- `GET /api/v1/product/homepage` - Sản phẩm cho trang chủ
- `GET /api/v1/product/:id` - Lấy chi tiết sản phẩm

### Cart

- `GET /api/v1/cart` - Lấy giỏ hàng
- `POST /api/v1/cart/add` - Thêm vào giỏ
- `PATCH /api/v1/cart/decrease` - Giảm số lượng
- `DELETE /api/v1/cart/remove` - Xóa khỏi giỏ

### Orders

- `POST /api/v1/order` - Tạo đơn hàng
- `GET /api/v1/order` - Lấy đơn hàng của user

### Reviews

- `GET /api/v1/review/product/:id` - Lấy reviews của sản phẩm
- `POST /api/v1/review` - Tạo review

### Favorites

- `POST /api/v1/favorite` - Thêm yêu thích
- `DELETE /api/v1/favorite/:id` - Xóa yêu thích

## 📄 License

ISC
