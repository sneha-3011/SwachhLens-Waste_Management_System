import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { FaDownload } from "react-icons/fa";
import {useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPen } from "@fortawesome/free-solid-svg-icons";


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

    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [duplicateResults, setDuplicateResults] = useState({});
    const [complaints, setComplaints] = useState([]);
    const [duplicates, setDuplicates] = useState({});
    const [hotspots, setHotspots] = useState([]);
    const [error, setError] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    // USER MANAGEMENT
    const [users, setUsers] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("All");
    const [userStatusFilter, setUserStatusFilter] = useState("All");

    // WASTE CATEGORY MANAGEMENT
    const [wasteCategories, setWasteCategories] = useState([]);
    const [categorySearchTerm, setCategorySearchTerm] = useState("");
    const [categoryStatusFilter, setCategoryStatusFilter] = useState("All");

    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");
    const [categoryStatus, setCategoryStatus] = useState("Active");

    // Sidebar active section
    const [activeSection, setActiveSection] = useState("dashboard");

    // ================= ZONES & WARDS =================

    const [zones, setZones] = useState([]);
    const [wards, setWards] = useState([]);

    const [zoneSearchTerm, setZoneSearchTerm] = useState("");
    const [zoneStatusFilter, setZoneStatusFilter] = useState("All");

    const [selectedZone, setSelectedZone] = useState(null);

    const [showZoneForm, setShowZoneForm] = useState(false);
    const [editingZone, setEditingZone] = useState(null);

    const [zoneName, setZoneName] = useState("");
    const [zoneDescription, setZoneDescription] = useState("");
    const [zoneStatus, setZoneStatus] = useState("Active");

    const [showWardForm, setShowWardForm] = useState(false);
    const [editingWard, setEditingWard] = useState(null);

    const [wardNumber, setWardNumber] = useState("");
    const [wardName, setWardName] = useState("");
    const [wardDescription, setWardDescription] = useState("");
    const [wardStatus, setWardStatus] = useState("Active");
    const [wardZoneId, setWardZoneId] = useState("");

    const getLocationName = async (latitude, longitude) => {

        try {

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        "Accept-Language" : "en"
                    }
                }
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

            setDuplicateResults((prev) => ({
                ...prev,
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
    // UPDATE USER STATUS
    // ==========================================

    const updateUserStatus = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem("token");

            const newStatus =
                currentStatus === "Active"
                    ? "Inactive"
                    : "Active";

            const response = await axios.put(
                `http://localhost:5000/api/users/${id}/status`,
                {
                    status: newStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === id
                        ? {
                            ...user,
                            status: response.data.user.status
                        }
                        : user
                )
            );

        } catch (error) {
            console.error(
                "Update User Status Error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to update user status"
            );
        }
    };

    // ==========================================
    // UPDATE USER ROLE
    // ==========================================

    const updateUserRole = async (id, role) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.put(
                `http://localhost:5000/api/users/${id}/role`,
                {
                    role: role
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUsers((previousUsers) =>
                previousUsers.map((user) =>
                    user.id === id
                        ? {
                            ...user,
                            role: response.data.user.role
                        }
                        : user
                )
            );

        } catch (error) {
            console.error(
                "Update User Role Error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to update user role"
            );
        }
    };

    // ==========================================
    // DELETE USER
    // ==========================================

    const deleteUser = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:5000/api/users/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUsers((previousUsers) =>
                previousUsers.filter(
                    (user) => user.id !== id
                )
            );

            

        } catch (error) {
            console.error(
                "Delete User Error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete user"
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
            `Total Complaints: ${stats.totalComplaints || 0}`,
            14,
            35
        );

        doc.text(
            `Pending: ${stats.pending || 0}`,
            14,
            45
        );

        doc.text(
            `In Progress: ${stats.inProgress || 0}`,
            14,
            55
        );

        doc.text(
            `Resolved: ${stats.resolved || 0}`,
            14,
            65
        );

        doc.text(
            `High Priority: ${stats.highPriority || 0}`,
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

            body: complaints.map((complaint) => [
                complaint.id,
                complaint.status,
                complaint.priority || "N/A",
                complaint.comment || "N/A"
            ])

        });

        doc.save("SwachhLens_Report.pdf");
    };

    // ==========================================
    // FETCH ALL USERS
    // ==========================================

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUsers(response.data.users || []);

        } catch (error) {
            console.error(
                "Fetch Users Error:",
                error.response?.data || error.message
            );
        }
    };

    const fetchWasteCategories = async () => {
        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/waste-categories",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWasteCategories(
                response.data.categories || []
            );

        } catch (error) {

            console.error(
                "Fetch Waste Categories Error:",
                error.response?.data || error.message
            );
        }
    };

    // ================= ZONES & WARDS API =================

// FETCH ALL ZONES
const fetchZones = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/zones",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to fetch zones"
            );
        }

        setZones(data.zones || []);

    } catch (error) {
        console.error("Fetch Zones Error:", error);
        alert(error.message);
    }
};


