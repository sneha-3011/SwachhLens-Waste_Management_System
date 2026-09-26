const Zone = require("./Zone");
const Ward = require("./Ward");

Zone.hasMany(Ward, {
    foreignKey: "zoneId",
    onDelete: "CASCADE"
});

Ward.belongsTo(Zone, {
    foreignKey: "zoneId"
});

module.exports = {
    Zone,
    Ward
};