const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ComplaintStatusHistory = sequelize.define(
    "ComplaintStatusHistory",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        complaintId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: "complaint_status_histories",
        timestamps: true
    }
);

module.exports = ComplaintStatusHistory;
