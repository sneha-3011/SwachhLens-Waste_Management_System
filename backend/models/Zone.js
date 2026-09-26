const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Zone = sequelize.define("Zone", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Active"
    }

});

module.exports = Zone;