// FETCH WARDS FOR SELECTED ZONE
    const fetchWardsByZone = async (zoneId) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/wards/zone/${zoneId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch wards"
                );
            }

            setWards(data.wards || []);

        } catch (error) {
            console.error(
                "Fetch Wards Error:",
                error
            );

            alert(error.message);
        }
    };

    // ADD ZONE
    const addZone = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/zones",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: zoneName,
                        description: zoneDescription,
                        status: zoneStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add zone"
                );
            }

            alert("Zone added successfully");

            closeZoneForm();
            fetchZones();

        } catch (error) {
            console.error("Add Zone Error:", error);
            alert(error.message);
        }
    };


    // UPDATE ZONE
    const updateZone = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/zones/${editingZone.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: zoneName,
                        description: zoneDescription,
                        status: zoneStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update zone"
                );
            }

            alert("Zone updated successfully");

            closeZoneForm();
            fetchZones();

        } catch (error) {
            console.error(
                "Update Zone Error:",
                error
            );

            alert(error.message);
        }
    };


    // OPEN EDIT ZONE
    const openEditZone = (zone) => {
        setEditingZone(zone);

        setZoneName(zone.name || "");
        setZoneDescription(zone.description || "");
        setZoneStatus(zone.status || "Active");

        setShowZoneForm(true);
    };


    // OPEN ADD ZONE
    const openAddZone = () => {
        setEditingZone(null);

        setZoneName("");
        setZoneDescription("");
        setZoneStatus("Active");

        setShowZoneForm(true);
    };


    // CLOSE ZONE FORM
    const closeZoneForm = () => {
        setShowZoneForm(false);
        setEditingZone(null);

        setZoneName("");
        setZoneDescription("");
        setZoneStatus("Active");
    };


    // UPDATE ZONE STATUS
    const updateZoneStatus = async (zone) => {
        try {
            const token = localStorage.getItem("token");

            const newStatus =
                zone.status === "Active"
                    ? "Inactive"
                    : "Active";

            const response = await fetch(
                `http://localhost:5000/api/zones/${zone.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update zone status"
                );
            }

            fetchZones();

        } catch (error) {
            console.error(
                "Update Zone Status Error:",
                error
            );

            alert(error.message);
        }
    };


    // DELETE ZONE
    const deleteZone = async (zoneId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this zone?"
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `http://localhost:5000/api/zones/${zoneId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete zone"
                );
            }

            alert("Zone deleted successfully");

            if (
                selectedZone &&
                selectedZone.id === zoneId
            ) {
                setSelectedZone(null);
                setWards([]);
            }

            fetchZones();

        } catch (error) {
            console.error(
                "Delete Zone Error:",
                error
            );

            alert(error.message);
        }
    };

    const addWasteCategory = async () => {

        if (!categoryName.trim()) {
            alert("Category name is required.");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:5000/api/waste-categories",
                {
                    name: categoryName,
                    description: categoryDescription,
                    status: categoryStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWasteCategories((previousCategories) => [
                ...previousCategories,
                response.data.category
            ]);

            closeCategoryForm();


        } catch (error) {

            console.error(
                "Add Waste Category Error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to add waste category"
            );
        }
    };

    const updateWasteCategory = async () => {

        if (!categoryName.trim()) {
            alert("Category name is required.");
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await axios.put(
                `http://localhost:5000/api/waste-categories/${editingCategory.id}`,
                {
                    name: categoryName,
                    description: categoryDescription,
                    status: categoryStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWasteCategories((previousCategories) =>
                previousCategories.map((category) =>
                    category.id === editingCategory.id
                        ? response.data.category
                        : category
                )
            );

            closeCategoryForm();


        } catch (error) {

            console.error(
                "Update Waste Category Error:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to update waste category"
            );
        }
    };

    const openEditCategory = (category) => {

        setEditingCategory(category);

        setCategoryName(category.name || "");

        setCategoryDescription(
            category.description || ""
        );

        setCategoryStatus(
            category.status || "Active"
        );

        setShowCategoryForm(true);
    };

    const openAddCategory = () => {

        setEditingCategory(null);

        setCategoryName("");
        setCategoryDescription("");
        setCategoryStatus("Active");

        setShowCategoryForm(true);
    };

    const closeCategoryForm = () => {

        setShowCategoryForm(false);

        setEditingCategory(null);

        setCategoryName("");
        setCategoryDescription("");
        setCategoryStatus("Active");
    };

    const updateCategoryStatus = async (
        id,
        currentStatus
    ) => {

        try {

            const token = localStorage.getItem("token");

            const newStatus =
                currentStatus === "Active"
                    ? "Inactive"
                    : "Active";

            const response = await axios.put(
                `http://localhost:5000/api/waste-categories/${id}/status`,
                {
                    status: newStatus
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWasteCategories(
                (previousCategories) =>
                    previousCategories.map(
                        (category) =>
                            category.id === id
                                ? {
                                    ...category,
                                    status:
                                        response.data.category.status
                                }
                                : category
                    )
            );

        } catch (error) {

            console.error(
                "Update Category Status Error:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to update category status"
            );
        }
    };

    const deleteWasteCategory = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this waste category?"
        );

        if (!confirmDelete) {
            return;
        }

        try {

            const token = localStorage.getItem("token");

            await axios.delete(
                `http://localhost:5000/api/waste-categories/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setWasteCategories(
                (previousCategories) =>
                    previousCategories.filter(
                        (category) =>
                            category.id !== id
                    )
            );


        } catch (error) {

            console.error(
                "Delete Waste Category Error:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete waste category"
            );
        }
    };


    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    useEffect(() => {

        const fetchData = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {

                    setError(
                        "Your session has expired. Please login again."
                    );

                    return;
                }


                // ==================================
                // 1. DASHBOARD STATS
                // ==================================

                const statsResponse = await axios.get(
                    `http://localhost:5000/api/complaints/dashboard/stats`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setStats(statsResponse.data);


                // ==================================
                // 2. ALL COMPLAINTS
                // ==================================

                const complaintsResponse = await axios.get(
                    `http://localhost:5000/api/complaints/all`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const complaintsData =
                    complaintsResponse.data.complaints;

                if (Array.isArray(complaintsData)) {

                    const complaintsWithLocation = await Promise.all(
                        complaintsData.map(async (complaint) => {
                            if(complaint.latitude && complaint.longitude){
                                const locationName=await getLocationName(
                                    complaint.latitude,
                                    complaint.longitude
                                );

                                return {
                                    ...complaint,
                                    locationName: locationName
                                };
                            }

                            return {
                                ...complaint,
                                locationName: "Location unavailable"
                            };
                        })
                    );

                    setComplaints(complaintsWithLocation);

                } else {

                    setComplaints([]);

                }


                // ==================================
                // 3. HOTSPOTS
                // ==================================

                const hotspotsResponse = await axios.get(
                    `http://localhost:5000/api/complaints/hotspots`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const hotspotsData = hotspotsResponse.data.hotspots || [];

                const hotspotsWithLocation = await Promise.all(
                    hotspotsData.map(async (hotspot) => {
                        if (hotspot.latitude && hotspot.longitude) {
                            const locationName = await getLocationName(
                                hotspot.latitude,
                                hotspot.longitude
                            );
                            return {
                                ...hotspot,
                                locationName: locationName
                            };
                        }
                        return {
                            ...hotspot,
                            locationName: "Location unavailable"
                        };
                    })
                );

                setHotspots(hotspotsWithLocation);

                // ==================================
                // 4. ALL USERS
                // ==================================

                const usersResponse = await axios.get(
                    "http://localhost:5000/api/users",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUsers(usersResponse.data.users || []);


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
        fetchZones();
        

    }, []);


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        window.location.href = "/login";
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (!stats) {

        if (error) {

            return (
                <div className="dashboard-error-page">

                    <div className="dashboard-error">

                        <h2>{error}</h2>

                        <button
                            onClick={() =>
                                window.location.href = "/login"
                            }
                        >
                            Login Again
                        </button>

                    </div>

                </div>
            );
        }

        return (
            <div className="loading-container">
                <h2>Loading SwachhLens Admin...</h2>
            </div>
        );
    }


    // ==========================================
    // PIE CHART
    // ==========================================

    const chartData = {

        labels: [
            "Pending",
            "In Progress",
            "Resolved"
        ],

        datasets: [
            {
                data: [
                    stats.pending || 0,
                    stats.inProgress || 0,
                    stats.resolved || 0
                ],

                backgroundColor: [
                    "#eda323",
                    "#4285f4",
                    "#34a853"
                ],

                borderColor: [
                    "#ffffff",
                    "#ffffff",
                    "#ffffff"

                ],
                borderWidth : 2
            }
        ]
    };


    // ==========================================
    // WASTE TYPE DISTRIBUTION
    // ==========================================

    const wasteTypeCounts = {};

    complaints.forEach((complaint) => {

        const type =
            complaint.wasteType || "Unknown";

        wasteTypeCounts[type] =
            (wasteTypeCounts[type] || 0) + 1;

    });


    const wasteTypeData = {

        labels: Object.keys(wasteTypeCounts),

        datasets: [
            {
                label: "Number of complaints",
                data: Object.values(wasteTypeCounts),

                backgroundColor: [
                    "#4CAF50",
                    "#2196F3",
                    "#FF9800",
                    "#9C27B0",
                    "#F44336",
                    "#00ACC1",
                    "#795548"
                ],
                borderColor: "#ffffff",
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }
        ]
    };

    // ==========================================
    // FILTER USERS
    // ==========================================

    const filteredUsers = users.filter((user) => {

        const search =
            userSearchTerm.toLowerCase().trim();

        const matchesSearch =
            String(user.id)
                .toLowerCase()
                .includes(search)
            ||
            (user.name || "")
                .toLowerCase()
                .includes(search)
            ||
            (user.email || "")
                .toLowerCase()
                .includes(search)
            ||
            (user.mobile_no || "")
                .toLowerCase()
                .includes(search);

        const matchesRole =
            userRoleFilter === "All"
            ||
            user.role === userRoleFilter;

        const matchesStatus =
            userStatusFilter === "All"
            ||
            user.status === userStatusFilter;

        return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
        );
    });


    // ==========================================
    // FILTER COMPLAINTS
    // ==========================================

    const filteredComplaints =
        complaints.filter((complaint) => {

            const search =
                searchTerm.toLowerCase();

            const matchesSearch =
                String(complaint.id)
                    .toLowerCase()
                    .includes(search)
                ||
                (complaint.comment || "")
                    .toLowerCase()
                    .includes(search)
                ||
                (complaint.wasteType || "")
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
                complaintStatus === selectedStatus;

            return (
                matchesSearch &&
                matchesStatus
            );

        });

        const filteredWasteCategories =
    wasteCategories.filter((category) => {

        const search =
            categorySearchTerm
                .toLowerCase()
                .trim();

        const matchesSearch =
            String(category.id)
                .includes(search)
            ||
            (category.name || "")
                .toLowerCase()
                .includes(search)
            ||
            (category.description || "")
                .toLowerCase()
                .includes(search);

        const matchesStatus =
            categoryStatusFilter === "All"
            ||
            category.status === categoryStatusFilter;

        return (
            matchesSearch &&
            matchesStatus
        );
    });




    // ==========================================
    // DASHBOARD CONTENT
    // ==========================================

    const renderDashboard = () => {

        return (

            <>

                {/* PAGE HEADER */}

                <div className="content-header">

                    <button
                        className="download-button"
                        onClick={downloadReport}
                    >
                        <FaDownload style={{ marginRight : "6px" }}/> Download Report
                    </button>

                </div>


                {/* STATISTICS */}

                <div className="stats-grid">

                    <div className="stat-card stat-total">
                        <h3>Total Complaints</h3>
                        <p>
                            {stats.totalComplaints || 0}
                        </p>
                    </div>

                    <div className="stat-card stat-pending">
                        <h3>Pending</h3>
                        <p>
                            {stats.pending || 0}
                        </p>
                    </div>

                    <div className="stat-card stat-progress">
                        <h3>In Progress</h3>
                        <p>
                            {stats.inProgress || 0}
                        </p>
                    </div>

                    <div className="stat-card stat-resolved">
                        <h3>Resolved</h3>
                        <p>
                            {stats.resolved || 0}
                        </p>
                    </div>

                    <div className="stat-card stat-high">
                        <h3>High Priority</h3>
                        <p>
                            {stats.highPriority || 0}
                        </p>
                    </div>

                </div>


                {/* CHARTS */}

                <div className="dashboard-charts">

                    <div className="chart-card">

                        <h2>
                            Complaint Status
                        </h2>

                        <div className="pie-wrapper">

                            <Pie
                                data={chartData}
                            />

                        </div>

                    </div>


                    <div className="chart-card">

                        <h2>
                            Waste Type Distribution
                        </h2>

                        <div className="bar-wrapper">

                            <Bar
                                data={wasteTypeData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,

                                    plugins:{
                                        legend: {
                                            display:false
                                        },

                                        tooltip:{
                                            backgroundColor: "#1f2937",
                                            titleFont: {
                                                size:14,
                                                weight: 'bold'
                                            },
                                            bodyFont: {
                                                size:13
                                            },
                                            padding: 10
                                        }
                                    },
                                    scales:{
                                        x:{
                                            grid:{
                                                display: false
                                            },
                                            ticks: {
                                                font: {
                                                    size: 12,
                                                    weight: "600"
                                                }
                                            }
                                        },

                                        y:{
                                            beginAtZero: true,
                                            ticks:{
                                                precision: 0,
                                                font: {
                                                    size: 12
                                                }
                                            },
                                            grid: {
                                                color: "#e5e7eb"
                                            }
                                        }
                                    }
                                }}
                            />

                        </div>

                    </div>

                </div>


                {/* HOTSPOTS */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Waste Zones
                            </h2>

                        </div>

                        <span className="hotspot-count">
                            {hotspots.length} Areas
                        </span>

                    </div>


                    {hotspots.length === 0 ? (

                        <div className="empty-state">

                            <h3>
                                No Waste Hotspots Found
                            </h3>

                            <p>
                                There are currently no areas
                                with significant waste complaints.
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

                                        <div>

                                            <h3>
                                                Area #{index + 1}
                                            </h3>

                                        </div>

                                    </div>


                                    <div className="hotspot-location">

                                        <span>
                                            Location
                                        </span>

                                        <strong>
                                            {hotspot.locationName || "Location unavailable"}
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


                    {hotspots.length > 0 && (

                        <div className="map-container">

                            <h3>
                                Map
                            </h3>

                            <ComplaintMap
                                complaints={complaints}
                                hotspots={hotspots}
                            />

                        </div>

                    )}

                </section>

            </>

        );
    };


    // ==========================================
    // COMPLAINT MANAGEMENT
    // ==========================================

    const renderComplaintManagement = () => {

        return (

            <>

                {/* PAGE HEADER */}

                


                {/* SEARCH + FILTER */}

                <section className="dashboard-section">
                    <div class="section-header">
                        <div className="complaint-tools">
                            <button
                            className="download-button"
                            onClick={downloadReport}
                        >
                            <FaDownload style={{ marginRight : "6px" }}/> Download Report
                        </button>

                        <div className="search-input-wrapper">
                            <FontAwesomeIcon icon={faSearch} className="search-icon"/>

                            <input
                                type="text"
                                placeholder="Search by ID, comment or waste type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>


                        <select
                            className="status-filter"
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >

                            <option value="All">
                                All Status
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

                    </div>
                    </div>


                    {/* TABLE */}

                    <div className="table-container">

                        <table className="complaints-table">

                            <thead>

                                <tr>

                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Location</th>
                                    <th>Comment</th>
                                    <th>Status</th>
                                    <th>Waste Type</th>
                                    <th>Waste Size</th>
                                    <th>Priority</th>
                                    <th>Action</th>
                                    <th>Duplicate</th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredComplaints.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="10"
                                            className="table-empty"
                                        >
                                            No complaints found.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredComplaints.map(
                                        (complaint) => (

                                            <tr
                                                key={complaint.id}
                                            >

                                                {/* ID */}

                                                <td>
                                                    <strong>
                                                        #{complaint.id}
                                                    </strong>
                                                </td>


                                                {/* IMAGE */}

                                                <td>

                                                    {complaint.image ? (

                                                        <img
                                                            className="complaint-image"
                                                            src={`http://localhost:5000/uploads/${complaint.image}`}
                                                            alt="Complaint"
                                                        />

                                                    ) : (

                                                        <span className="no-image">
                                                            No image
                                                        </span>

                                                    )}

                                                </td>


                                                {/* LOCATION */}

                                                <td>

                                                    <div className="location-cell">


                                                        <span>
                                                            {complaint.locationName || "Location unavailable"}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* COMMENT */}

                                                <td>

                                                    <div className="comment-cell">

                                                        {complaint.comment ||
                                                            "No comment"}

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={`status-badge status-${(
                                                            complaint.status || ""
                                                        )
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "-")}`}
                                                    >
                                                        {complaint.status ||
                                                            "Unknown"}
                                                    </span>

                                                </td>


                                                {/* WASTE TYPE */}

                                                <td className="waste-type">

                                                    {complaint.wasteType ||
                                                        "Not analyzed"}

                                                </td>


                                                {/* WASTE SIZE */}

                                                <td className="waste-size">

                                                    {complaint.wasteSize ||
                                                        "Not analyzed"}

                                                </td>


                                                {/* PRIORITY */}

                                                <td>

                                                    <span
                                                        className={`priority-badge priority-${(
                                                            complaint.priority ||
                                                            "low"
                                                        ).toLowerCase()}`}
                                                    >
                                                        {complaint.priority ||
                                                            "Not analyzed"}
                                                    </span>

                                                </td>


                                                {/* ACTION */}

                                                <td>

                                                    <select
                                                        className="status-select"
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

                                                    {duplicateResults[complaint.id] ? (
                                                        duplicateResults[complaint.id].isDuplicate ? (
                                                            <span className="duplicate-result duplicate">
                                                                Duplicate
                                                            </span>
                                                        ) : (
                                                            <span className="duplicate-result not-duplicate">
                                                                Not duplicate
                                                            </span>
                                                        )
                                                    ):(
                                                        <button
                                                            className="check-duplicate-btn"
                                                            onClick={() => checkDuplicate(complaint.id)}
                                                        >
                                                            Check

                                                        </button>
                                        
                                                    )

                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </>

        );
    };


const renderWasteCategories = () => {
    return (
        <div className="admin-section">


            {/* FILTERS */}
            <div className="category-filters">

                {/* SEARCH */}
                <div className="category-search">
                    <FontAwesomeIcon icon={faSearch} />

                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) =>
                            setCategorySearchTerm(e.target.value)
                        }
                    />
                </div>

                {/* STATUS FILTER */}
                <select
                    value={categoryStatusFilter}
                    onChange={(e) =>
                        setCategoryStatusFilter(e.target.value)
                    }
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <button
                    className="add-category-btn"
                    onClick={openAddCategory}
                >
                    + Add Category
                </button>

            </div>

            {/* TABLE */}
            <div className="category-table-container">

                <table className="category-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filteredWasteCategories.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="5"
                                    className="no-category-data"
                                >
                                    No waste categories found.
                                </td>
                            </tr>

                        ) : (

                            filteredWasteCategories.map((category) => (

                                <tr key={category.id}>

                                    <td>
                                        {category.id}
                                    </td>

                                    <td>
                                        <strong>
                                            {category.name}
                                        </strong>
                                    </td>

                                    <td>
                                        {category.description ||
                                            "No description"}
                                    </td>

                                    <td>

                                        <span
                                            className={
                                                category.status === "Active"
                                                    ? "category-status active"
                                                    : "category-status inactive"
                                            }
                                        >
                                            {category.status}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="category-actions">

                                            {/* EDIT */}
                                            <button
                                                className="edit-category-btn"
                                                onClick={() =>
                                                    openEditCategory(category)
                                                }
                                                
                                            >
                                                <FontAwesomeIcon icon={faPen} style={{marginRight:"3px"}} />Edit
                                            </button>

                                            

                                            {/* DELETE */}
                                            <button
                                                className="delete-category-btn"
                                                onClick={() =>
                                                    deleteWasteCategory(
                                                        category.id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

            {/* ADD / EDIT MODAL */}
            {showCategoryForm && (

                <div className="category-modal-overlay">

                    <div className="category-modal">

                        <div className="category-modal-header">

                            <h3>
                                {editingCategory
                                    ? "Edit Waste Category"
                                    : "Add Waste Category"}
                            </h3>

                            <button
                                className="category-modal-close"
                                onClick={closeCategoryForm}
                            >
                                ×
                            </button>

                        </div>

                        <div className="category-form">

                            {/* CATEGORY NAME */}
                            <div className="form-group">

                                <label>
                                    Category Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter category name"
                                    value={categoryName}
                                    onChange={(e) =>
                                        setCategoryName(e.target.value)
                                    }
                                />

                            </div>

                            {/* DESCRIPTION */}
                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    placeholder="Enter category description"
                                    value={categoryDescription}
                                    onChange={(e) =>
                                        setCategoryDescription(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* STATUS */}
                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={categoryStatus}
                                    onChange={(e) =>
                                        setCategoryStatus(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="Active">
                                        Active
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>

                            </div>

                            {/* BUTTONS */}
                            <div className="category-form-actions">

                                <button
                                    className="cancel-category-btn"
                                    onClick={closeCategoryForm}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="save-category-btn"
                                    onClick={
                                        editingCategory
                                            ? updateWasteCategory
                                            : addWasteCategory
                                    }
                                >
                                    {editingCategory
                                        ? "Update Category"
                                        : "Add Category"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


// ================= ZONES & WARDS UI =================

const renderZonesAndWards = () => {

    const filteredZones = zones.filter((zone) => {

        const matchesSearch =zone.name.toLowerCase().includes(zoneSearchTerm.toLowerCase());

        const matchesStatus =
            zoneStatusFilter === "All" ||
            zone.status === zoneStatusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="zones-wards-container">

            {/* FILTERS */}
            <div className="zones-wards-filters">

                <div className="zone-search-box">

                    <FontAwesomeIcon icon={faSearch} />

                    <input
                        type="text"
                        placeholder="Search zones..."
                        value={zoneSearchTerm}
                        onChange={(e) =>
                            setZoneSearchTerm(e.target.value)
                        }
                    />

                </div>


                <select
                    value={zoneStatusFilter}
                    onChange={(e) =>
                        setZoneStatusFilter(e.target.value)
                    }
                >
                    <option value="All">
                        All Status
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Inactive">
                        Inactive
                    </option>

                </select>

                <button
                    className="add-zone-btn"
                    onClick={openAddZone}
                >
                    + Add Zone
                </button>

            </div>


            {/* ZONES TABLE */}
            <div className="zones-table-card">

                <table className="zones-table">

                    <thead>

                        <tr>
                            <th>Zone</th>
                            <th>Description</th>
                            <th>Wards</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        {filteredZones.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="5"
                                    className="empty-zones"
                                >
                                    No zones found.
                                </td>

                            </tr>

                        ) : (

                            filteredZones.map((zone) => (

                                <tr key={zone.id}>

                                    <td>
                                        <strong>
                                            {zone.name}
                                        </strong>
                                    </td>


                                    <td>
                                        {zone.description || "-"}
                                    </td>


                                    <td>
                                        <button
                                            className="view-wards-btn"
                                            onClick={() => {
                                                setSelectedZone(zone);
                                                fetchWardsByZone(zone.id);
                                            }}
                                        >
                                            {zone.Wards
                                                ? zone.Wards.length
                                                : 0}{" "}
                                            Wards
                                        </button>
                                    </td>


                                    <td>

                                        <span
                                            className={
                                                zone.status === "Active"
                                                    ? "status-active"
                                                    : "status-inactive"
                                            }
                                        >
                                            {zone.status}
                                        </span>

                                    </td>


                                    <td>

                                        <div className="zone-actions">

                                            <button
                                                className="edit-category-btn"
                                                onClick={() =>
                                                    openEditZone(zone)
                                                }
                                                title="Edit Zone"
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPen}
                                                /> Edit
                                            </button>


                                            <button
                                                className="zone-status-btn"
                                                onClick={() =>
                                                    updateZoneStatus(zone)
                                                }
                                            >
                                                {zone.status === "Active"
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>


                                            <button
                                                className="delete-zone-btn"
                                                onClick={() =>
                                                    deleteZone(zone.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>


            {/* SELECTED ZONE / WARDS */}

            {selectedZone && (

                <div className="wards-section">

                    <div className="wards-header">

                        <div>

                            <h3>
                                {selectedZone.name} — Wards
                            </h3>

                            <p>
                                Manage wards belonging to this zone.
                            </p>

                        </div>


                        <button
                            className="add-ward-btn"
                            onClick={() => {

                                setEditingWard(null);

                                setWardNumber("");
                                setWardName("");
                                setWardDescription("");
                                setWardStatus("Active");
                                setWardZoneId(selectedZone.id);

                                setShowWardForm(true);

                            }}
                        >
                            + Add Ward
                        </button>

                    </div>


                    <div className="wards-table-card">

                        <table className="wards-table">

                            <thead>

                                <tr>
                                    <th>Ward No.</th>
                                    <th>Ward Name</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>


                            <tbody>

                                {wards.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="empty-zones"
                                        >
                                            No wards found in this zone.
                                        </td>

                                    </tr>

                                ) : (

                                    wards.map((ward) => (

                                        <tr key={ward.id}>

                                            <td>
                                                {ward.wardNumber}
                                            </td>

                                            <td>
                                                <strong>
                                                    {ward.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {ward.description || "-"}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        ward.status === "Active"
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }
                                                >
                                                    {ward.status}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="zone-actions">

                                                    <button
                                                        className="edit-category-btn"
                                                        title="Edit Ward"
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faPen}
                                                        />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

        </div>
    );
};

// ==========================================
// USER MANAGEMENT
// ==========================================

const renderUserManagement = () => {

    return (
        <section className="dashboard-section user-management-section">

            {/* SEARCH + FILTERS */}

            <div className="user-tools">

                <div className="user-search-wrapper">

                    <FontAwesomeIcon
                        icon={faSearch}
                        className="search-icon"
                    />

                    <input
                        type="text"
                        placeholder="Search by name, email, mobile or ID..."
                        value={userSearchTerm}
                        onChange={(e) =>
                            setUserSearchTerm(e.target.value)
                        }
                    />

                </div>


                <select
                    className="user-filter"
                    value={userRoleFilter}
                    onChange={(e) =>
                        setUserRoleFilter(e.target.value)
                    }
                >
                    <option value="All">
                        All Roles
                    </option>

                    <option value="citizen">
                        Citizen
                    </option>

                    <option value="staff">
                        Staff
                    </option>

                    <option value="admin">
                        Admin
                    </option>

                </select>


                <select
                    className="user-filter"
                    value={userStatusFilter}
                    onChange={(e) =>
                        setUserStatusFilter(e.target.value)
                    }
                >
                    <option value="All">
                        All Status
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Inactive">
                        Inactive
                    </option>

                </select>

            </div>


            {/* USER TABLE */}

            <div className="table-container user-table-container">

                <table className="users-table">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>User</th>

                            <th>Email</th>

                            <th>Mobile</th>

                            <th>Role</th>

                            <th>Status</th>

                            <th>Actions</th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredUsers.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="7"
                                    className="table-empty"
                                >
                                    No users found.
                                </td>

                            </tr>

                        ) : (

                            filteredUsers.map((user) => (

                                <tr key={user.id}>

                                    {/* ID */}

                                    <td>
                                        <strong>
                                            #{user.id}
                                        </strong>
                                    </td>


                                    {/* USER */}

                                    <td>

                                        <div className="user-name-cell">

                                            <div className="user-avatar">

                                                {user.profileImage ? (

                                                    <img
                                                        src={`http://localhost:5000/uploads/${user.profileImage}`}
                                                        alt={user.name}
                                                    />

                                                ) : (

                                                    <span>
                                                        {user.name
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </span>

                                                )}

                                            </div>

                                            <strong>
                                                {user.name}
                                            </strong>

                                        </div>

                                    </td>


                                    {/* EMAIL */}

                                    <td>

                                        <span className="user-email">
                                            {user.email}
                                        </span>

                                    </td>


                                    {/* MOBILE */}

                                    <td>

                                        {user.mobile_no || "N/A"}

                                    </td>


                                    {/* ROLE */}

                                    <td>

                                        <select
                                            className={`role-select role-${user.role}`}
                                            value={user.role}
                                            onChange={(e) =>
                                                updateUserRole(
                                                    user.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="citizen">
                                                Citizen
                                            </option>

                                            <option value="staff">
                                                Staff
                                            </option>

                                            <option value="admin">
                                                Admin
                                            </option>

                                        </select>

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        <span
                                            className={`user-status-badge ${
                                                user.status === "Active"
                                                    ? "user-status-active"
                                                    : "user-status-inactive"
                                            }`}
                                        >

                                            {user.status || "Active"}

                                        </span>

                                    </td>


                                    {/* ACTIONS */}

                                    <td>

                                        <div className="user-actions">

                                            <button
                                                className={
                                                    user.status === "Active"
                                                        ? "user-action-btn deactivate"
                                                        : "user-action-btn activate"
                                                }
                                                onClick={() =>
                                                    updateUserStatus(
                                                        user.id,
                                                        user.status || "Active"
                                                    )
                                                }
                                            >

                                                {user.status === "Active"
                                                    ? "Deactivate"
                                                    : "Activate"}

                                            </button>


                                            <button
                                                className="user-action-btn delete"
                                                onClick={() =>
                                                    deleteUser(user.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </section>
    );
};

// ==========================================
// ANALYTICS & REPORTS
// ==========================================

const renderAnalyticsAndReports = () => {

    // ------------------------------------------
    // STATUS ANALYTICS
    // ------------------------------------------

    const statusCounts = {
        Pending: complaints.filter(
            (complaint) => complaint.status === "Pending"
        ).length,

        "In Progress": complaints.filter(
            (complaint) => complaint.status === "In Progress"
        ).length,

        Resolved: complaints.filter(
            (complaint) => complaint.status === "Resolved"
        ).length,

        Rejected: complaints.filter(
            (complaint) => complaint.status === "Rejected"
        ).length
    };


    // ------------------------------------------
    // PRIORITY ANALYTICS
    // ------------------------------------------

    const priorityCounts = {
        High: complaints.filter(
            (complaint) =>
                (complaint.priority || "").toLowerCase() === "high"
        ).length,

        Medium: complaints.filter(
            (complaint) =>
                (complaint.priority || "").toLowerCase() === "medium"
        ).length,

        Low: complaints.filter(
            (complaint) =>
                (complaint.priority || "").toLowerCase() === "low"
        ).length
    };


    // ------------------------------------------
    // WASTE TYPE ANALYTICS
    // ------------------------------------------

    const analyticsWasteTypeCounts = {};

    complaints.forEach((complaint) => {

        const type = complaint.wasteType || "Unknown";

        analyticsWasteTypeCounts[type] =
            (analyticsWasteTypeCounts[type] || 0) + 1;

    });


    // ------------------------------------------
    // STATUS CHART
    // ------------------------------------------

    const analyticsStatusData = {

        labels: Object.keys(statusCounts),

        datasets: [
            {
                label: "Complaints",

                data: Object.values(statusCounts),

                backgroundColor: [
                    "#eda323",
                    "#4285f4",
                    "#34a853",
                    "#ef4444"
                ],

                borderWidth: 2,
                borderColor: "#ffffff"
            }
        ]
    };


    // ------------------------------------------
    // PRIORITY CHART
    // ------------------------------------------

    const priorityChartData = {

        labels: Object.keys(priorityCounts),

        datasets: [
            {
                label: "Complaints",

                data: Object.values(priorityCounts),

                backgroundColor: [
                    "#ef4444",
                    "#f59e0b",
                    "#22c55e"
                ],

                borderRadius: 8
            }
        ]
    };


    // ------------------------------------------
    // WASTE TYPE CHART
    // ------------------------------------------

    const analyticsWasteTypeData = {

        labels: Object.keys(analyticsWasteTypeCounts),

        datasets: [
            {
                label: "Complaints",

                data: Object.values(
                    analyticsWasteTypeCounts
                ),

                backgroundColor: [
                    "#4CAF50",
                    "#2196F3",
                    "#FF9800",
                    "#9C27B0",
                    "#F44336",
                    "#00ACC1",
                    "#795548"
                ],

                borderRadius: 8
            }
        ]
    };


    // ------------------------------------------
    // RESOLUTION RATE
    // ------------------------------------------

    const totalComplaints =
        complaints.length;

    const resolvedComplaints =
        complaints.filter(
            (complaint) =>
                complaint.status === "Resolved"
        ).length;

    const resolutionRate =
        totalComplaints > 0
            ? Math.round(
                (resolvedComplaints / totalComplaints) * 100
            )
            : 0;


    // ------------------------------------------
    // HIGH PRIORITY RATE
    // ------------------------------------------

    const highPriorityCount =
        priorityCounts.High;

    const highPriorityRate =
        totalComplaints > 0
            ? Math.round(
                (highPriorityCount / totalComplaints) * 100
            )
            : 0;


    return (

        <div className="analytics-page">

            {/* =====================================
                OVERVIEW CARDS
            ===================================== */}

            <div className="analytics-summary-grid">

                <div className="analytics-card">
                    <span className="analytics-card-label">
                        Total Complaints
                    </span>
                    <h2>
                        {stats.totalComplaints || 0}
                    </h2>
                    <p>
                        All complaints received
                    </p>

                </div>


                <div className="analytics-card">

                    <span className="analytics-card-label">
                        Resolved Complaints
                    </span>

                    <h2>
                        {resolvedComplaints}
                    </h2>

                    <p>
                        Successfully resolved
                    </p>

                </div>


                <div className="analytics-card">

                    <span className="analytics-card-label">
                        Resolution Rate
                    </span>

                    <h2>
                        {resolutionRate}%
                    </h2>

                    <p>
                        Overall resolution percentage
                    </p>

                </div>


                <div className="analytics-card">

                    <span className="analytics-card-label">
                        High Priority
                    </span>

                    <h2>
                        {highPriorityCount}
                    </h2>

                    <p>
                        {highPriorityRate}% of total complaints
                    </p>

                </div>

            </div>


            {/* =====================================
                CHARTS ROW 1
            ===================================== */}

            <div className="analytics-charts-grid">

                {/* STATUS */}

                <div className="analytics-chart-card">

                    <div className="analytics-chart-header">
                        <div>
                            <h2>
                                Complaint Status
                            </h2>
                        </div>
                    </div>

                    <div className="analytics-pie-wrapper">
                        <Pie
                            data={analyticsStatusData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,

                                plugins: {
                                    legend: {
                                        position: "bottom"
                                    }
                                }
                            }}
                        />
                    </div>
                </div>


                {/* PRIORITY */}

                <div className="analytics-chart-card">
                    <div className="analytics-chart-header">
                        <div>
                            <h2>
                                Priority Analysis
                            </h2>
                        </div>
                    </div>

                    <div className="analytics-bar-wrapper">
                        <Bar
                            data={priorityChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    x: {
                                        grid: {
                                            display: false
                                        }
                                    },
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            precision: 0
                                        }
                                    }

                                }
                            }}
                        />

                    </div>

                </div>

            </div>


            {/* =====================================
                WASTE TYPE DISTRIBUTION
            ===================================== */}

            <div className="analytics-chart-card analytics-full-width">

                <div className="analytics-chart-header">

                    <div>
                        <h2>
                            Waste Type Analysis
                        </h2>

                        <p>
                            Number of complaints for each waste category
                        </p>

                    </div>

                </div>


                <div className="analytics-large-bar-wrapper">

                    <Bar
                        data={analyticsWasteTypeData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,

                            plugins: {
                                legend: {
                                    display: false
                                },

                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            return ` Complaints: ${context.raw}`;
                                        }
                                    }
                                }
                            },

                            scales: {

                                x: {
                                    grid: {
                                        display: false
                                    }
                                },

                                y: {
                                    beginAtZero: true,

                                    ticks: {
                                        precision: 0
                                    }
                                }

                            }
                        }}
                    />

                </div>

            </div>


            {/* =====================================
                STATUS BREAKDOWN
            ===================================== */}

            <div className="analytics-breakdown-grid">

                <div className="analytics-breakdown-card">

                    <h3>
                        Complaint Status
                    </h3>

                    <div className="analytics-list">

                        <div className="analytics-list-row">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {statusCounts.Pending}
                            </strong>

                        </div>


                        <div className="analytics-list-row">

                            <span>
                                In Progress
                            </span>

                            <strong>
                                {statusCounts["In Progress"]}
                            </strong>

                        </div>


                        <div className="analytics-list-row">

                            <span>
                                Resolved
                            </span>

                            <strong>
                                {statusCounts.Resolved}
                            </strong>

                        </div>


                        <div className="analytics-list-row">

                            <span>
                                Rejected
                            </span>

                            <strong>
                                {statusCounts.Rejected}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* PRIORITY BREAKDOWN */}

                <div className="analytics-breakdown-card">

                    <h3>
                        Priority Breakdown
                    </h3>

                    <div className="analytics-list">

                        <div className="analytics-list-row">

                            <span>
                                High Priority
                            </span>

                            <strong>
                                {priorityCounts.High}
                            </strong>

                        </div>


                        <div className="analytics-list-row">

                            <span>
                                Medium Priority
                            </span>

                            <strong>
                                {priorityCounts.Medium}
                            </strong>

                        </div>


                        <div className="analytics-list-row">

                            <span>
                                Low Priority
                            </span>

                            <strong>
                                {priorityCounts.Low}
                            </strong>

                        </div>
                </div>
                </div>
            </div>


           
            <div className="analytics-report-card">

                <div>

                    <h2>
                        Generate Complaint Report
                    </h2>

                    <p>
                        Download a PDF report containing
                        complaint statistics and complaint details.
                    </p>

                </div>


                <button
                    className="download-button"
                    onClick={downloadReport}
                >

                    <FaDownload
                        style={{ marginRight: "6px" }}
                    />

                    Download Report

                </button>

            </div>

        </div>
    );
};

const renderAIInsights = () => {

    const analyzedComplaints = complaints.filter(
        (complaint) =>
            complaint.wasteType &&
            complaint.wasteType !== "Not analyzed"
    );

    const unanalyzedComplaints = complaints.filter(
        (complaint) =>
            !complaint.wasteType ||
            complaint.wasteType === "Not analyzed"
    );

    const aiWasteCounts = {};
    analyzedComplaints.forEach((complaint) => {
        const type =
            complaint.wasteType || "Unknown";
        aiWasteCounts[type] =
            (aiWasteCounts[type] || 0) + 1;
    });
    const aiHighPriority = analyzedComplaints.filter(
        (complaint) =>
            (complaint.priority || "").toLowerCase() === "high"
    );
    const classificationRate =
        complaints.length > 0
            ? Math.round(
                (analyzedComplaints.length /
                    complaints.length) * 100
            )
            : 0;
    const aiWasteChartData = {
        labels: Object.keys(aiWasteCounts),
        datasets: [
            {
                label: "AI Classified Complaints",
                data: Object.values(aiWasteCounts),
                backgroundColor: [
                    "#4CAF50",
                    "#2196F3",
                    "#FF9800",
                    "#9C27B0",
                    "#F44336",
                    "#00ACC1",
                    "#795548"
                ],
                borderRadius: 8
            }
        ]
    };
    return (
        <div className="ai-insights-page">
            <div className="ai-summary-grid">
                <div className="ai-summary-card">
                    <div className="ai-summary-icon">
                        🤖
                    </div>

                    <div>

                        <span>
                            AI Analyzed
                        </span>

                        <h2>
                            {analyzedComplaints.length}
                        </h2>

                        <p>
                            Complaints classified
                        </p>

                    </div>

                </div>


                <div className="ai-summary-card">

                    <div className="ai-summary-icon">
                        📊
                    </div>

                    <div>

                        <span>
                            Classification Rate
                        </span>

                        <h2>
                            {classificationRate}%
                        </h2>

                        <p>
                            Of total complaints
                        </p>

                    </div>

                </div>
                <div className="ai-summary-card">
                    <div className="ai-summary-icon">
                        ⚠️
                    </div>
                    <div>
                        <span>
                            High Priority
                        </span>
                        <h2>
                            {aiHighPriority.length}
                        </h2>
                        <p>
                            AI priority classification
                        </p>
                    </div>

                </div>

                <div className="ai-summary-card">

                    <div className="ai-summary-icon">
                        🗂️
                    </div>

                    <div>

                        <span>
                            Waste Categories
                        </span>

                        <h2>
                            {Object.keys(aiWasteCounts).length}
                        </h2>

                        <p>
                            Detected categories
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================
                AI CLASSIFICATION CHART
            ===================================== */}

            <section className="ai-section">

                <div className="ai-section-header">

                    <div>

                        <h2>
                            AI Waste Classification
                        </h2>

                        <p>
                            Distribution of waste types identified
                            from complaints
                        </p>

                    </div>

                </div>


                {analyzedComplaints.length === 0 ? (

                    <div className="ai-empty-state">

                        <div>
                            🤖
                        </div>

                        <h3>
                            No AI Classification Data
                        </h3>

                        <p>
                            AI classification results will appear
                            here when complaints are analyzed.
                        </p>

                    </div>

                ) : (

                    <div className="ai-chart-wrapper">

                        <Bar
                            data={aiWasteChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,

                                plugins: {
                                    legend: {
                                        display: false
                                    },

                                    tooltip: {
                                        callbacks: {
                                            label: function (context) {
                                                return ` Classified: ${context.raw}`;
                                            }
                                        }
                                    }
                                },

                                scales: {

                                    x: {
                                        grid: {
                                            display: false
                                        },

                                        ticks: {
                                            font: {
                                                weight: "600"
                                            }
                                        }
                                    },

                                    y: {
                                        beginAtZero: true,

                                        ticks: {
                                            precision: 0
                                        }
                                    }

                                }
                            }}
                        />

                    </div>

                )}

            </section>


            {/* =====================================
                AI INSIGHTS
            ===================================== */}

            <section className="ai-section">

                <div className="ai-section-header">

                    <div>

                        <h2>
                            AI-Generated Insights
                        </h2>

                        <p>
                            Observations based on complaint
                            classification data
                        </p>

                    </div>

                </div>


                <div className="ai-insights-grid">

                    <div className="ai-insight-card">

                        <div className="ai-insight-icon">
                            ♻️
                        </div>

                        <div>

                            <h3>
                                Most Reported Waste
                            </h3>

                            <p>

                                {Object.keys(aiWasteCounts).length > 0
                                    ? Object.keys(aiWasteCounts)
                                        .reduce((a, b) =>
                                            aiWasteCounts[a] >
                                            aiWasteCounts[b]
                                                ? a
                                                : b
                                        )
                                    : "No data available"}

                            </p>

                        </div>

                    </div>


                    <div className="ai-insight-card">

                        <div className="ai-insight-icon">
                            ⚠️
                        </div>

                        <div>

                            <h3>
                                Priority Attention
                            </h3>

                            <p>
                                {aiHighPriority.length} complaints
                                have been classified as high priority.
                            </p>

                        </div>

                    </div>


                    <div className="ai-insight-card">

                        <div className="ai-insight-icon">
                            📍
                        </div>

                        <div>

                            <h3>
                                Waste Hotspots
                            </h3>

                            <p>
                                {hotspots.length} areas have been
                                identified as waste hotspots.
                            </p>

                        </div>

                    </div>


                    <div className="ai-insight-card">

                        <div className="ai-insight-icon">
                            🔍
                        </div>

                        <div>

                            <h3>
                                Pending Analysis
                            </h3>

                            <p>
                                {unanalyzedComplaints.length} complaints
                                are currently not classified.
                            </p>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================
                AI CLASSIFIED COMPLAINTS
            ===================================== */}

            <section className="ai-section">

                <div className="ai-section-header">

                    <div>

                        <h2>
                            AI Classification Results
                        </h2>

                        <p>
                            Recent complaint classification results
                        </p>

                    </div>

                </div>


                <div className="ai-table-container">

                    <table className="ai-table">

                        <thead>

                            <tr>
                                <th>Complaint ID</th>
                                <th>Waste Type</th>
                                <th>Waste Size</th>
                                <th>Priority</th>
                                <th>Status</th>
                            </tr>

                        </thead>


                        <tbody>

                            {analyzedComplaints.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="ai-table-empty"
                                    >
                                        No classification results available.
                                    </td>

                                </tr>

                            ) : (

                                analyzedComplaints.map(
                                    (complaint) => (

                                        <tr key={complaint.id}>

                                            <td>
                                                <strong>
                                                    #{complaint.id}
                                                </strong>
                                            </td>

                                            <td>
                                                {complaint.wasteType}
                                            </td>

                                            <td>
                                                {complaint.wasteSize ||
                                                    "N/A"}
                                            </td>

                                            <td>

                                                <span
                                                    className={`priority-badge priority-${(
                                                        complaint.priority ||
                                                        "low"
                                                    ).toLowerCase()}`}
                                                >
                                                    {complaint.priority ||
                                                        "N/A"}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`status-badge status-${(
                                                        complaint.status || ""
                                                    )
                                                        .toLowerCase()
                                                        .replace(
                                                            /\s+/g,
                                                            "-"
                                                        )}`}
                                                >
                                                    {complaint.status}
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
};

const renderNotifications = () => {
    const highPriorityComplaints = complaints.filter(
        c => (c.priority || "").toLowerCase() === "high"
    );

    const pendingComplaints = complaints.filter(
        c => c.status === "Pending"
    );

    const inProgressComplaints = complaints.filter(
        c => c.status === "In Progress"
    );

    const unresolvedComplaints = complaints.filter(
        c => c.status !== "Resolved" && c.status !== "Rejected"
    );

    return (
        <div className="notifications-page">

            {/* Summary Cards */}
            <div className="notification-summary-grid">

                <div className="notification-summary-card">
                    <div className="notification-icon">⚠️</div>
                    <div>
                        <span>High Priority</span>
                        <h2>{highPriorityComplaints.length}</h2>
                    </div>
                </div>

                <div className="notification-summary-card">
                    <div className="notification-icon">🕐</div>
                    <div>
                        <span>Pending</span>
                        <h2>{pendingComplaints.length}</h2>
                    </div>
                </div>

                <div className="notification-summary-card">
                    <div className="notification-icon">🔄</div>
                    <div>
                        <span>In Progress</span>
                        <h2>{inProgressComplaints.length}</h2>
                    </div>
                </div>

                <div className="notification-summary-card">
                    <div className="notification-icon">📋</div>
                    <div>
                        <span>Needs Attention</span>
                        <h2>{unresolvedComplaints.length}</h2>
                    </div>
                </div>

            </div>

            {/* System Alerts */}
            <section className="notifications-section">

                <div className="notifications-section-header">
                    <div>
                        <h2>System Alerts</h2>
                        <p>Important complaints and system notifications</p>
                    </div>

                    <span className="notification-count">
                        {highPriorityComplaints.length + pendingComplaints.length} Alerts
                    </span>
                </div>

                <div className="notification-list">

                    {/* High Priority Notifications */}
                    {highPriorityComplaints.map(complaint => (
                        <div
                            className="notification-item notification-high"
                            key={`high-${complaint.id}`}
                        >
                            <div className="notification-item-icon">
                                ⚠️
                            </div>

                            <div className="notification-content">
                                <h3>High Priority Complaint</h3>

                                <p>
                                    Complaint #{complaint.id} requires immediate attention.
                                </p>

                                <span>
                                    Waste Type: {complaint.wasteType || "Unknown"}
                                </span>
                            </div>

                            <button
                                className="notification-action-btn"
                                onClick={() => {
                                    setActiveSection("complaints");
                                    setSearchTerm(String(complaint.id));
                                }}
                            >
                                View
                            </button>
                        </div>
                    ))}

                    {/* Pending Notifications */}
                    {pendingComplaints.map(complaint => (
                        <div
                            className="notification-item notification-pending"
                            key={`pending-${complaint.id}`}
                        >
                            <div className="notification-item-icon">
                                🕐
                            </div>

                            <div className="notification-content">
                                <h3>Pending Complaint</h3>

                                <p>
                                    Complaint #{complaint.id} is waiting for action.
                                </p>

                                <span>
                                    Waste Type: {complaint.wasteType || "Unknown"}
                                </span>
                            </div>

                            <button
                                className="notification-action-btn"
                                onClick={() => {
                                    setActiveSection("complaints");
                                    setSearchTerm(String(complaint.id));
                                }}
                            >
                                View
                            </button>
                        </div>
                    ))}

                    {/* No Alerts */}
                    {highPriorityComplaints.length === 0 &&
                        pendingComplaints.length === 0 && (
                            <div className="notification-empty">
                                <div>✓</div>

                                <h3>No Critical Alerts</h3>

                                <p>
                                    There are currently no high-priority or
                                    pending complaints requiring attention.
                                </p>
                            </div>
                        )}

                </div>
            </section>

            {/* System Status */}
            <section className="notifications-section">

                <div className="notifications-section-header">
                    <div>
                        <h2>System Status</h2>
                        <p>Current complaint management status</p>
                    </div>
                </div>

                <div className="system-status-list">

                    <div className="system-status-row">
                        <span>Complaint Monitoring</span>
                        <strong className="system-online">
                            ● Active
                        </strong>
                    </div>

                    <div className="system-status-row">
                        <span>Waste Classification</span>
                        <strong className="system-online">
                            ● Active
                        </strong>
                    </div>

                    <div className="system-status-row">
                        <span>Priority Monitoring</span>
                        <strong className="system-online">
                            ● Active
                        </strong>
                    </div>

                    <div className="system-status-row">
                        <span>Hotspot Monitoring</span>
                        <strong className="system-online">
                            ● Active
                        </strong>
                    </div>

                </div>

            </section>

        </div>
    );
};


    // ==========================================
    // MAIN CONTENT
    // ==========================================

    const renderContent = () => {

        switch (activeSection) {

            case "dashboard":
                return renderDashboard();

            case "complaints":
                return renderComplaintManagement();

            case "users":
                return renderUserManagement();

            case "categories":
                return renderWasteCategories();

            case "zones":
                return renderZonesAndWards();

            case "analytics":
                return renderAnalyticsAndReports();

            case "notifications":
                return renderNotifications();

            case "ai":
                return renderAIInsights();

            default:
                return renderDashboard();

        }
    };


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className={`admin-dashboard ${
            sidebarCollapsed ? "sidebar-collapsed" : ""}`}>

            {/* ==================================
                SIDEBAR
            ================================== */}



            <aside className="admin-sidebar">

                <button
                className="sidebar-toggle"
                onClick={() =>
                    setSidebarCollapsed(!sidebarCollapsed)
                }
                title={
                    sidebarCollapsed
                        ? "Open sidebar"
                        : "Close sidebar"
                }
            >
                {sidebarCollapsed ? "☰" : "☰"}
            </button>
                <div className="sidebar-brand">

                    <div className="sidebar-logo">
                        🌱
                    </div>

                    <div>

                        <h2>
                            SwachhLens
                        </h2>

                    </div>

                </div>


                <nav className="sidebar-nav">

                    <button
                        className={
                            activeSection === "dashboard"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("dashboard")
                        }
                    >
                        Dashboard
                    </button>


                    <button
                        className={
                            activeSection === "complaints"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("complaints")
                        }
                    >
                        Complaints
                    </button>


                    <button
                        className={
                            activeSection === "users"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("users")
                        }
                    >
                        Users
                    </button>


                    <button
                        className={
                            activeSection === "categories"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("categories")
                        }
                    >
                        Waste Categories
                    </button>


                    <button
                        className={
                            activeSection === "zones"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("zones")
                        }
                    >
                        Zones & Wards
                    </button>


                    <button
                        className={
                            activeSection === "analytics"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("analytics")
                        }
                    >
                        Analytics & Reports
                    </button>


                    <button
                        className={
                            activeSection === "notifications"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("notifications")
                        }
                    >
                        Notifications
                    </button>


                    <button
                        className={
                            activeSection === "ai"
                                ? "sidebar-item active"
                                : "sidebar-item"
                        }
                        onClick={() =>
                            setActiveSection("ai")
                        }
                    >
                        AI Insights
                    </button>

                </nav>


                <div className="sidebar-bottom">

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                         Logout
                    </button>

                </div>

            </aside>


            {/* ==================================
                MAIN AREA
            ================================== */}

            <main className="admin-main">

                <header className="admin-topbar">

                    <div>

                        <h2>
                            {activeSection === "dashboard"
                                ? "Dashboard"
                                : activeSection === "complaints"
                                    ? "Complaints "
                                    : activeSection === "users"
                                        ? "User Details"
                                        : activeSection === "categories"
                                            ? "Waste Categories"
                                            : activeSection === "zones"
                                                ? "Zones & Wards"
                                                : activeSection === "analytics"
                                                    ? "Analytics & Reports"
                                                    : activeSection === "notifications"
                                                        ? "Notifications"
                                                        : "AI Insights"}
                        </h2>

                    </div>


                    <div
                        className="admin-user"
                        onClick={ () => navigate("/admin/profile")}
                        title="Admin Profile"
                    >

                    </div>

                </header>


                <div className="admin-content">

                    {renderContent()}

                </div>

            </main>

        </div>

    );
}

export default AdminDashboard;