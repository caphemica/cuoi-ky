import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

const productModel = sequelize.define(
  "Product",
  {
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productImage: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    productCountSell: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productClickView: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productPromotion: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "product",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Product table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default productModel;
