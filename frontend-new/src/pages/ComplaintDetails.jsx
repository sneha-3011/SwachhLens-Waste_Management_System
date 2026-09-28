import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./ComplaintsDetails.css";

function ComplaintDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");
    const [historyLoading, setHistoryLoading] = useState(true);

    const fetchComplaint = async () => {
        try {
            setError("");
            const token = localStorage.getItem("token");
            if (!token) {
                setError(
                    "You are not logged in. Please login again."
                );
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/complaints/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "COMPLAINT DETAILS:",
                response.data
            );
            setComplaint(response.data);

            try {
                setHistoryLoading(true);
                const historyResponse = await axios.get(
                    `http://localhost:5000/api/complaints/${id}/history`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                console.log(
                    "COMPLAINT HISTORY:",
                    historyResponse.data
                );
                setHistory(
                    historyResponse.data.history || []
                );
            } catch (historyError) {
                console.error(
                    "History Fetch Error:",
                    historyError.response?.data ||
                    historyError.message
                );
                setHistory([]);
            } finally {
                setHistoryLoading(false);
            }
        } catch (error) {
            console.error(
                "Complaint Details Error:",
                error.response?.data ||
                error.message
            );
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                setError(
                    "Your session has expired. Please login again."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                    "Failed to load complaint"
                );
            }
        }
    };

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/home");
    };

    const analyzeComplaint = async () => {
        try {
            setAnalyzing(true);
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `http://localhost:5000/api/complaints/${id}/analyze`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            console.log(
                "AI ANALYSIS:",
                response.data
            );

            const analysis = response.data.analysis;
            setComplaint(previousComplaint => ({
                ...previousComplaint,
                wasteType:
                    analysis.wasteType,
                wasteSize:
                    analysis.wasteSize,
                priority:
                    analysis.priority,
                aiConfidence:
                    analysis.aiConfidence
            }));

        } catch (error) {
            console.error(
                "AI Analysis Error:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "AI analysis failed"
            );

        } finally {
            setAnalyzing(false);
        }

    };


    // ==========================================
    // LOADING
    // ==========================================

    if (!complaint && !error) {

        return (
            <div className="complaint-container">
                <div className="complaint-card complaint-main-card">
                    <h2>
                        Loading complaint...
                    </h2>
                </div>
            </div>
        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <div className="complaint-container">

                <div className="complaint-card complaint-main-card">

                    <h2>
                        Unable to Load Complaint
                    </h2>

                    <p>
                        {error}
                    </p>


                    <div className="complaint-error-actions">

                        <button
                            className="complaint-primary-btn"
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Login Again
                        </button>


                        <button
                            className="complaint-secondary-btn"
                            onClick={() =>
                                navigate("/citizen")
                            }
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </div>

            </div>

        );

    }


    // ==========================================
    // AI CONFIDENCE
    // ==========================================

    const confidence =
        complaint.aiConfidence !== null &&
        complaint.aiConfidence !== undefined

            ? `${(
                complaint.aiConfidence * 100
            ).toFixed(1)}%`

            : "Not analyzed";


    // ==========================================
    // CURRENT STATUS
    // ==========================================

    const currentStatus =
        (complaint.status || "").toLowerCase();


    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = () => {

        if (currentStatus === "resolved") {
            return "resolved";
        }

        if (currentStatus === "pending") {
            return "pending";
        }

        if (
            currentStatus === "in progress" ||
            currentStatus === "inprogress" ||
            currentStatus === "assigned"
        ) {
            return "in-progress";
        }

        if (currentStatus === "rejected") {
            return "rejected";
        }

        return "pending";

    };


    // ==========================================
    // HISTORY STATUS CLASS
    // ==========================================

    const getHistoryClass = (index) => {

        if (index === history.length - 1) {
            return "history-item active";
        }

        return "history-item completed";

    };


    // ==========================================
    // UI
    // ==========================================

    return (
        <>

            <header className="citizen-header">
                <div
                    className="citizen-logo"
                    onClick={() => navigate("/citizen")}
                >
                    SwachhLens
                </div>
                <nav className="citizen-nav">
                    <button
                        onClick={() => navigate("/citizen")}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => navigate("/citizen")}
                    >
                        My Complaints
                    </button>
                    <button
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </nav>

            </header>

            <div className="complaint-container">

            <div className="complaint-page-header">

                <div className="complaint-page-header-left">

    
                    <h2>
                        Complaint Details
                    </h2>
                </div>

            </div>



            {/* ==========================================
                TWO COLUMN LAYOUT
            ========================================== */}

            <div className="complaint-details-layout">


                {/* ======================================
                    LEFT COLUMN
                ====================================== */}

                <div className="complaint-left-column">


                    {/* ==================================
                        COMPLAINT INFORMATION
                    ================================== */}

                    <div className="complaint-card complaint-main-card">


                        <div className="complaint-number">
                            Complaint Number
                        </div>


                        <div className="complaint-number-value">
                            #{complaint.id}
                        </div>


                        {/* CURRENT STATUS */}

                        <div className="current-status-label">
                            Current Status
                        </div>


                        <div
                            className={`current-status ${getStatusClass()}`}
                        >

                            <span className="current-status-dot"></span>

                            {complaint.status}

                        </div>



                        {/* ==================================
                            IMAGE
                        ================================== */}

                        <div className="complaint-image-section">

                            <div className="complaint-section-label">
                                Complaint Image
                            </div>


                            <div className="complaint-image-wrapper">

                                {complaint.image ? (

                                    <img
                                        src={`http://localhost:5000/uploads/${complaint.image}`}
                                        alt="Complaint"
                                    />

                                ) : (

                                    <div className="no-image">
                                        No image available
                                    </div>

                                )}

                            </div>

                        </div>



                        {/* ==================================
                            LOCATION
                        ================================== */}

                        <div className="complaint-location">

                            <div className="complaint-section-label">
                                Complaint Location
                            </div>


                            <div className="location-value">

                                {complaint.locationName ||
                                    "Location not available"}

                            </div>


                            {complaint.latitude &&
                                complaint.longitude && (

                                    <div className="location-coordinates">

                                        {complaint.latitude},{" "}
                                        {complaint.longitude}

                                    </div>

                                )}


                            {/* MAP */}

                            {complaint.latitude &&
                                complaint.longitude ? (

                                <iframe
                                    title="Complaint Location"
                                    src={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}&output=embed`}
                                    className="complaint-map"
                                    loading="lazy"
                                />

                            ) : (

                                <div className="location-unavailable">
                                    Location map not available
                                </div>

                            )}

                        </div>

                    </div>

                </div>



                {/* ======================================
                    RIGHT COLUMN
                ====================================== */}

                <div className="complaint-right-column">


                    {/* ==================================
                        STATUS HISTORY
                    ================================== */}

                    <div className="complaint-card status-history-card">

                        <h2 className="card-heading">
                            Status History
                        </h2>


                        <p className="card-subheading">
                            Track the progress of your complaint
                        </p>


                        {historyLoading ? (

                            <div className="history-loading">
                                Loading status history...
                            </div>

                        ) : history.length === 0 ? (

                            <div className="history-empty">
                                No status history available.
                            </div>

                        ) : (

                            <div className="status-history">

                                {history.map(
                                    (item, index) => (

                                        <div
                                            className={getHistoryClass(index)}
                                            key={
                                                item.id ||
                                                index
                                            }
                                        >


                                            <span className="history-dot">
                                            </span>


                                            <div className="history-content">

                                                <div className="history-status">

                                                    {item.status}

                                                </div>


                                                <div className="history-date">

                                                    {item.createdAt

                                                        ? new Date(
                                                            item.createdAt
                                                        ).toLocaleString()

                                                        : "Date unavailable"

                                                    }

                                                </div>


                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>



                    {/* ==================================
                        CITIZEN COMMENT
                    ================================== */}

                    <div className="complaint-card comment-card">

                        <h2 className="card-heading">
                            Citizen Comment
                        </h2>


                        <div className="comment-box">

                            <p className="comment-text">

                                {complaint.comment ||
                                    "No comment was provided for this complaint."}

                            </p>

                        </div>

                    </div>



                    {/* ==================================
                        AI ANALYSIS
                    ================================== */}

                    <div className="complaint-card ai-analysis-card">


                        <div className="ai-analysis-header">

                            <div>

                                <h2 className="ai-analysis-title">
                                    AI Analysis
                                </h2>

                                <p className="ai-analysis-subtitle">
                                    Automated analysis of the submitted complaint
                                </p>

                            </div>


                            <span className="ai-analysis-badge">
                                AI
                            </span>

                        </div>



                        <div className="ai-analysis-grid">


                            {/* WASTE TYPE */}

                            <div className="ai-analysis-item">

                                <span className="ai-analysis-item-label">
                                    Waste Type
                                </span>


                                <span className="ai-analysis-item-value">

                                    {complaint.wasteType ||
                                        "Not analyzed"}

                                </span>

                            </div>



                            {/* WASTE SIZE */}

                            <div className="ai-analysis-item">

                                <span className="ai-analysis-item-label">
                                    Waste Size
                                </span>


                                <span className="ai-analysis-item-value">

                                    {complaint.wasteSize ||
                                        "Not analyzed"}

                                </span>

                            </div>



                            {/* PRIORITY */}

                            <div className="ai-analysis-item">

                                <span className="ai-analysis-item-label">
                                    Priority
                                </span>


                                <span className="ai-analysis-item-value">

                                    {complaint.priority ||
                                        "Not analyzed"}

                                </span>

                            </div>



                            {/* CONFIDENCE */}

                            <div className="ai-analysis-item">

                                <span className="ai-analysis-item-label">
                                    AI Confidence
                                </span>


                                <span className="ai-analysis-item-value">

                                    {confidence}

                                </span>

                            </div>

                        </div>



                        {/* AI BUTTON */}

                        <button
                            className="ai-analysis-btn"
                            onClick={analyzeComplaint}
                            disabled={
                                analyzing ||
                                !complaint.image
                            }
                        >

                            {analyzing
                                ? "Analyzing..."
                                : "Analyze Complaint"
                            }

                        </button>


                        {!complaint.image && (

                            <p className="ai-analysis-note">

                                AI analysis requires a complaint image.

                            </p>

                        )}

                    </div>

                </div>

            </div>



            {/* ==========================================
                BOTTOM INFORMATION
            ========================================== */}

            <div className="complaint-footer-info">


                {/* SUBMITTED */}

                <div className="complaint-date-card">

                    <span className="complaint-date-label">
                        Date Submitted
                    </span>


                    <span className="complaint-date-value">

                        {complaint.createdAt

                            ? new Date(
                                complaint.createdAt
                            ).toLocaleString()

                            : "N/A"

                        }

                    </span>

                </div>



                {/* UPDATED */}

                <div className="complaint-date-card">

                    <span className="complaint-date-label">
                        Last Updated
                    </span>


                    <span className="complaint-date-value">

                        {complaint.updatedAt

                            ? new Date(
                                complaint.updatedAt
                            ).toLocaleString()

                            : "N/A"

                        }

                    </span>

                </div>

            </div>



            {/* ==========================================
                BACK BUTTON
            ========================================== */}

            <div className="complaint-back-container">

                <button
                    className="complaint-back-btn"
                    onClick={() =>
                        navigate("/citizen")
                    }
                >
                    Back to My Complaints
                </button>

            </div>


        </div>
</>
    );

}


export default ComplaintDetails;