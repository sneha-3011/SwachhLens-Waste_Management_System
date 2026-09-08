const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfileImage } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/register", register);
router.post("/login", login);

router.get("/profile",protect, getProfile);
router.put(
    "/profile/image",
    protect,
    upload.single("profileImage"),
    updateProfileImage
);

module.exports = router;