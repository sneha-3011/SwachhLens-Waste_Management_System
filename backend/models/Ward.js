const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Ward = sequelize.define("Ward", {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    wardNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Active"
    },

    zoneId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

});

module.exports = Ward;