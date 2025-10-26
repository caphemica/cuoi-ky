import { Sequelize, DataTypes } from "sequelize";

// Kết nối tới database (giữ cùng convention với các model khác)
const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

// Model Order: lưu thông tin đơn hàng của user
// - orderUserId: id user
// - items: danh sách sản phẩm (snapshot lúc đặt hàng)
// - totalOrderPrice: tổng tiền
// - totalOrderQuantity: tổng số lượng
// - shippingAddress: địa chỉ nhận hàng
const orderModel = sequelize.define(
  "Order",
  {
    orderUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    items: {
      // [{ productId, name, price, image, quantity }]
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    totalOrderPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalOrderQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    shippingAddress: {
      // Có thể lưu object { fullName, phone, street, ward, district, city }
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
    cancelRequested: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      // Trạng thái đơn
      type: DataTypes.ENUM(
        "NEW", // 1. Đơn hàng mới
        "CONFIRMED", // 2. Đã xác nhận
        "PREPARING", // 3. Đang chuẩn bị hàng
        "SHIPPING", // 4. Đang giao hàng
        "COMPLETED", // 5. Đã giao thành công
        "CANCELLED" // 6. Hủy đơn (trong 30 phút nếu chưa chuyển chuẩn bị)
      ),
      allowNull: false,
      defaultValue: "NEW",
    },
  },
  {
    tableName: "order",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Order table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default orderModel;
