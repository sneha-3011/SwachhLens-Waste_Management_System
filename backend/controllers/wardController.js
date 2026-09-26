const Ward = require("../models/Ward");
const Zone = require("../models/Zone");

// GET ALL WARDS
const getAllWards = async (req, res) => {
    try {

        const wards = await Ward.findAll({
            include: [
                {
                    model: Zone,
                    attributes: [
                        "id",
                        "name"
                    ]
                }
            ],
            order: [["id", "ASC"]]
        });

        res.status(200).json({
            totalWards: wards.length,
            wards
        });

    } catch (error) {

        console.error("Get Wards Error:", error);

        res.status(500).json({
            message: "Failed to fetch wards"
        });
    }
};


// GET WARDS BY ZONE
const getWardsByZone = async (req, res) => {
    try {

        const { zoneId } = req.params;

        const zone = await Zone.findByPk(zoneId);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found"
            });
        }

        const wards = await Ward.findAll({
            where: {
                zoneId
            },
            order: [["id", "ASC"]]
        });

        res.status(200).json({
            zone,
            totalWards: wards.length,
            wards
        });

    } catch (error) {

        console.error(
            "Get Wards By Zone Error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch wards"
        });
    }
};


// ADD WARD
const createWard = async (req, res) => {
    try {

        const {
            wardNumber,
            name,
            description,
            status,
            zoneId
        } = req.body;


        if (!wardNumber || !wardNumber.trim()) {
            return res.status(400).json({
                message: "Ward number is required"
            });
        }


        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Ward name is required"
            });
        }


        if (!zoneId) {
            return res.status(400).json({
                message: "Zone is required"
            });
        }


        const zone = await Zone.findByPk(zoneId);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found"
            });
        }


        const existingWard = await Ward.findOne({
            where: {
                wardNumber: wardNumber.trim(),
                zoneId
            }
        });


        if (existingWard) {
            return res.status(400).json({
                message:
                    "Ward number already exists in this zone"
            });
        }


        const ward = await Ward.create({

            wardNumber: wardNumber.trim(),

            name: name.trim(),

            description:
                description || null,

            status:
                status || "Active",

            zoneId

        });


        res.status(201).json({

            message:
                "Ward created successfully",

            ward

        });

    } catch (error) {

        console.error(
            "Create Ward Error:",
            error
        );

        res.status(500).json({
            message: "Failed to create ward"
        });
    }
};


// UPDATE WARD
const updateWard = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            wardNumber,
            name,
            description,
            status,
            zoneId
        } = req.body;


        const ward = await Ward.findByPk(id);

        if (!ward) {
            return res.status(404).json({
                message: "Ward not found"
            });
        }


        if (!wardNumber || !wardNumber.trim()) {
            return res.status(400).json({
                message: "Ward number is required"
            });
        }


        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Ward name is required"
            });
        }


        if (!zoneId) {
            return res.status(400).json({
                message: "Zone is required"
            });
        }


        const zone = await Zone.findByPk(zoneId);

        if (!zone) {
            return res.status(404).json({
                message: "Zone not found"
            });
        }


        const existingWard = await Ward.findOne({
            where: {
                wardNumber: wardNumber.trim(),
                zoneId
            }
        });


        if (
            existingWard &&
            existingWard.id !== ward.id
        ) {
            return res.status(400).json({
                message:
                    "Another ward with this number already exists in this zone"
            });
        }


        await ward.update({

            wardNumber:
                wardNumber.trim(),

            name:
                name.trim(),

            description:
                description || null,

            status:
                status || ward.status,

            zoneId

        });


        res.status(200).json({

            message:
                "Ward updated successfully",

            ward

        });

    } catch (error) {

        console.error(
            "Update Ward Error:",
            error
        );

        res.status(500).json({
            message: "Failed to update ward"
        });
    }
};


// UPDATE WARD STATUS
const updateWardStatus = async (req, res) => {
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


        const ward = await Ward.findByPk(id);

        if (!ward) {
            return res.status(404).json({
                message: "Ward not found"
            });
        }


        await ward.update({
            status
        });


        res.status(200).json({

            message:
                `Ward ${status.toLowerCase()} successfully`,

            ward

        });

    } catch (error) {

        console.error(
            "Update Ward Status Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to update ward status"
        });
    }
};


// DELETE WARD
const deleteWard = async (req, res) => {
    try {

        const { id } = req.params;

        const ward = await Ward.findByPk(id);

        if (!ward) {
            return res.status(404).json({
                message: "Ward not found"
            });
        }


        await ward.destroy();


        res.status(200).json({
            message:
                "Ward deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Ward Error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to delete ward"
        });
    }
};


module.exports = {
    getAllWards,
    getWardsByZone,
    createWard,
    updateWard,
    updateWardStatus,
    deleteWard

};