# Socket Review Notification - Hướng dẫn sử dụng

## Tổng quan

Hệ thống socket notification cho phép admin nhận thông báo real-time khi có user đánh giá sản phẩm mới.

## Cách hoạt động

### 1. Backend Events

- Khi user tạo review mới, hệ thống sẽ emit event `new_review_notification` đến room `admin`
- Chỉ admin mới có thể join vào room `admin`

### 2. Socket Events

#### Client → Server Events:

- `join_admin_room`: Admin join vào room admin
- `leave_admin_room`: Admin rời khỏi room admin

#### Server → Client Events:

- `admin_room_joined`: Xác nhận admin đã join room thành công
- `admin_room_error`: Lỗi khi không có quyền join room
- `admin_room_left`: Xác nhận admin đã rời room
- `new_review_notification`: Thông báo có review mới

## Cách sử dụng ở Frontend

### 1. Kết nối Socket

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // Thay đổi URL theo môi trường
```

### 2. Admin Join Room

```javascript
// Khi admin đăng nhập thành công
socket.emit("join_admin_room", {
  userId: adminUser.id,
  userRole: adminUser.role, // Phải là "ADMIN"
});
```

### 3. Listen cho thông báo review mới

```javascript
socket.on("new_review_notification", (data) => {
  console.log("Có review mới:", data);

  // data structure:
  // {
  //   type: "NEW_REVIEW",
  //   review: {
  //     id: reviewId,
  //     rating: 5,
  //     comment: "Sản phẩm rất tốt",
  //     createdAt: "2024-01-01T00:00:00.000Z"
  //   },
  //   user: {
  //     id: userId,
  //     userName: "Nguyễn Văn A",
  //     userEmail: "user@example.com"
  //   },
  //   product: {
  //     id: productId,
  //     productName: "Áo thun nam",
  //     productImage: "image_url"
  //   },
  //   message: "Có đánh giá mới từ Nguyễn Văn A cho sản phẩm \"Áo thun nam\""
  // }

  // Hiển thị thông báo cho admin
  showNotification(data.message, data);
});
```

### 4. Handle các events khác

```javascript
// Xác nhận join room thành công
socket.on("admin_room_joined", (data) => {
  console.log("Đã tham gia phòng admin:", data.message);
});

// Lỗi khi không có quyền
socket.on("admin_room_error", (data) => {
  console.error("Lỗi:", data.message);
});

// Xác nhận rời room
socket.on("admin_room_left", (data) => {
  console.log("Đã rời khỏi phòng admin:", data.message);
});
```

### 5. Admin rời room khi logout

```javascript
// Khi admin logout
socket.emit("leave_admin_room", {
  userId: adminUser.id,
});
```

## Ví dụ React Component

```jsx
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const AdminDashboard = ({ adminUser }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Kết nối socket
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    // Join admin room khi component mount
    if (adminUser && adminUser.role === "ADMIN") {
      newSocket.emit("join_admin_room", {
        userId: adminUser.id,
        userRole: adminUser.role,
      });
    }

    // Listen cho thông báo review mới
    newSocket.on("new_review_notification", (data) => {
      setNotifications((prev) => [data, ...prev]);

      // Hiển thị toast notification
      toast.success(data.message);
    });

    // Cleanup khi component unmount
    return () => {
      if (adminUser) {
        newSocket.emit("leave_admin_room", {
          userId: adminUser.id,
        });
      }
      newSocket.disconnect();
    };
  }, [adminUser]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <h2>Thông báo mới ({notifications.length})</h2>
        {notifications.map((notification, index) => (
          <div key={index} className="notification">
            <p>{notification.message}</p>
            <small>
              Sản phẩm: {notification.product.productName} | Đánh giá:{" "}
              {notification.review.rating} sao
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
```

## Lưu ý

- Chỉ user có role "ADMIN" mới có thể join vào room admin
- Thông báo sẽ được gửi đến tất cả admin đang online
- Socket connection sẽ tự động reconnect nếu bị mất kết nối
- Nên disconnect socket khi admin logout để tránh memory leak
