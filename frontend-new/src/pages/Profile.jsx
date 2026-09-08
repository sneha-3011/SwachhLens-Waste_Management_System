import { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {

    const [user, setUser] = useState(null);
    const[error, setError]= useState("");
    const handleProfileImageChange = async (e) => {

    const file = e.target.files[0];

    if (!file) {
        return;
    }

    try {
        setError("");

        const token = localStorage.getItem("token");

        if(!token){
            setError(
                "You are not logged in. Please login again"
            );
            return ;
        }

        const formData = new FormData();

        formData.append("profileImage", file);

        const response = await axios.put(
            "http://localhost:5000/api/auth/profile/image",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    
                }
            }
        );

        setUser(response.data.user);

        alert("Profile image updated successfully");

    } catch (error) {

        console.error(
            "Profile Image Error:",
            error.response?.data || error.message
        );

        setError(
            error.response?.data?.message ||
            "Failed to update profile image"
        );

        alert(
            error.response?.data?.message ||
            "Failed to update profile image"
        );

    }
};

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                setError("");

                const token = localStorage.getItem("token");

                if(!token){
                    setError("No login token found. Please login again");
                    return;
                }

                console.log("PROFILE TOKEN:",token);

                const response = await axios.get(
                    "http://localhost:5000/api/auth/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("PROFILE RESPONSE:",
                    response.data
                );

                setUser(response.data);

            } catch (error) {

                console.error(
                    "Profile Fetch Error:",
                    error.response?.data ||
                    error.message
                );

                setError(
                    error.response?.data?.message || "Failed to load profile"
                );

            }

        };

        fetchProfile();

    }, []);

    if(error){
        return(
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-card">
                        <h2> Unable to Load Profile</h2>
                        <p>{error}</p>

                        <button className="profile-back-btn"
                        onClick={() => window.location.href="/login"}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <h2>Loading...</h2>;
    }

    return (
    <div className="profile-page">

        <div className="profile-container">

            {/* Header */}

            <div className="profile-header">

                <label className="profile-image-container">

                    {user.profileImage ? (
                        <img
                            src={`http://localhost:5000/uploads/${user.profileImage}`}
                            alt="Profile"
                            className="profile-image"
                        />
                    ) : (
                        <div className="profile-placeholder">
                            👤
                        </div>
                    )}

                    

                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleProfileImageChange}
                    />

                </label>

                <h1>My Profile</h1>

                <p>
                    View your account information
                </p>

            </div>


            {/* Profile Card */}

            <div className="profile-card">

                <div className="profile-info">

                    <div className="profile-row">

                        <span className="profile-label">
                            Name
                        </span>

                        <span className="profile-value">
                            {user.name}
                        </span>

                    </div>


                    <div className="profile-row">

                        <span className="profile-label">
                            Email
                        </span>

                        <span className="profile-value">
                            {user.email}
                        </span>

                    </div>


                    <div className="profile-row">

                        <span className="profile-label">
                            Role
                        </span>

                        <span className="profile-role">
                            {user.role}
                        </span>

                    </div>


                    <div className="profile-row">

                        <span className="profile-label">
                            Joined
                        </span>

                        <span className="profile-value">
                            {user.createdAt?new Date(
                                user.createdAt
                            ).toLocaleDateString()
                            :"Not available"}
                        </span>

                    </div>

                </div>

            </div>


            {/* Back Button */}

            <button
                className="profile-back-btn"
                onClick={() =>
                    window.location.href = "/citizen"
                }
            >
                ← Back to My Complaints
            </button>

        </div>

    </div>
);
}

export default Profile;