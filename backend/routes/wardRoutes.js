const express = require("express");

const router = express.Router();

const {
    getAllWards,
    getWardsByZone,
    createWard,
    updateWard,
    updateWardStatus,
    deleteWard
} = require("../controllers/wardController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


router.get(
    "/",
    protect,
    adminOnly,
    getAllWards
);


router.get(
    "/zone/:zoneId",
    protect,
    adminOnly,
    getWardsByZone
);


router.post(
    "/",
    protect,
    adminOnly,
    createWard
);


router.put(
    "/:id",
    protect,
    adminOnly,
    updateWard
);


router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateWardStatus
);


router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteWard
);


module.exports = router;