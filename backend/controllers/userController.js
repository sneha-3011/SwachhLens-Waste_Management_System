const User = require("../models/User");

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: {
                exclude: ["password"]
            },
            order: [["id", "ASC"]]
        });

        res.status(200).json({
            totalUsers: users.length,
            users
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


// UPDATE USER STATUS
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Active",
            "Inactive"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent admin from deactivating themselves
        if (user.id === req.user.id) {
            return res.status(400).json({
                message: "You cannot change your own account status"
            });
        }

        await user.update({
            status
        });

        res.status(200).json({
            message: `User ${status.toLowerCase()} successfully`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Update User Status Error:", error);

        res.status(500).json({
            message: "Failed to update user status"
        });
    }
};


// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const allowedRoles = [
            "citizen",
            "staff",
            "admin"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent admin from changing their own role
        if (user.id === req.user.id) {
            return res.status(400).json({
                message: "You cannot change your own role"
            });
        }

        await user.update({
            role
        });

        res.status(200).json({
            message: "User role updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("Update User Role Error:", error);

        res.status(500).json({
            message: "Failed to update user role"
        });
    }
};


// DELETE USER
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent admin from deleting themselves
        if (user.id === req.user.id) {
            return res.status(400).json({
                message: "You cannot delete your own account"
            });
        }

        await user.destroy();

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete User Error:", error);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
};


module.exports = {
    getAllUsers,
    updateUserStatus,
    updateUserRole,
    deleteUser
};