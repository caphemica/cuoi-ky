import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

const reviewModel = sequelize.define(
  "Review",
  {
    reviewUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reviewProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reviewOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
  },
  {
    tableName: "review",
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Review table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default reviewModel;
