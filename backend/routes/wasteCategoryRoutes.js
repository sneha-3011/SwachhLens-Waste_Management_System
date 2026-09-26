const express = require("express");

const router = express.Router();

const {
    getAllWasteCategories,
    createWasteCategory,
    updateWasteCategory,
    updateWasteCategoryStatus,
    deleteWasteCategory
} = require("../controllers/wasteCategoryController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


// GET ALL WASTE CATEGORIES
router.get(
    "/",
    protect,
    adminOnly,
    getAllWasteCategories
);


// ADD WASTE CATEGORY
router.post(
    "/",
    protect,
    adminOnly,
    createWasteCategory
);


// UPDATE WASTE CATEGORY
router.put(
    "/:id",
    protect,
    adminOnly,
    updateWasteCategory
);


// UPDATE CATEGORY STATUS
router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateWasteCategoryStatus
);


// DELETE WASTE CATEGORY
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteWasteCategory
);


module.exports = router;