const Complaint = require("../models/Complaint");
const { Op } = require("sequelize");

const checkDuplicate = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await Complaint.findByPk(id);

        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }

        const latitude = parseFloat(complaint.latitude);
        const longitude = parseFloat(complaint.longitude);

        const tolerance = 0.001;

        const nearbyComplaints = await Complaint.findAll({
            where: {
                id: {
                    [Op.ne]: id
                },
                latitude: {
                    [Op.between]: [
                        latitude - tolerance,
                        latitude + tolerance
                    ]
                },
                longitude: {
                    [Op.between]: [
                        longitude - tolerance,
                        longitude + tolerance
                    ]
                }
            }
        });

        const isDuplicate = nearbyComplaints.length > 0;

        res.json({
            complaintId: id,
            isDuplicate,
            duplicateCount: nearbyComplaints.length,
            nearbyComplaints: nearbyComplaints.map(c => c.id)
        });

    } catch (error) {
        console.error("Duplicate Detection Error:", error);

        res.status(500).json({
            message: "Duplicate detection failed"
        });
    }
};

module.exports = { checkDuplicate };