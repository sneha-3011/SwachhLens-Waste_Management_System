
import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ComplaintMap from "../components/ComplaintMap";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement
);


function AdminDashboard() {

    const [stats, setStats] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [duplicates, setDuplicates] = useState({});
    const [hotspots, setHotspots] = useState([]);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");


    // ==========================================
    // UPDATE COMPLAINT STATUS
    // ==========================================

    const updateStatus = async (id, status) => {

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                
                `http://localhost:5000/api/complaints/${id}/status`,
                {
                    status: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            // Update table immediately

            setComplaints((previousComplaints) =>

                previousComplaints.map((complaint) =>

                    complaint.id === id

                        ? {
                            ...complaint,
                            status: status
                        }

                        : complaint

                )

            );


            // Refresh statistics

            const statsResponse = await axios.get(
                `http://localhost:5000/api/complaints/dashboard/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            setStats(statsResponse.data);


        } catch (error) {

            console.error(
                "Status Update Error:",
                error.response?.data || error.message
            );

        }

    };


    // ==========================================
    // CHECK DUPLICATE
    // ==========================================

    const checkDuplicate = async (id) => {

        try {

            const token = localStorage.getItem("token");


            const response = await axios.get(
                `http://localhost:5000/api/complaints/${id}/duplicate`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            setDuplicates((previous) => ({

                ...previous,

                [id]: response.data

            }));


        } catch (error) {

            console.error(
                "Duplicate Check Error:",
                error.response?.data || error.message
            );

        }

    };


    // ==========================================
    // DOWNLOAD PDF REPORT
    // ==========================================

    const downloadReport = () => {

        const doc = new jsPDF();


        doc.setFontSize(18);

        doc.text(
            "SwachhLens Complaint Report",
            14,
            20
        );


        doc.setFontSize(12);


        doc.text(
            `Total Complaints: ${stats.totalComplaints}`,
            14,
            35
        );


        doc.text(
            'Pending: ${stats.pending}',
            14,
            45
        );


        doc.text(
            `In Progress: ${stats.inProgress}`,
            14,
            55
        );


        doc.text(
            `Resolved: ${stats.resolved}`,
            14,
            65
        );


        doc.text(
            `High Priority: ${stats.highPriority}`,
            14,
            75
        );


        autoTable(doc, {

            startY: 90,

            head: [[
                "ID",
                "Status",
                "Priority",
                "Comment"
            ]],

            body: complaints.map(
                (complaint) => [

                    complaint.id,

                    complaint.status,

                    complaint.priority || "N/A",

                    complaint.comment || "N/A"

                ]
            )

        });


        doc.save(
            "SwachhLens_Report.pdf"
        );

    };


    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    useEffect(() => {

        const fetchData = async () => {

            try {

                const token =
                    localStorage.getItem("token");


                console.log(
                    "ADMIN TOKEN:",
                    token
                );


                // ==================================
                // 1. DASHBOARD STATS
                // ==================================

                const statsResponse =
                    await axios.get(
                        "http://localhost:5000/api/complaints/dashboard/stats",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "STATS:",
                    statsResponse.data
                );


                setStats(
                    statsResponse.data
                );


                // ==================================
                // 2. ALL COMPLAINTS
                // ==================================

                const complaintsResponse =
                    await axios.get(
                        "http://localhost:5000/api/complaints/all",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "ALL COMPLAINTS RESPONSE:",
                    complaintsResponse.data
                );

                const downloadCSV = () => {

                const token =
                    localStorage.getItem("token");

                window.open(
                    `http://localhost:5000/api/admin/export-csv?token=${token}`,
                    "_blank"
                );

                };

                const complaintsData =
                    complaintsResponse.data.complaints;


                console.log(
                    "COMPLAINT ARRAY:",
                    complaintsData
                );


                if (Array.isArray(complaintsData)) {

                    setComplaints(
                        complaintsData
                    );

                } else {

                    console.error(
                        "Complaints is not an array:",
                        complaintsData
                    );

                    setComplaints([]);

                }


                // ==================================
                // 3. HOTSPOTS
                // ==================================

                const hotspotsResponse =
                    await axios.get(
                        `http://localhost:5000/api/complaints/hotspots`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                console.log(
                    "HOTSPOTS:",
                    hotspotsResponse.data
                );


                setHotspots(
                    hotspotsResponse.data.hotspots || []
                );


            } catch (error) {

    console.error(
        "Dashboard Error:",
        error.response?.data || error.message
    );

    if (error.response?.status === 401) {

        localStorage.removeItem("token");

        setError(
            "Your session has expired. Please login again."
        );

    } else {

        setError(
            "Failed to load admin dashboard."
        );

    }

}

        };


        fetchData();

    }, []);


    // ==========================================
    // LOADING
    // ==========================================

    if (!stats) {

    if (error) {

        return (
            <div >
                

                <h2>{error}</h2>

                <button
                    onClick={() =>
                        window.location.href = "/login"
                    }
                >
                    Login Again
                </button>

            </div>
       
        );

    }

    return <h2>Loading...</h2>;

}


    // ==========================================
    // PIE CHART
    // ==========================================

    const chartData = {

        labels: [
            "Pending",
            "In Progress",
            "Resolved",
            "High Priority"
        ],

        datasets: [

            {
                data: [

                    stats.pending || 0,

                    stats.inProgress || 0,

                    stats.resolved || 0,

                    stats.highPriority || 0

                ]
            }

        ]

    };


    // ==========================================
    // FILTER COMPLAINTS
    // ==========================================

    const filteredComplaints =
        complaints.filter((complaint) => {


            const search =
                searchTerm.toLowerCase();


            const matchesSearch =

                String(
                    complaint.id
                )
                    .toLowerCase()
                    .includes(search)

                ||

                (
                    complaint.comment || ""
                )
                    .toLowerCase()
                    .includes(search);


            const complaintStatus =
                (complaint.status || "")
                    .toLowerCase();


            const selectedStatus =
                statusFilter.toLowerCase();


            const matchesStatus =

                statusFilter === "All"

                ||

                complaintStatus ===
                selectedStatus;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    // ==========================================
    // UI
    // ==========================================

    const wasteTypeCounts = {};

    complaints.forEach((complaint) => {

        const type =
            complaint.wasteType ||
            "Unknown";

        wasteTypeCounts[type] =
            (wasteTypeCounts[type] || 0) + 1;

    });

    const wasteTypeData = {

        labels:
            Object.keys(wasteTypeCounts),

        datasets: [
            {
                label: "Waste Types",
                data:
                    Object.values(
                        wasteTypeCounts
                    )
            }
        ]

    };


    return (

        <div className="admin-dashboard">
            <div className="admin-container">


                <div className="admin-header">

                    <div className="admin-title">

                        <div className="admin-title-icon">
                            🌱
                        </div>

                        <div>
                            <h1>
                                SwachhLens Admin Dashboard
                            </h1>

                            <p>
                                Monitor complaints, waste patterns and city cleanliness
                            </p>
                        </div>

                </div>
                


            {/* ================================= */}
            {/* LOGOUT */}
            {/* ================================= */}

            <button
                className="logout-button"
                onClick={() => {

                    localStorage.removeItem("token");

                    window.location.href = "/login";

                }}
            >
                Logout
            </button>

        </div>


            {/* ================================= */}
            {/* PIE CHART */}
            {/* ================================= */}

            <div
                style={{
                    width: "400px",
                    marginTop: "20px",
                    marginBottom: "30px"
                }}
            >

                <Pie
                    data={chartData}
                />

            </div>


            <h2>Waste Type Distribution</h2>

            <div
                style={{
                    width: "700px",
                    marginBottom: "30px"
                }}
            >
                <Bar data={wasteTypeData} />
            </div>


            {/* ================================= */}
            {/* STATISTICS */}
            {/* ================================= */}

            <div className="stats-grid">

                <div className="stat-card ">
                    <h4>Total Complaints</h4>
                    <h2>{stats.totalComplaints}</h2>
                </div>

                <div className="stat-card stat-pending">
                    <h3>Pending</h3>
                    <p>{stats.pending || 0}</p>
                </div>

                <div className="stat-card stat-progress">
                    <h3>In Progress</h3>
                    <p>{stats.inProgress || 0}</p>
                </div>

                <div className="stat-card stat-resolved">
                    <h3>Resolved</h3>
                    <p>{stats.resolved || 0}</p>
                </div>

                <div className="stat-card stat-high">
                    <h3>High Priority</h3>
                    <p>{stats.highPriority || 0}</p>
                </div>

            </div>
            </div>


            <hr />


            {/* ================================= */}
            {/* DOWNLOAD REPORT */}
            {/* ================================= */}

            <button
                onClick={downloadReport}
            >
                Download Report
            </button>


            <hr />


            {/* ================================= */}
            {/* HOTSPOTS */}
            {/* ================================= */}

            <section className="dashboard-section">

    <div className="section-header">

        <div>
            <h2>📍 Waste Management Hotspots</h2>

            <p>
                Locations with high concentrations of waste complaints
            </p>
        </div>

        <span className="hotspot-count">
            {hotspots.length} Areas
        </span>

    </div>


    {hotspots.length === 0 ? (

        <div className="empty-state">

            <div className="empty-icon">
                📍
            </div>

            <h3>No Waste Hotspots Found</h3>

            <p>
                There are currently no areas with significant
                waste complaints.
            </p>

        </div>

    ) : (

        <div className="hotspots-grid">

            {hotspots.map((hotspot, index) => (

                <div
                    className="hotspot-card"
                    key={index}
                >

                    <div className="hotspot-top">

                        <div className="hotspot-icon">
                            📍
                        </div>

                        <div>

                            <h3>
                                Hotspot #{index + 1}
                            </h3>

                            <span className="hotspot-label">
                                Waste Problem Area
                            </span>

                        </div>

                    </div>


                    <div className="hotspot-location">

                        <span>📌 Location</span>

                        <strong>
                            {hotspot.latitude},
                            {" "}
                            {hotspot.longitude}
                        </strong>

                    </div>


                    <div className="hotspot-stats">

                        <div className="hotspot-stat">

                            <span>
                                Complaints
                            </span>

                            <strong>
                                {hotspot.complaintCount}
                            </strong>

                        </div>


                        <div className="hotspot-stat high">

                            <span>
                                High Priority
                            </span>

                            <strong>
                                {hotspot.highPriorityCount}
                            </strong>

                        </div>

                    </div>


                    <div className="hotspot-complaints">

                        <span>
                            Complaint IDs
                        </span>

                        <p>
                            {hotspot.complaints?.join(", ")
                                || "None"}
                        </p>

                    </div>

                </div>

            ))}

            </div>

        )}


        {/* MAP SHOULD BE OUTSIDE THE MAP */}

        {hotspots.length > 0 && (

            <div className="map-container">

                <h3>
                    🗺️ Hotspot Map
                </h3>

                <ComplaintMap
                    complaints={complaints}
                    hotspots={hotspots}
                />

            </div>

        )}

        </section>

            <hr />


            {/* ================================= */}
            {/* ALL COMPLAINTS */}
            {/* ================================= */}

            <h2>
                All Complaints
            </h2>


            {/* SEARCH */}

            <input
                type="text"
                placeholder="Search complaint..."
                value={searchTerm}
                onChange={(e) =>
                    setSearchTerm(
                        e.target.value
                    )
                }
            />


            {" "}


            {/* STATUS FILTER */}

            <select
                value={statusFilter}
                onChange={(e) =>
                    setStatusFilter(
                        e.target.value
                    )
                }
            >

                <option value="All">
                    All
                </option>

                <option value="Pending">
                    Pending
                </option>

                <option value="In Progress">
                    In Progress
                </option>

                <option value="Resolved">
                    Resolved
                </option>

                <option value="Rejected">
                    Rejected
                </option>

            </select>


            <br />
            <br />


            {/* ================================= */}
            {/* COMPLAINT COUNT */}
            {/* ================================= */}

            <p>

                Showing{" "}
                {filteredComplaints.length}
                {" "}
                of{" "}
                {complaints.length}
                {" "}
                complaints

            </p>


            {/* ================================= */}
            {/* TABLE */}
            {/* ================================= */}

            <table
                border="1"
                cellPadding="10"
                style={{
                    borderCollapse: "collapse",
                    width: "100%"
                }}
            >

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

                        <th>
                            Duplicate
                        </th>

                    </tr>

                </thead>


                <tbody>


                    {filteredComplaints.length === 0 ? (

                        <tr>

                            <td
                                colSpan="10"
                                style={{
                                    textAlign: "center"
                                }}
                            >

                                No complaints found.

                            </td>

                        </tr>

                    ) : (


                        filteredComplaints.map(
                            (complaint) => (

                                <tr
                                    key={
                                        complaint.id
                                    }
                                >


                                    {/* ID */}

                                    <td>
                                        {complaint.id}
                                    </td>


                                    {/* IMAGE */}

                                    <td>

                                        {complaint.image ? (

                                            <img
                                                src={`http://localhost:5000/uploads/${complaint.image}`}
                                                alt="Complaint"
                                                width="100"
                                                height="100"
                                                style={{
                                                    objectFit:
                                                        "cover"
                                                }}
                                            />

                                        ) : (

                                            "No image"

                                        )}

                                    </td>


                                    {/* LOCATION */}

                                    <td>

                                        {
                                            complaint.latitude
                                            ?? "N/A"
                                        }

                                        ,

                                        {" "}

                                        {
                                            complaint.longitude
                                            ?? "N/A"
                                        }

                                    </td>


                                    {/* COMMENT */}

                                    <td>

                                        {
                                            complaint.comment
                                            ||
                                            "No comment"
                                        }

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        {
                                            complaint.status
                                        }

                                    </td>


                                    {/* WASTE TYPE */}

                                    <td>

                                        {
                                            complaint.wasteType
                                            ||
                                            "Not analyzed"
                                        }

                                    </td>


                                    {/* WASTE SIZE */}

                                    <td>

                                        {
                                            complaint.wasteSize
                                            ||
                                            "Not analyzed"
                                        }

                                    </td>


                                    {/* PRIORITY */}

                                    <td>

                                        {
                                            complaint.priority
                                            ||
                                            "Not analyzed"
                                        }

                                    </td>


                                    {/* ACTION */}

                                    <td>

                                        <select

                                            value={
                                                complaint.status
                                            }

                                            onChange={(e) =>
                                                updateStatus(
                                                    complaint.id,
                                                    e.target.value
                                                )
                                            }

                                        >

                                            <option value="Pending">
                                                Pending
                                            </option>

                                            <option value="In Progress">
                                                In Progress
                                            </option>

                                            <option value="Resolved">
                                                Resolved
                                            </option>

                                            <option value="Rejected">
                                                Rejected
                                            </option>

                                        </select>

                                    </td>


                                    {/* DUPLICATE */}

                                    <td>

                                        <button
                                            onClick={() =>
                                                checkDuplicate(
                                                    complaint.id
                                                )
                                            }
                                        >
                                            Check
                                        </button>


                                        {duplicates[
                                            complaint.id
                                        ] && (

                                            <div>

                                                {
                                                    duplicates[
                                                        complaint.id
                                                    ]
                                                        .isDuplicate
                                                }

                                                ? (
                                                    <div>

                                                        ⚠️ Duplicate

                                                        {" "}

                                                        (
                                                        {
                                                            duplicates[
                                                                complaint.id
                                                            ]
                                                                .duplicateCount
                                                        }
                                                        )

                                                        <br />

                                                        <small>

                                                            Nearby:
                                                            {" "}

                                                            {
                                                                duplicates[
                                                                    complaint.id
                                                                ]
                                                                    .nearbyComplaints
                                                                    ?.join(
                                                                        ", "
                                                                    )
                                                                ||
                                                                "None"
                                                            }

                                                        </small>

                                                    </div>

                                                ) : (

                                                    <span>
                                                        ✅ No Duplicate
                                                    </span>

                                                )

                                            </div>

                                        )}

                                    </td>


                                </tr>

                            )

                        )

                    )}

                </tbody>

            </table>


        </div>

    );

}


export default AdminDashboard;

