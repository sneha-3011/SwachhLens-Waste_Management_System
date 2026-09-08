
const express = require("express");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    getMyNotifications,
    markNotificationAsRead
} = require("../controllers/notificationController");


const router = express.Router();


// Get citizen notifications
router.get(
    "/my",
    protect,
    getMyNotifications
);


// Mark notification as read
router.put(
    "/:id/read",
    protect,
    markNotificationAsRead
);


module.exports = router;
