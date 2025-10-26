# Admin Dashboard Backend API

Backend API for Admin Dashboard management system built with NestJS.

## Tech Stack

- **Framework**: NestJS (Node.js)
- **ORM**: Prisma
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email Service**: Nodemailer

## Project Structure

```
src/
├── auth/              # Authentication module
├── product/           # Product management module
├── order/             # Order management module
├── user/              # User management module
├── coupon/             # Coupon management module
├── email/              # Email service module
├── upload-service/     # File upload service
├── prisma/             # Prisma service
└── utils/              # Helper utilities
```

## Services Overview

The project consists of **7 main services**:

1. **Auth Service** - User authentication and JWT management
2. **Product Service** - Product CRUD operations
3. **Order Service** - Order management and statistics
4. **User Service** - User management and verification
5. **Coupon Service** - Coupon management
6. **Email Service** - Email notifications
7. **Upload Service** - File upload handling

## Database Models

The application uses **8 main database models**:

- `user` - User accounts and authentication
- `product` - Product inventory
- `order` - Orders and transactions
- `cart` - Shopping cart data
- `coupon` - Discount coupons
- `coupontemplate` - Coupon templates
- `favorite` - User favorites
- `review` - Product reviews
- `promotionscore` - Promotional scores

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your database credentials
```

### Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed admin user
npm run seed
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will run on `http://localhost:3000`

## API Documentation

Base URL: `http://localhost:3000/api/v1`

### Authentication APIs

#### Login

- **POST** `/auth/login`
- **Description**: User login with email and password
- **Body**: `{ email: string, password: string }`
- **Returns**: JWT token and user data

#### Get Profile

- **GET** `/auth/profile`
- **Description**: Get authenticated user's profile
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: User profile data

### User APIs

#### Get Users

- **GET** `/user`
- **Query Parameters**:
  - `search` - Search by name or email
  - `current` - Current page (default: 1)
  - `pageSize` - Items per page (default: 10)
- **Returns**: Paginated list of users

#### Register User

- **POST** `/user/register`
- **Description**: Register a new user
- **Body**: `{ name: string, email: string, password: string }`

#### Verify User (Admin)

- **PATCH** `/user/:userId/verify`
- **Description**: Manually verify a user account (Admin only)
- **Headers**: `Authorization: Bearer <token>`

### Product APIs

#### Get Products

- **GET** `/product`
- **Query Parameters**:
  - `search` - Search product name
  - `current` - Current page
  - `pageSize` - Items per page
- **Returns**: Paginated list of products

#### Create Product (Admin)

- **POST** `/product`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: FormData with:
  - `productName` - Product name
  - `productDescription` - Product description
  - `productPrice` - Price (number)
  - `productQuantity` - Stock quantity
  - `productPromotion` - Promotion percentage
  - `productImage` - Image file (jpg, jpeg, png, gif, max 5MB)

#### Update Product (Admin)

- **PATCH** `/product/:productId/product`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: FormData (same as create, optional fields)

#### Delete Product (Admin)

- **DELETE** `/product/:productId/product`
- **Headers**: `Authorization: Bearer <token>`

### Order APIs

#### Get Orders

- **GET** `/order`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `search` - Search by order ID or user name
  - `status` - Filter by status (NEW, CONFIRMED, PREPARING, SHIPPING, COMPLETED, CANCELLED)
  - `current` - Current page
  - `pageSize` - Items per page
- **Returns**: Paginated list of orders

#### Get Order by ID

- **GET** `/order/:orderId/order`
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: Order details

#### Update Order Status (Admin)

- **PATCH** `/order/:orderId/order`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ status: string }` (NEW, CONFIRMED, PREPARING, SHIPPING, COMPLETED, CANCELLED)

#### Get Order Statistics (Admin)

- **GET** `/order/stats`
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: Order statistics and analytics

### Email API

#### Send Verification Email

- Internal service for sending email verification codes

### Coupon API

- Available for future coupon management features

## Features

### Security

- JWT-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Protected admin endpoints
- CORS enabled for frontend integration

### File Upload

- Image upload support for products
- Maximum file size: 5MB
- Allowed formats: JPG, JPEG, PNG, GIF
- Files stored in `./uploads` directory

### Pagination

- All list endpoints support pagination
- Query parameters: `current` and `pageSize`
- Returns metadata: total count, total pages, current page

### Search Functionality

- User search by name or email
- Product search by product name
- Order search by order details

### Order Management

- Status tracking (NEW → CONFIRMED → PREPARING → SHIPPING → COMPLETED)
- Cancel request support
- Order statistics and analytics

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# Server Port
PORT=3000

# JWT Secret
JWT_SECRET=your-secret-key

# Email Configuration (if using email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Admin User Seed

A default admin user is provided via seed:

- **Email**: uteadmin@gmail.com
- **Password**: 1234567890
- **Role**: ADMIN

Run the seed:

```bash
npm run seed
```

## Development

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Run tests
npm run test

# Lint
npm run lint
```

## API Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "current": 1,
    "pageSize": 10,
    "total": 100,
    "page": 10
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error type"
}
```

## License

MIT
