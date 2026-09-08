import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        mobile_no: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

        if (!passwordRegex.test(formData.password)) {
            setError(
                "Password must be at least 6 characters and contain uppercase, lowercase, number, and special character"
            );
            return;
        }

        try {

            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                formData
            );

            console.log( "REGISTER RESPONSE:", response.data );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(
                    response.data.user
                )
            );

            setSuccess(
                "Registration successfu! Redirecting..."
            );

            const role=response.data.user?.role;

            setTimeout(()=>{
                if (role === "admin"){
                    navigate("/admin");
                }
                else{
                    navigate("/citizen");
                }
            }, 800);

        } catch (error) {

            console.error(
                "Registration Error:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="register-page">

            <div className="register-card">

                <div className="register-logo">
                    🌱
                </div>

                <h1>Join SwachhLens</h1>

                <p className="register-subtitle">
                    Help build a cleaner and smarter city
                </p>

                {error && (
                    <div className="message error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="message success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="input-group">

                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="input-group"> 
                        <label> Mobile Number </label>
                         <input 
                            type="tel" 
                            name="mobile_no" 
                            placeholder="Mobile Number" 
                            value={formData.mobile_no} 
                            onChange={handleChange} 
                          /> 
                    </div>

                    <div className="input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                <p className="login-text">
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </div>

        </div>

    );
}

export default Register;