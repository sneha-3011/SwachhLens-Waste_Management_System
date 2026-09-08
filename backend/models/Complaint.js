const{ DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Complaint =  sequelize.define("Complaint", {
    id: {
        type : DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey: true
    },

    image: {
        type: DataTypes.STRING
    },

    latitude: {
        type:DataTypes.FLOAT
    },

    longitude: {
        type:DataTypes.FLOAT
    },

    comment: {
        type: DataTypes.TEXT
    },

    status: {
        type: DataTypes.ENUM(
            "Pending",
            "Assigned",
            "In progress",
            "Resolved"
        ),
        defaultValue:"Pending"
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    wasteType: {
    type: DataTypes.STRING,
    allowNull: true
    },

    wasteSize: {
        type: DataTypes.STRING,
        allowNull: true
    },

    priority: {
        type: DataTypes.STRING,
        allowNull: true
    },

    aiConfidence: {
        type: DataTypes.FLOAT,
        allowNull: true
    }
});

const User = require("./User");

Complaint.belongsTo(User, {
    foreignKey: "userId"
});

module.exports=Complaint;