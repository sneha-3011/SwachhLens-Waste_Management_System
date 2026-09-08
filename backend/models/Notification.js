
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Notification = sequelize.define(
    "Notification",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        message: {
            type: DataTypes.STRING,
            allowNull: false
        },

        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        complaintId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }
);

module.exports = Notification;
