
const Notification = require("../models/Notification");


// ==========================================
// GET MY NOTIFICATIONS
// ==========================================

const getMyNotifications = async (req, res) => {

    try {

        const notifications =
            await Notification.findAll({

                where: {
                    userId: req.user.id
                },

                order: [
                    ["createdAt", "DESC"]
                ]

            });


        res.json({

            notifications

        });


    } catch (error) {

        console.error(
            "Get Notifications Error:",
            error
        );


        res.status(500).json({

            message:
                "Failed to fetch notifications"

        });

    }

};


// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================

const markNotificationAsRead =
    async (req, res) => {

        try {

            const notification =
                await Notification.findOne({

                    where: {

                        id: req.params.id,

                        userId: req.user.id

                    }

                });


            if (!notification) {

                return res.status(404).json({

                    message:
                        "Notification not found"

                });

            }


            await notification.update({

                isRead: true

            });


            res.json({

                message:
                    "Notification marked as read",

                notification

            });


        } catch (error) {

            console.error(
                "Mark Notification Error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to update notification"

            });

        }

    };


module.exports = {

    getMyNotifications,

    markNotificationAsRead

};
