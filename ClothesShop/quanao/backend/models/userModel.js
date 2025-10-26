import { Sequelize, DataTypes } from "sequelize";

// Tạo kết nối đến database MySQL
const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

const userModel = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cartData: {
      type: DataTypes.JSON, // Dùng kiểu JSON để lưu object
      defaultValue: {},
    },
    codeID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    codeExpired: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    },
  },
  {
    // Tên bảng trong database sẽ là 'user'
    tableName: "user",
  }
);

// Đồng bộ model với database (tạo bảng nếu chưa tồn tại)
sequelize
  .sync()
  .then(() => {
    console.log("User table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default userModel;
