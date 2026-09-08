const User = require("../models/User");
const Complaint = require("../models/Complaint");

const getLeaderboard = async (req, res) => {

    try {

        const users = await User.findAll({
            include: [
                {
                    model: Complaint,
                    attributes: ["id"]
                }
            ]
        });

        const leaderboard = users.map(user => ({
            id: user.id,
            name: user.name,
            totalComplaints: user.Complaints.length
        }));

        leaderboard.sort(
            (a, b) =>
                b.totalComplaints -
                a.totalComplaints
        );

        res.json({
            leaderboard
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load leaderboard"
        });

    }

};

module.exports = {
    getLeaderboard
};