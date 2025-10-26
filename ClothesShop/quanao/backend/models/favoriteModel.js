import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("uteshop", "root", "123456", {
  host: "localhost",
  dialect: "mysql",
});

const favoriteModel = sequelize.define(
  "Favorite",
  {
    favoriteUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    favoriteProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "favorite",
    indexes: [
      {
        unique: true,
        fields: ["favoriteUserId", "favoriteProductId"],
      },
    ],
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Favorite table has been created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table:", error);
  });

export default favoriteModel;
