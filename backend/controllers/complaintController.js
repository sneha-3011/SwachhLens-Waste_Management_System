const Complaint = require("../models/Complaint");


// ===============================
// CREATE COMPLAINT
// ===============================

const createComplaint = async (req, res) => {

    try {

        const {
            latitude,
            longitude,
            comment
        } = req.body;


        const image = req.file
            ? req.file.filename
            : null;


        console.log("BODY:", req.body);
        console.log("USER:", req.user);
        console.log("FILE:", req.file);


        const complaint = await Complaint.create({

            image,
            latitude,
            longitude,
            comment,
            userId: req.user.id

        });


        res.status(201).json({

            message: "Complaint created successfully",

            complaint

        });


    } catch (error) {

        console.error(
            "Complaint Error:",
            error
        );


        res.status(500).json({

            message: "Failed to create complaint"

        });

    }

};


// ===============================
// GET COMPLAINT BY ID
// ===============================

const getComplaintById = async (req, res) => {

    try {

        const complaint =
            await Complaint.findByPk(
                req.params.id
            );


        if (!complaint) {

            return res.status(404).json({

                message: "Complaint not found"

            });

        }


        res.json(complaint);


    } catch (error) {

        console.error(
            "Get Complaint Error:",
            error
        );


        res.status(500).json({

            message: error.message

        });

    }

};

const getMyComplaints = async (req, res) => {

    try {

        const complaints = await Complaint.findAll({
            where: {
                userId: req.user.id
            }
        });

        res.json({
            complaints
        });

    } catch (error) {

        console.error(
            "My Complaints Error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch complaints"
        });

    }

};


const ComplaintStatusHistory =
    require("../models/ComplaintStatusHistory");


const getComplaintHistory = async (req, res) => {

    try {

        const history =
            await ComplaintStatusHistory.findAll({

                where: {
                    complaintId: req.params.id
                },

                order: [
                    ["createdAt", "ASC"]
                ]

            });


        res.json({
            history
        });


    } catch (error) {

        console.error(
            "Complaint History Error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch complaint history"

        });

    }

};


const deleteComplaint = async (req, res) => {

    try {

        const complaintId = req.params.id;

        const complaint = await Complaint.findByPk(
            complaintId
        );

        // Complaint doesn't exist
        if (!complaint) {
            return res.status(404).json({
                message: "Complaint not found"
            });
        }


        // Make sure user owns this complaint
        if (complaint.userId !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own complaints"
            });
        }


        // Optional: only allow deleting pending complaints
        if (complaint.status?.toLowerCase() !== "pending") {
            return res.status(400).json({
                message:
                    "Only pending complaints can be deleted"
            });
        }


        await complaint.destroy();


        res.status(200).json({
            message:
                "Complaint deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Complaint Error:",
            error
        );

       return res.status(500).json({
            message:
                "Failed to delete complaint",
            error: error.message
        });

    }
};


// ===============================
// EXPORT
// ===============================

module.exports = {

    createComplaint,
    getComplaintById,
    getMyComplaints,
    getComplaintHistory,
    deleteComplaint

};