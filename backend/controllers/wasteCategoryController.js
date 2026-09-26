const WasteCategory = require("../models/WasteCategory");

// GET ALL WASTE CATEGORIES
const getAllWasteCategories = async (req, res) => {
    try {

        const categories = await WasteCategory.findAll({
            order: [["id", "ASC"]]
        });

        res.status(200).json({
            totalCategories: categories.length,
            categories
        });

    } catch (error) {

        console.error(
            "Get Waste Categories Error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch waste categories"
        });
    }
};


// ADD WASTE CATEGORY
const createWasteCategory = async (req, res) => {
    try {

        const { name, description, status } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory =
            await WasteCategory.findOne({
                where: {
                    name: name.trim()
                }
            });

        if (existingCategory) {
            return res.status(400).json({
                message: "Waste category already exists"
            });
        }

        const category =
            await WasteCategory.create({
                name: name.trim(),
                description: description || null,
                status: status || "Active"
            });

        res.status(201).json({
            message: "Waste category created successfully",
            category
        });

    } catch (error) {

        console.error(
            "Create Waste Category Error:",
            error
        );

        res.status(500).json({
            message: "Failed to create waste category"
        });
    }
};


// UPDATE WASTE CATEGORY
const updateWasteCategory = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, description, status } = req.body;

        const category =
            await WasteCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({
                message: "Waste category not found"
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory =
            await WasteCategory.findOne({
                where: {
                    name: name.trim()
                }
            });

        if (
            existingCategory &&
            existingCategory.id !== category.id
        ) {
            return res.status(400).json({
                message: "Another category with this name already exists"
            });
        }

        await category.update({
            name: name.trim(),
            description: description || null,
            status: status || category.status
        });

        res.status(200).json({
            message: "Waste category updated successfully",
            category
        });

    } catch (error) {

        console.error(
            "Update Waste Category Error:",
            error
        );

        res.status(500).json({
            message: "Failed to update waste category"
        });
    }
};


// UPDATE WASTE CATEGORY STATUS
const updateWasteCategoryStatus = async (req, res) => {
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

        const category =
            await WasteCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({
                message: "Waste category not found"
            });
        }

        await category.update({
            status
        });

        res.status(200).json({
            message:
                `Waste category ${status.toLowerCase()} successfully`,
            category
        });

    } catch (error) {

        console.error(
            "Update Waste Category Status Error:",
            error
        );

        res.status(500).json({
            message: "Failed to update category status"
        });
    }
};


// DELETE WASTE CATEGORY
const deleteWasteCategory = async (req, res) => {
    try {

        const { id } = req.params;

        const category =
            await WasteCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({
                message: "Waste category not found"
            });
        }

        await category.destroy();

        res.status(200).json({
            message: "Waste category deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Waste Category Error:",
            error
        );

        res.status(500).json({
            message: "Failed to delete waste category"
        });
    }
};


module.exports = {
    getAllWasteCategories,
    createWasteCategory,
    updateWasteCategory,
    updateWasteCategoryStatus,
    deleteWasteCategory
};