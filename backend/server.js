const express = require("express");
const path = require("path");
const cors = require("cors");
const authRoutes=require("./routes/authRoutes");
console.log("AUTH ROUTES:", authRoutes);
require("dotenv").config();

const { sequelize, connectDB } = require("./config/database");
const User = require("./models/User");
const Complaint=require("./models/Complaint");
const complaintRoutes = require("./routes/complaintRoutes");
const sendEmail = require("./utils/sendEmail");
const notificationRoutes = require("./routes/notificationRoutes");
const ComplaintStatusHistory = require("./models/ComplaintStatusHistory");
const leaderboardRoutes = require("./routes/leaderboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

app.use(
    "/api/leaderboard",
    leaderboardRoutes
);

app.get("/", (req, res) => {
    res.json({
        message: "SwachhLens Backend is running"
    });
});

app.get("/test-email", async (req, res) => {

    try {

        await sendEmail(
            "swachhlensproject@gmail.com",
            "SwachhLens Email Test",
            "This is a test email from SwachhLens."
        );

        res.json({
            message: "Test email sent successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to send test email"
        });

    }

});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    await sequelize.sync();

    console.log("Database tables synchronized");

    app.listen(PORT, () => {
        console.log(`SwachhLens server running on port ${PORT}`);
    });
};

startServer();