const Complaint = require("../models/Complaint");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const Notification = require("../models/Notification");
const ComplaintStatusHistory = require("../models/ComplaintStatusHistory");

const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "email"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.json({
            totalComplaints: complaints.length,
            complaints
        });

    } catch (error) {
        console.error("Get Complaints Error:", error);

        res.status(500).json({
            message: "Failed to fetch complaints"
        });
    }
};

const updateComplaintStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Resolved",
            "Rejected"
        ];

        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message: "Invalid status"
            });

        }


        const complaint = await Complaint.findByPk(id);

        if (!complaint) {

            return res.status(404).json({
                message: "Complaint not found"
            });

        }


        const oldStatus = complaint.status;

        await complaint.update({
            status
        });

        
        const historyRecord = await ComplaintStatusHistory.create({
    complaintId: complaint.id,
    status: status
});

console.log(
    "========== HISTORY CREATED =========="
);

console.log(
    historyRecord.toJSON()
);

console.log(
    "====================================="
);



        // Create in-app notification
        if (oldStatus !== status) {

            await Notification.create({
                message:
                    `Your complaint #${complaint.id} status has been updated to ${complaint.status}.`,
                userId: complaint.userId,
                complaintId: complaint.id
            });

        }


        // Get citizen who submitted the complaint
        const user = await User.findByPk(
            complaint.userId
        );


        // Send email to citizen
        // Send email only when status actually changes
        if (
            user &&
            user.email &&
            oldStatus !== status
        ) {

            try {

                await sendEmail(

                    user.email,

                    "SwachhLens Complaint Status Update",

                    `Hello,

                        Your SwachhLens complaint #${complaint.id} has been updated.

                        New Status: ${complaint.status}

                        Thank you for helping keep your community clean.

                        - SwachhLens Team
                    `

                );

            } catch (emailError) {

                console.error(
                    "Notification Email Error:",
                    emailError
                );

            }

        }


        res.json({

            message:
                "Complaint status updated successfully",

            complaint: {

                id: complaint.id,

                status: complaint.status

            }

        });


    } catch (error) {

        console.error(
            "Update Status Error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to update complaint status"

        });

    }

};


const getDashboardStats = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            attributes: ["status", "priority"]
        });

        const totalComplaints = complaints.length;

        const pending = complaints.filter(
            c => c.status === "Pending"
        ).length;

        const inProgress = complaints.filter(
            c => c.status === "In Progress"
        ).length;

        const resolved = complaints.filter(
            c => c.status === "Resolved"
        ).length;

        const highPriority = complaints.filter(
            c =>
                c.priority === "High" ||
                c.priority === "Critical"
        ).length;

        res.json({
            totalComplaints,
            pending,
            inProgress,
            resolved,
            highPriority
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);

        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
};


module.exports = {
    getAllComplaints,
    updateComplaintStatus,
    getDashboardStats
};