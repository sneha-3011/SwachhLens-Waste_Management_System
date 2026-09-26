import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminProfile.css";

function AdminProfile() {

    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // ===============================
    // FETCH ADMIN PROFILE
    // ===============================

    useEffect(() => {

        const fetchAdminProfile = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/auth/profile",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setAdmin(response.data);

            } catch (error) {

                console.error(
                    "Admin Profile Error:",
                    error.response?.data ||
                    error.message
                );

            } finally {

                setLoading(false);

            }

        };

        fetchAdminProfile();

    }, []);


    // ===============================
    // HANDLE INPUT CHANGE
    // ===============================

    const handleInputChange = (field, value) => {

        setAdmin((prev) => ({
            ...prev,
            [field]: value
        }));

    };


    // ===============================
    // SAVE PROFILE
    // ===============================

    const handleSaveProfile = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.put(

                "http://localhost:5000/api/auth/profile",

                {
                    name: admin.name,
                    email: admin.email,
                    mobile_no: admin.mobile_no
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );

            setAdmin(response.data.user);

            setIsEditing(false);

            alert(
                "Profile updated successfully."
            );

        } catch (error) {

            console.error(
                "Update Profile Error:",
                error.response?.data ||
                error.message
            );

            alert(
                error.response?.data?.message ||
                "Failed to update profile."
            );

        }

    };


    // ===============================
    // CANCEL EDITING
    // ===============================

    const handleCancelEdit = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/auth/profile",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setAdmin(response.data);

        } catch (error) {

            console.error(
                "Reload Profile Error:",
                error
            );

        }

        setIsEditing(false);

    };


    // ===============================
    // LOGOUT
    // ===============================

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };


    // ===============================
    // LOADING
    // ===============================

    if (loading) {

        return (

            <div className="admin-profile-layout">

                <main className="admin-profile-main">

                    <div className="admin-profile-loading">

                        Loading Profile...

                    </div>

                </main>

            </div>

        );

    }


    // ===============================
    // PROFILE PAGE
    // ===============================

    return (

        <div className="admin-profile-layout">

            <main className="admin-profile-main">
            
                {/* =================================
                    PROFILE CARD
                ================================= */}

                <section className="admin-profile-content">

                    <div className="admin-profile-card">


                        {/* PROFILE IMAGE */}

                        <div className="admin-profile-avatar">

                            {admin?.profileImage ? (

                                <img
                                    src={`http://localhost:5000/uploads/${admin.profileImage}`}
                                    alt="Admin Profile"
                                />

                            ) : (

                                <span>👤</span>

                            )}

                        </div>


                        {/* NAME */}

                        <h1>
                            {admin?.name ||
                                "Administrator"}
                        </h1>


                        {/* ROLE */}

                        <span className="admin-role">

                            System Administrator

                        </span>


                        {/* EDIT BUTTON */}

                        {!isEditing && (

                            <button
                                className="edit-profile-btn"
                                onClick={() =>
                                    setIsEditing(true)
                                }
                            >

                                Edit Profile

                            </button>

                        )}


                        {/* =================================
                            PROFILE DETAILS
                        ================================= */}

                        <div className="admin-profile-details">


                            {/* NAME */}

                            <div className="profile-detail">

                                <span>
                                    Name
                                </span>

                                {isEditing ? (

                                    <input
                                        type="text"
                                        value={
                                            admin?.name || ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />

                                ) : (

                                    <strong>
                                        {admin?.name ||
                                            "N/A"}
                                    </strong>

                                )}

                            </div>


                            {/* EMAIL */}

                            <div className="profile-detail">

                                <span>
                                    Email
                                </span>

                                {isEditing ? (

                                    <input
                                        type="email"
                                        value={
                                            admin?.email || ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "email",
                                                e.target.value
                                            )
                                        }
                                    />

                                ) : (

                                    <strong>
                                        {admin?.email ||
                                            "N/A"}
                                    </strong>

                                )}

                            </div>


                            {/* MOBILE NUMBER */}

                            <div className="profile-detail">

                                <span>
                                    Mobile Number
                                </span>

                                {isEditing ? (

                                    <input
                                        type="text"
                                        value={
                                            admin?.mobile_no ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "mobile_no",
                                                e.target.value
                                            )
                                        }
                                    />

                                ) : (

                                    <strong>
                                        {admin?.mobile_no ||
                                            "N/A"}
                                    </strong>

                                )}

                            </div>


                            {/* ROLE */}

                            <div className="profile-detail">

                                <span>
                                    Role
                                </span>

                                <strong>
                                    {admin?.role ||
                                        "admin"}
                                </strong>

                            </div>


                        </div>


                        {/* =================================
                            EDIT ACTIONS
                        ================================= */}

                        {isEditing && (

                            <div className="profile-actions">

                                <button
                                    className="save-profile-btn"
                                    onClick={
                                        handleSaveProfile
                                    }
                                >
                                    Save Changes
                                </button>


                                <button
                                    className="cancel-profile-btn"
                                    onClick={
                                        handleCancelEdit
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        )}


                        {/* LOGOUT */}

                        <button
                            className="admin-logout-btn"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>


                    </div>

                </section>

            </main>

        </div>

    );

}

export default AdminProfile;

