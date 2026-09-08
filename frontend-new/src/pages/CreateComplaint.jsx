import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateComplaint.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

function CreateComplaint() {
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [location, setLocation] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [comment, setComment] = useState("");

    const navigate = useNavigate();



    // Automatically detect user's location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error("Location Error:", error);
                }
            );
        }
    }, []);

    const getCurrentLocation = () => {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            setLatitude(lat);
            setLongitude(lng);

            try {

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                );

                const data = await response.json();

                const address =
                    data.display_name ||
                    `${lat}, ${lng}`;

                setLocation(address);

            } catch (error) {

                console.error("Address Error:", error);

                setLocation(
                    `Location detected (${lat.toFixed(4)}, ${lng.toFixed(4)})`
                );
            }
        },

        (error) => {
            console.error("Location Error:", error);

            alert(
                "Unable to detect your location. Please enter it manually."
            );
        }
    );
};

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            alert("Please enter complaint title");
            return;
        }

        if (!image) {
            alert("Please upload a waste image");
            return;
        }

        if (!comment.trim()) {
            alert("Please enter complaint description");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const formData = new FormData();

            formData.append("title", title);
            formData.append("image", image);
            formData.append("latitude", latitude);
            formData.append("longitude", longitude);
            formData.append("comment", comment);

            const response = await axios.post(
                "http://localhost:5000/api/complaints/create",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log(response.data);

            alert("Complaint submitted successfully");

            navigate("/citizen");

        } catch (error) {
            console.error(
                error.response?.data || error.message
            );

            alert("Complaint submission failed");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="create-complaint-page">

            {/* ================= NAVBAR ================= */}
            <nav className="create-navbar">

                <div
                    className="navbar-logo"
                    onClick={() => navigate("/citizen")}
                >
                    🌱 <span>SwachhLens</span>
                </div>

                <div className="navbar-right">

                    <button
                        className="my-complaints-btn"
                        onClick={() => navigate("/citizen")}
                    >
                        My Complaints
                    </button>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* ================= MAIN CONTENT ================= */}
            <main className="create-main">

                <div className="create-complaint-container">

                    <div className="create-complaint-header">

                        <h1>Create Complaint</h1>

                        <p>
                            Report a waste-related issue in your area.
                        </p>

                    </div>


                    {/* ================= FORM CARD ================= */}
                    <div className="complaint-form-card">

                        <form onSubmit={handleSubmit}>

                            {/* Complaint Title */}
                            <div className="form-group">

                                <label>
                                    Complaint Title
                                </label>

                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Garbage overflowing near main road"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                />

                            </div>


                            {/* Location */}
                            <div className="form-group">

                                <div className="location-header">
                                    <label><FontAwesomeIcon icon={faLocationDot} /> Location</label>

                                    <button
                                        type="button"
                                        className="use-location-btn"
                                        onClick={getCurrentLocation}
                                    >
                                        <FontAwesomeIcon icon={faLocationDot} />
                                        Use My Location
                                    </button>
                                </div>

                                <div className="location-input-wrapper">
                                    <input
                                        type="text"
                                        className="location-input"
                                        placeholder="Enter location (e.g. Main Street, Delhi)"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>

                            </div>

                            {/* Upload Image */}
                            <div className="form-group">

                                <label>
                                    Upload Photo
                                </label>

                                <div className="upload-box">

                                    <div className="upload-icon">
                                        📷
                                    </div>

                                    <div className="upload-text">
                                        <strong>
                                            Upload waste photo
                                        </strong>

                                        <span>
                                            JPG, PNG or JPEG
                                        </span>
                                    </div>

                                    <input
                                        className="file-input"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setImage(e.target.files[0])
                                        }
                                    />

                                </div>

                                {image && (
                                    <div className="selected-file">
                                        ✓ {image.name}
                                    </div>
                                )}

                            </div>


                            {/* Description */}
                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    className="complaint-textarea"
                                    placeholder="Describe the waste-related issue in detail..."
                                    value={comment}
                                    onChange={(e) =>
                                        setComment(e.target.value)
                                    }
                                />

                            </div>


                            {/* Buttons */}
                            <div className="form-buttons">

                                <button
                                    type="submit"
                                    className="submit-complaint-btn"
                                >
                                    Submit Complaint
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default CreateComplaint;