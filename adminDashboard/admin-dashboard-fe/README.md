# Admin Dashboard Frontend

Admin Dashboard được xây dựng với Next.js 15, Ant Design, Zustand và TanStack Query.

## 🚀 Tính năng chính

- **Layout Admin**: Sidebar có thể thu gọn, header với user menu
- **Authentication**: Login/logout với Zustand state management
- **Dashboard**: Trang tổng quan với thống kê và quick actions
- **Products Management**: Quản lý sản phẩm (CRUD)
- **Orders Management**: Quản lý đơn hàng với status tracking
- **Users Management**: Quản lý người dùng và phân quyền
- **Responsive Design**: Tương thích mobile và desktop

## 🛠️ Công nghệ sử dụng

- **Next.js 15**: React framework với App Router
- **Ant Design 5**: UI component library
- **Zustand**: State management với persistence
- **TanStack Query**: Data fetching và caching
- **TypeScript**: Type safety
- **Axios**: HTTP client với interceptors

## 📁 Cấu trúc thư mục

```
admin-dashboard-fe/
├── app/
│   ├── dashboard/           # Dashboard pages
│   │   ├── layout.tsx      # Dashboard layout
│   │   ├── page.tsx        # Dashboard home
│   │   ├── products/       # Products management
│   │   ├── orders/         # Orders management
│   │   └── users/          # Users management
│   ├── layout.tsx          # Root layout với providers
│   ├── page.tsx            # Login page
│   └── providers.tsx       # Providers setup
├── components/
│   └── Layout/
│       └── AdminLayout.tsx # Reusable admin layout
├── store/
│   └── useStores.ts        # Zustand stores
├── services/
│   └── axios.customize.ts  # Axios configuration
└── .env.local              # Environment variables
```

## 🔧 Cài đặt và chạy

1. **Cài đặt dependencies:**

```bash
npm install
```

2. **Tạo file environment:**

```bash
# Tạo file .env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Admin Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
```

3. **Chạy development server:**

```bash
npm run dev
```

4. **Mở trình duyệt:**

```
http://localhost:3000
```

## 🔐 Authentication

### Login Credentials (Demo)

- **Email**: admin@example.com
- **Password**: password123

### API Endpoints

- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất

## 📊 State Management

### Auth Store (`useAuthStore`)

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  loginAPI: (email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

### App Store (`useAppStore`)

```typescript
interface AppState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";

  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}
```

## 🎨 Layout System

### AdminLayout Component

Component layout có thể tái sử dụng với các props:

```typescript
interface AdminLayoutProps {
  children: React.ReactNode;
  menuItems?: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
  title?: string;
  subtitle?: string;
}
```

### Sử dụng:

```tsx
<AdminLayout
  menuItems={menuItems}
  title="Admin Dashboard"
  subtitle="Manage your business"
>
  {children}
</AdminLayout>
```

## 🌐 API Integration

### Axios Configuration

- Base URL từ environment variables
- Request interceptor để thêm Authorization header
- Response interceptor để xử lý errors
- Automatic token refresh

### Example API calls:

```typescript
// Login
const response = await axios.post("/auth/login", {
  email: "admin@example.com",
  password: "password123",
});

// Get products
const products = await axios.get("/products");

// Create product
const newProduct = await axios.post("/products", productData);
```

## 📱 Responsive Design

- **Mobile**: Sidebar tự động ẩn, menu hamburger
- **Tablet**: Sidebar có thể thu gọn
- **Desktop**: Full sidebar với hover effects

## 🎯 Features

### Dashboard

- Statistics cards với real-time data
- Quick action buttons
- Recent activities feed
- Quick stats overview

### Products Management

- Product listing với search và filter
- Add/Edit/Delete products
- Stock management
- Category organization

### Orders Management

- Order tracking với status updates
- Customer information
- Order details modal
- Status filtering

### Users Management

- User listing với role management
- Add/Edit/Delete users
- Status management (active/inactive/banned)
- Role-based permissions

## 🔧 Customization

### Theme

Có thể customize theme trong `providers.tsx`:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
    components: {
      Button: {
        borderRadius: 6,
      },
      // ... other components
    },
  }}
>
```

### Menu Items

Menu items có thể được customize trong mỗi layout:

```typescript
const menuItems = [
  {
    key: "/dashboard",
    icon: <DashboardOutlined />,
    label: "Dashboard",
    onClick: () => router.push("/dashboard"),
  },
  // ... more items
];
```

## 🚀 Deployment

1. **Build production:**

```bash
npm run build
```

2. **Start production server:**

```bash
npm start
```

3. **Environment variables cho production:**

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=Admin Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📝 Notes

- Sử dụng Next.js App Router
- TypeScript strict mode enabled
- ESLint và Prettier configured
- Zustand DevTools enabled trong development
- TanStack Query DevTools enabled trong development

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License
