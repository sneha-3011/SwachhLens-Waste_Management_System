
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


    // ==========================================
    // FETCH COMPLAINT + HISTORY
    // ==========================================

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


            // ==================================
            // FETCH COMPLAINT
            // ==================================

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


            // ==================================
            // FETCH HISTORY
            // ==================================

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


    // ==========================================
    // LOAD COMPLAINT
    // ==========================================

    useEffect(() => {

        fetchComplaint();

    }, [id]);


    // ==========================================
    // AI ANALYSIS
    // ==========================================

    const analyzeComplaint = async () => {

        try {

            setAnalyzing(true);

            const token =
                localStorage.getItem("token");


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


            const analysis =
                response.data.analysis;


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

                <h2>
                    Loading complaint...
                </h2>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {

        return (

            <div className="complaint-container">

                <h2>
                    Error
                </h2>

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        navigate("/login")
                    }
                >
                    Login Again
                </button>

                {" "}

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
    // PROGRESS STATUS
    // ==========================================

    const getProgressClass = (step) => {

        const status =
            currentStatus.replace(/\s/g, "");


        // Pending active
        if (
            step === "Pending" &&
            status === "pending"
        ) {

            return "step active";

        }


        // In Progress active
        if (
            step === "In Progress" &&
            (
                status === "inprogress" ||
                status === "assigned"
            )
        ) {

            return "step active";

        }


        // Resolved active
        if (
            step === "Resolved" &&
            status === "resolved"
        ) {

            return "step active";

        }


        // Pending completed
        if (
            step === "Pending" &&
            (
                status === "inprogress" ||
                status === "assigned" ||
                status === "resolved"
            )
        ) {

            return "step completed";

        }


        // In Progress completed
        if (
            step === "In Progress" &&
            status === "resolved"
        ) {

            return "step completed";

        }


        return "step";

    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="complaint-container">


            {/* ==================================
                TITLE
            ================================== */}

            <h1 className="complaint-title">

                Complaint Details

            </h1>


            {/* ==================================
                HEADER
            ================================== */}

            <div className="complaint-header">

                <div className="complaint-info">

                    <p>

                        <strong>
                            Complaint No:
                        </strong>{" "}

                        #{complaint.id}

                    </p>


                    <p>

                        <strong>
                            Current Status:
                        </strong>{" "}

                        <span
                            className={
                                currentStatus === "pending"
                                    ? "status in-progress"
                                    : currentStatus === "resolved"
                                        ? "status"
                                        : "status in-progress"
                            }
                            style={
                                currentStatus === "resolved"
                                    ? {
                                        backgroundColor: "#5cb85c"
                                    }
                                    : undefined
                            }
                        >

                            {complaint.status}

                        </span>

                    </p>

                </div>


                {/* ==================================
                    PROGRESS BAR
                ================================== */}

                <div className="progress-bar">

                    {[
                        "Pending",
                        "In Progress",
                        "Resolved"
                    ].map((step) => (

                        <div
                            key={step}
                            className={
                                getProgressClass(step)
                            }
                        >

                            {step}

                        </div>

                    ))}

                </div>

            </div>


            {/* ==================================
                BODY
            ================================== */}

            <div className="complaint-body">


                {/* ==================================
                    IMAGE
                ================================== */}

                <div className="complaint-image">

                    <h3>
                        Complaint Image
                    </h3>


                    {complaint.image ? (

                        <img
                            src={`http://localhost:5000/uploads/${complaint.image}`}
                            alt="Complaint"
                        />

                    ) : (

                        <p>
                            No image available
                        </p>

                    )}

                </div>


                {/* ==================================
                    DETAILS
                ================================== */}

                <div className="complaint-details">


                    {/* ==================================
                        STATUS DESCRIPTION
                    ================================== */}

                    <h3>
                        Current Status
                    </h3>

                    <p>

                        <span
                            className={
                                currentStatus === "pending"
                                    ? "status in-progress"
                                    : currentStatus === "resolved"
                                        ? "status"
                                        : "status in-progress"
                            }
                            style={
                                currentStatus === "resolved"
                                    ? {
                                        backgroundColor: "#5cb85c"
                                    }
                                    : undefined
                            }
                        >

                            {complaint.status}

                        </span>

                    </p>


                    <p>

                        {currentStatus === "pending" &&
                            "Your complaint has been submitted and is waiting for review."
                        }

                        {(currentStatus === "assigned" ||
                            currentStatus === "in progress") &&

                            "Your complaint is currently being handled by the concerned team."

                        }

                        {currentStatus === "resolved" &&

                            "Your complaint has been successfully resolved."

                        }

                    </p>


                    {/* ==================================
                        STATUS HISTORY
                    ================================== */}

                    <h3>
                        Status History
                    </h3>


                    {historyLoading ? (

                        <p>
                            Loading status history...
                        </p>

                    ) : history.length === 0 ? (

                        <p>
                            No status history available.
                        </p>

                    ) : (

                        <ul>

                            {history.map(
                                (item, index) => (

                                    <li
                                        key={
                                            item.id ||
                                            index
                                        }
                                    >

                                        <strong>
                                            {item.status}
                                        </strong>

                                        {" - "}

                                        {item.createdAt
                                            ? new Date(
                                                item.createdAt
                                            ).toLocaleString()
                                            : "Date unavailable"
                                        }

                                    </li>

                                )
                            )}

                        </ul>

                    )}


                    {/* ==================================
                        COMMENT
                    ================================== */}

                    <h3>
                        Citizen Comment
                    </h3>


                    <p>

                        {complaint.comment ||
                            "No comment"}

                    </p>


                    {/* ==================================
                        LOCATION
                    ================================== */}

                    <h3>
                        Complaint Location
                    </h3>


                    {complaint.latitude &&
                    complaint.longitude ? (

                        <iframe
                            title="Complaint Location"
                            src={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}&output=embed`}
                            className="map"
                            loading="lazy"
                        >
                        </iframe>

                    ) : (

                        <p>
                            Location not available
                        </p>

                    )}


                    {/* ==================================
                        AI ANALYSIS
                    ================================== */}

                    <h3>
                        AI Analysis
                    </h3>


                    <ul>

                        <li>
                            <strong>
                                Waste Type:
                            </strong>{" "}

                            {complaint.wasteType ||
                                "Not analyzed"}

                        </li>


                        <li>
                            <strong>
                                Waste Size:
                            </strong>{" "}

                            {complaint.wasteSize ||
                                "Not analyzed"}

                        </li>


                        <li>
                            <strong>
                                Priority:
                            </strong>{" "}

                            {complaint.priority ||
                                "Not analyzed"}

                        </li>


                        <li>
                            <strong>
                                AI Confidence:
                            </strong>{" "}

                            {confidence}

                        </li>

                    </ul>


                    {/* ==================================
                        AI BUTTON
                    ================================== */}

                    <button
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

                        <p>

                            AI analysis requires a
                            complaint image.

                        </p>

                    )}


                    {/* ==================================
                        TIMESTAMPS
                    ================================== */}

                    <div className="timestamps">

                        <p>

                            <strong>
                                Submitted On:
                            </strong>{" "}

                            {complaint.createdAt

                                ? new Date(
                                    complaint.createdAt
                                ).toLocaleString()

                                : "N/A"

                            }

                        </p>


                        <p>

                            <strong>
                                Last Updated:
                            </strong>{" "}

                            {complaint.updatedAt

                                ? new Date(
                                    complaint.updatedAt
                                ).toLocaleString()

                                : "N/A"

                            }

                        </p>

                    </div>


                    {/* ==================================
                        BACK BUTTON
                    ================================== */}

                    <button
                        onClick={() =>
                            navigate("/citizen")
                        }
                    >

                        ← Back to My Complaints

                    </button>


                </div>

            </div>

        </div>

    );

}


export default ComplaintDetails;
