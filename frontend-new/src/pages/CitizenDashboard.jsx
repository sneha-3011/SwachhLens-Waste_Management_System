import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CitizenDashboard.css";

function CitizenDashboard() {

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [locationNames, setLocationNames] = useState({});

    const navigate = useNavigate();


    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    const fetchDashboardData = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("token");


            // ==================================
            // FETCH MY COMPLAINTS
            // ==================================

            const complaintResponse = await axios.get(
                "http://localhost:5000/api/complaints/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            console.log(
                "MY COMPLAINTS:",
                complaintResponse.data
            );


            const fetchedComplaints = complaintResponse.data.complaints || [];

            setComplaints(fetchedComplaints);


            // ==================================
            // GET READABLE LOCATION NAMES
            // ==================================

            fetchedComplaints.forEach(async (complaint) => {
                if (complaint.location) {

                    setLocationNames(prev => ({
                        ...prev,
                        [complaint.id]: complaint.location
                    }));

                    return;
                }

                if (
                    complaint.latitude &&
                    complaint.longitude
                ) {

                    const locationName = await getLocationName(
                        complaint.latitude,
                        complaint.longitude
                    );

                    setLocationNames(prev => ({
                        ...prev,
                        [complaint.id]: locationName
                    }));
                }

            });


            // ==================================
            // FETCH NOTIFICATIONS
            // ==================================

            const notificationResponse =
                await axios.get(
                    "http://localhost:5000/api/notifications/my",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            console.log(
                "MY NOTIFICATIONS:",
                notificationResponse.data
            );


            const notifications =
                notificationResponse.data.notifications || [];


            // ==================================
            // COUNT UNREAD NOTIFICATIONS
            // ==================================

            const unread =
                notifications.filter(
                    notification =>
                        !notification.isRead
                ).length;


            setUnreadCount(unread);


        } catch (error) {

            console.error(
                "Dashboard Fetch Error:",
                error.response?.data ||
                error.message
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // CONVERT LATITUDE/LONGITUDE TO LOCATION
    // ==========================================

    const getLocationName = async (latitude, longitude) => {

        try {

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );

            const data = await response.json();

            return data.display_name || "Location unavailable";

        } catch (error) {

            console.error(
                "Location conversion error:",
                error
            );

            return "Location unavailable";
        }

    };


    // ==========================================
    // DELETE COMPLAINT
    // ==========================================

    const handleDeleteComplaint = async (complaintId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this complaint?"
        );

        if (!confirmDelete) {
            return;
        }


        try {

            const token =
                localStorage.getItem("token");


            await axios.delete(
                `http://localhost:5000/api/complaints/${complaintId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            // Remove deleted complaint from UI
            setComplaints(prevComplaints =>
                prevComplaints.filter(
                    complaint =>
                        complaint.id !== complaintId
                )
            );


            // Also remove its stored location
            setLocationNames(prev => {

                const updated = { ...prev };

                delete updated[complaintId];

                return updated;
            });


            alert(
                "Complaint deleted successfully."
            );


        } catch (error) {

            console.error(
                "Delete Complaint Error:",
                error.response?.data ||
                error.message
            );


            alert(
                error.response?.data?.message ||
                "Failed to delete complaint."
            );

        }

    };


    // ==========================================
    // LOAD DASHBOARD
    // ==========================================

    useEffect(() => {

        fetchDashboardData();

    }, []);


    // ==========================================
    // STATUS STYLE
    // ==========================================

    const getStatusClass = (status) => {

        const normalizedStatus =
            (status || "").toLowerCase();


        if (normalizedStatus === "pending") {

            return "status status-pending";

        }


        if (
            normalizedStatus === "in progress" ||
            normalizedStatus === "inprogress"
        ) {

            return "status status-progress";

        }


        if (normalizedStatus === "resolved") {

            return "status status-resolved";

        }


        if (normalizedStatus === "rejected") {

            return "status status-rejected";

        }


        return status;

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <h2>
                Loading complaints...
            </h2>
        );

    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="citizen-dashboard">


            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <header className="citizen-header">

                <div
                    className="citizen-logo"
                    onClick={() =>
                        navigate("/citizen")
                    }
                >
                    SwachhLens
                </div>


                <nav className="citizen-nav">


                    <button
                        className="nav-btn active"
                        onClick={() =>
                            navigate("/citizen")
                        }
                    >
                        My Complaints
                    </button>


                    {/* ================================= */}
                    {/* BUTTONS */}
                    {/* ================================= */}

                    <button
                        className="nav-btn create-nav-btn"
                        onClick={() =>
                            navigate(
                                "/create-complaint"
                            )
                        }
                    >
                        Create Complaint
                    </button>


                    <button
                        className="nav-btn"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        My Profile
                    </button>


                    <button
                        className="nav-btn notification-btn"
                        onClick={() =>
                            navigate(
                                "/notifications"
                            )
                        }
                    >
                        Notifications

                        {unreadCount > 0 && (
                            <span className="notification-badge">
                                {unreadCount}
                            </span>
                        )}

                    </button>


                </nav>

            </header>


            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <main className="citizen-content">


                <div className="complaints-heading">

                    <h1>
                        My Complaints
                    </h1>

                    <p>
                        Track and manage your submitted complaints
                    </p>

                </div>


                {/* ================================= */}
                {/* COMPLAINTS EXIST */}
                {/* ================================= */}

                {complaints.length > 0 ? (

                    <>

                        <div className="complaint-actions">

                            <button
                                className="main-create-btn"
                                onClick={() =>
                                    navigate(
                                        "/create-complaint"
                                    )
                                }
                            >
                                <span className="plus-icon">
                                    +
                                </span>
                                Create complaint
                            </button>

                        </div>


                        {/* ================================= */}
                        {/* COMPLAINTS TABLE */}
                        {/* ================================= */}

                        <div className="complaints-container">

                            <div className="table-wrapper">

                                <table className="complaints-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Image
                                            </th>

                                            <th>
                                                Location
                                            </th>

                                            <th>
                                                Comment
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Waste Type
                                            </th>

                                            <th>
                                                Waste Size
                                            </th>

                                            <th>
                                                Priority
                                            </th>

                                            <th>
                                                Action
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {complaints.map(
                                            (complaint) => (

                                                <tr
                                                    key={
                                                        complaint.id
                                                    }
                                                >


                                                    {/* ID */}

                                                    <td>
                                                        {
                                                            complaint.id
                                                        }
                                                    </td>


                                                    {/* IMAGE */}

                                                    <td>

                                                        {complaint.image ? (

                                                            <img
                                                                src={`http://localhost:5000/uploads/${complaint.image}`}
                                                                alt="Complaint"
                                                                className="complaint-image"
                                                            />

                                                        ) : (

                                                            "No image"

                                                        )}

                                                    </td>


                                                    {/* LOCATION */}

                                                    <td>

                                                        <div className="complaint-location">

                                                            <span>

                                                                {
                                                                    locationNames[
                                                                        complaint.id
                                                                    ] ||
                                                                    complaint.location ||
                                                                    "Detecting location..."
                                                                }

                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* COMMENT */}

                                                    <td>

                                                        {
                                                            complaint.comment ||
                                                            "No comment"
                                                        }

                                                    </td>


                                                    {/* STATUS */}

                                                    <td>

                                                        <span
                                                            className={getStatusClass(
                                                                complaint.status
                                                            )}
                                                        >

                                                            {
                                                                complaint.status
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* WASTE TYPE */}

                                                    <td>

                                                        {
                                                            complaint.wasteType ||
                                                            "Not analyzed"
                                                        }

                                                    </td>


                                                    {/* WASTE SIZE */}

                                                    <td>

                                                        {
                                                            complaint.wasteSize ||
                                                            "Not analyzed"
                                                        }

                                                    </td>


                                                    {/* PRIORITY */}

                                                    <td>

                                                        {
                                                            complaint.priority ||
                                                            "Not analyzed"
                                                        }

                                                    </td>


                                                    {/* ACTION */}

                                                    <td>

                                                        <div className="action-buttons">


                                                            {/* VIEW DETAILS */}

                                                            <button
                                                                className="view-btn"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/complaint/${complaint.id}`
                                                                    )
                                                                }
                                                            >
                                                                View Details
                                                            </button>


                                                            {/* DELETE */}

                                                            {complaint.status?.toLowerCase() ===
                                                                "pending" && (

                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() =>
                                                                        handleDeleteComplaint(
                                                                            complaint.id
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>

                                                            )}

                                                        </div>

                                                    </td>


                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </>

                ) : (

                    /* ================================= */
                    /* NO COMPLAINTS */
                    /* ================================= */

                    <div className="no-complaints">

                        <div className="no-complaints-icon">
                        </div>


                        <h2>
                            No Complaints Yet
                        </h2>


                        <p>
                            Start by reporting an issue in your area to help our community clean!
                        </p>


                        <button
                            className="empty-create-btn"
                            onClick={() =>
                                navigate(
                                    "/create-complaint"
                                )
                            }
                        >

                            <span className="plus-icon">
                                +
                            </span>

                            Create Complaint

                        </button>

                    </div>

                )}

            </main>

        </div>

    );

}

export default CitizenDashboard;
