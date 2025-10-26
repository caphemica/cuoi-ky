import { Sequelize, DataTypes } from "sequelize";

// Keep same convention as other models: create a dedicated Sequelize instance
const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

// Coupon model: coupons are created per-user when redeemed using promotion points
// - code: unique coupon code string
// - ownerUserId: user id who owns the coupon
// - type: FIXED | PERCENT
// - value: integer. For FIXED, currency amount; for PERCENT, percentage (e.g., 10 = 10%)
// - minOrder: minimum order subtotal to apply
// - maxDiscount: optional cap for percentage coupons (0 = no cap)
// - expiresAt: expiration datetime
// - usesRemaining: number of uses left (default 1)
const couponModel = sequelize.define(
  "Coupon",
  {
    code: {
      type: DataTypes.STRING(64),
      unique: true,
      allowNull: false,
    },
    ownerUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("FIXED", "PERCENT"),
      allowNull: false,
      defaultValue: "FIXED",
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usesRemaining: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "coupon",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Coupon table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default couponModel;
