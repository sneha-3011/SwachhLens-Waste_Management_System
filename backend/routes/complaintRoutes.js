const express = require("express");

const upload = require("../middleware/upload");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const {
    createComplaint,
    getComplaintById,
    getMyComplaints,
    getComplaintHistory,
    deleteComplaint
} = require("../controllers/complaintController");

const {
    analyzeComplaint
} = require("../controllers/aiController");

const {
    checkDuplicate
} = require("../controllers/duplicateController");

const {
    getHotspots
} = require("../controllers/hotspotController");

const {
    getAllComplaints,
    updateComplaintStatus,
    getDashboardStats
} = require("../controllers/adminController");


const router = express.Router();


// ========================================
// CREATE COMPLAINT
// ========================================

router.post(
    "/create",
    protect,
    upload.single("image"),
    createComplaint
);


// ========================================
// MY COMPLAINTS
// ========================================

router.get(
    "/my",
    protect,
    getMyComplaints
);


// ========================================
// ADMIN - ALL COMPLAINTS
// IMPORTANT: Keep before /:id
// ========================================

router.get(
    "/all",
    protect,
    adminOnly,
    getAllComplaints
);


// ========================================
// ADMIN - DASHBOARD STATISTICS
// ========================================

router.get(
    "/dashboard/stats",
    protect,
    adminOnly,
    getDashboardStats
);


// ========================================
// HOTSPOTS
// Keep before /:id
// ========================================

router.get(
    "/hotspots",
    protect,
    getHotspots
);


// ========================================
// AI ANALYSIS
// ========================================

router.post(
    "/:id/analyze",
    protect,
    analyzeComplaint
);


// ========================================
// DUPLICATE CHECK
// ========================================

router.get(
    "/:id/duplicate",
    protect,
    checkDuplicate
);


// ========================================
// ADMIN - UPDATE STATUS
// ========================================

router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateComplaintStatus
);


// ========================================
// GET SINGLE COMPLAINT
// IMPORTANT: Keep this near the bottom
// ========================================

router.get(
    "/:id/history",
    protect,
    getComplaintHistory
);

router.get(
    "/:id",
    protect,
    getComplaintById
);

router.delete(
    "/:id",
    protect,
    deleteComplaint
);




module.exports = router;