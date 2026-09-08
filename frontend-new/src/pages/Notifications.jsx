
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();


    // ==========================================
    // FETCH NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async () => {

        try {

            const token =
                localStorage.getItem("token");


            const response = await axios.get(
                "http://localhost:5000/api/notifications/my",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            console.log(
                "NOTIFICATIONS:",
                response.data
            );


            setNotifications(
                response.data.notifications || []
            );


        } catch (error) {

            console.error(
                "Notification Error:",
                error.response?.data ||
                error.message
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchNotifications();

    }, []);


    // ==========================================
    // MARK AS READ
    // ==========================================

    const markAsRead = async (id) => {

        try {

            const token =
                localStorage.getItem("token");


            await axios.put(
                `http://localhost:5000/api/notifications/${id}/read`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            setNotifications(
                previousNotifications =>
                    previousNotifications.map(
                        notification =>
                            notification.id === id
                                ? {
                                    ...notification,
                                    isRead: true
                                }
                                : notification
                    )
            );


        } catch (error) {

            console.error(
                "Mark Read Error:",
                error.response?.data ||
                error.message
            );

        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <h2>
                Loading notifications...
            </h2>
        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div
            style={{
                padding: "20px",
                maxWidth: "800px",
                margin: "auto"
            }}
        >

            <h1>
                🔔 Notifications
            </h1>


            <hr />


            {notifications.length === 0 ? (

                <p>
                    No notifications yet.
                </p>

            ) : (

                notifications.map(
                    (notification) => (

                        <div
                            key={notification.id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "15px",
                                marginBottom: "10px",
                                backgroundColor:
                                    notification.isRead
                                        ? "#ffffff"
                                        : "#eef6ff"
                            }}
                        >

                            <p>

                                {notification.message}

                            </p>


                            <small>

                                {notification.createdAt
                                    ? new Date(
                                        notification.createdAt
                                    ).toLocaleString()
                                    : ""}

                            </small>


                            <br />
                            <br />


                            {!notification.isRead && (

                                <button
                                    onClick={() =>
                                        markAsRead(
                                            notification.id
                                        )
                                    }
                                >
                                    Mark as Read
                                </button>

                            )}


                            <button
                                style={{
                                    marginLeft: "10px"
                                }}
                                onClick={async () => {

                                    if (!notification.isRead) {
                                        await markAsRead(notification.id);
                                    }

                                    navigate(
                                        `/complaint/${notification.complaintId}`
                                    );

                                }}
                            >
                                View Complaint
                            </button>

                        </div>

                    )
                )

            )}


            <br />


            <button
                onClick={() =>
                    navigate("/citizen")
                }
            >
                Back to Dashboard
            </button>

        </div>

    );

}


export default Notifications;
