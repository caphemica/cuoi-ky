import { Sequelize, DataTypes } from "sequelize";
const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

const promotionScoreModel = sequelize.define(
  "PromotionScore",
  {
    promotionScoreUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalPromotionScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "promotionScore",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("PromotionScore table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default promotionScoreModel;
