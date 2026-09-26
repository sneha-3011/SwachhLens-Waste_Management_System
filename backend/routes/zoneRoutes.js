const express = require("express");

const router = express.Router();

const {
    getAllZones,
    createZone,
    updateZone,
    updateZoneStatus,
    deleteZone
} = require("../controllers/zoneController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


// GET ALL ZONES
router.get(
    "/",
    protect,
    adminOnly,
    getAllZones
);


// CREATE ZONE
router.post(
    "/",
    protect,
    adminOnly,
    createZone
);


// UPDATE ZONE
router.put(
    "/:id",
    protect,
    adminOnly,
    updateZone
);


// UPDATE ZONE STATUS
router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateZoneStatus
);


// DELETE ZONE
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteZone
);


module.exports = router;