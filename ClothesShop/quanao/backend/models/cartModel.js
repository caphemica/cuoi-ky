import { Sequelize, DataTypes } from "sequelize";
const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

const cartModel = sequelize.define(
  "Cart",
  {
    cartUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    totalCartPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalCartQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "cart",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Cart table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default cartModel;
