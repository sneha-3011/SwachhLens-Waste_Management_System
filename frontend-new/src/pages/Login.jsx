import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Please enter both email and password");
            return;
        }

        try {

            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: email.trim(),
                    password: password
                }
            );

            console.log(
                "LOGIN RESPONSE:",
                response.data
            );

            // Save JWT
            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );
 
            const role=response.data.user.role;
            console.log("USER ROLE:",role);
            

            // Redirect based on role
            if (role === "admin") {

                navigate("/admin");

            } else if (role === "citizen") {

                navigate("/citizen");

            }
            else{
                navigate("/home");
            }

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error.response?.data || error.message
            );

            setError(
                error.response?.data?.message ||
                "Invalid email or password"
            );

        } finally {

            setLoading(false);

        }
    };

    return (

        <div className="login-page">

            <div className="login-card">

                <div className="login-logo">
                    🌱
                </div>

                <h1>
                    Welcome Back
                </h1>

                <p className="login-subtitle">
                    Login to your SwachhLens account
                </p>

                {error && (
                    <div className="login-error">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    {/* Email */}

                    <div className="login-input-group">

                        

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Email"
                            autoComplete="email"
                        />

                    </div>

                    {/* Password */}

                    <div className="login-input-group">

                    

                        <div className="password-wrapper">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Password"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="show-password"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <p className="register-link">

                    Don't have an account?{" "}

                    <Link to="/register">
                        Create an account
                    </Link>

                </p>

            </div>

        </div>

    );
}

export default Login;