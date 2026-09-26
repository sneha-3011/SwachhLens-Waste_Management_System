const Zone = require("../models/Zone");
const Ward = require("../models/Ward");

// GET ALL ZONES
const getAllZones = async (req, res) => {
    try {

        const zones = await Zone.findAll({
            include: [
                {
                    model: Ward,
                    attributes: [
                        "id",
                        "wardNumber",
                        "name",
                        "description",
                        "status"
                    ]
                }
            ],
            order: [["id", "ASC"]]
        });

        res.status(200).json({
            totalZones: zones.length,
            zones
        });

    } catch (error) {

        console.error("Get Zones Error:", error);

        res.status(500).json({
            message: "Failed to fetch zones"
        });
    }
};


// ADD ZONE
const createZone = async (req, res) => {
    try {

        const { name, description, status } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Zone name is required"
            });
        }

        const existingZone = await Zone.findOne({
            where: {
                name: name.trim()
            }
        });

        if (existingZone) {
            return res.status(400).json({
                message: "Zone already exists"
            });
        }

        const zone = await Zone.create({
            name: name.trim(),
            description: description || null,
            status: status || "Active"
        });

        res.status(201).json({
            message: "Zone created successfully",
            zone
        });

    } catch (error) {

        console.error("Create Zone Error:", error);

        res.status(500).json({
            message: "Failed to create zone"
        });
    }
};


// UPDATE ZONE
const updateZone = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, description, status } = req.body;

        const zone = await Zone.findByPk(id);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Zone name is required"
            });
        }

        const existingZone = await Zone.findOne({
            where: {
                name: name.trim()
            }
        });

        if (
            existingZone &&
            existingZone.id !== zone.id
        ) {
            return res.status(400).json({
                message: "Another zone with this name already exists"
            });
        }

        await zone.update({
            name: name.trim(),
            description: description || null,
            status: status || zone.status
        });

        res.status(200).json({
            message: "Zone updated successfully",
            zone
        });

    } catch (error) {

        console.error("Update Zone Error:", error);

        res.status(500).json({
            message: "Failed to update zone"
        });
    }
};


// UPDATE ZONE STATUS
const updateZoneStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Active",
            "Inactive"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const zone = await Zone.findByPk(id);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found"
            });
        }

        await zone.update({
            status
        });

        res.status(200).json({
            message:
                `Zone ${status.toLowerCase()} successfully`,
            zone
        });

    } catch (error) {

        console.error(
            "Update Zone Status Error:",
            error
        );

        res.status(500).json({
            message: "Failed to update zone status"
        });
    }
};


// DELETE ZONE
const deleteZone = async (req, res) => {
    try {

        const { id } = req.params;

        const zone = await Zone.findByPk(id);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found"
            });
        }

        await zone.destroy();

        res.status(200).json({
            message: "Zone deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Zone Error:",
            error
        );

        res.status(500).json({
            message: "Failed to delete zone"
        });
    }
};


module.exports = {
    getAllZones,
    createZone,
    updateZone,
    updateZoneStatus,
    deleteZone
};