const express = require("express");

const router = express.Router();

const {
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser
} = require("../controllers/userController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


// GET ALL USERS
router.get(
    "/",
    protect,
    adminOnly,
    getAllUsers
);


// UPDATE USER STATUS
router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateUserStatus
);


// UPDATE USER ROLE
router.put(
    "/:id/role",
    protect,
    adminOnly,
    updateUserRole
);


// DELETE USER
router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteUser
);


module.exports = router;