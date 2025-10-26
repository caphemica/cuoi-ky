import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

// Coupon Template defines how to create coupons redeemed by user points
const couponTemplateModel = sequelize.define(
  "CouponTemplate",
  {
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("FIXED", "PERCENT"),
      allowNull: false,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxDiscount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    costPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiresInDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
    },
    usesPerCoupon: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  { tableName: "couponTemplate" }
);

sequelize
  .sync()
  .then(() => {
    console.log("CouponTemplate table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default couponTemplateModel;
