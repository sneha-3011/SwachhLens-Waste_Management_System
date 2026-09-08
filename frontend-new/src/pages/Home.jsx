import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import snapReport from "../assets/snap_report.png";
import locateAnalyze from "../assets/locate_analyze.png";
import trackResolve from "../assets/track_resolve.png";
import dustbin from "../assets/dustbin.png";
import { FaBrain, FaMapMarkerAlt, FaBell, FaLightbulb } from "react-icons/fa";

function Home() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    // ==========================================
    // SUBMIT COMPLAINT
    // ==========================================

    const handleSubmitComplaint = () => {

        if (token) {
            navigate("/create-complaint");
        } else {
            navigate("/login");
        }

    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");

    };


    // ==========================================
    // TRACK COMPLAINT
    // ==========================================

    const handleTrackComplaint = () => {
        if (token) {
            navigate("/citizen");
        } else {
            navigate("/login");
        }

    };


    return (

        <div className="home-page">
            {/* =========================================
                NAVBAR
            ========================================= */}
            <nav className="home-navbar">
                <div
                    className="home-logo"
                    onClick={() => navigate("/")}
                >
                    <span className="logo-leaf">🌱</span>
                    <span>SwachhLens</span>
                </div>


                <div className="nav-buttons">
                    <Link
                        to="/"
                        className="nav-home"
                    >
                        Home
                    </Link>


                    {token ? (

                        <>
                            <button
                                className="nav-complaints"
                                onClick={() =>
                                    navigate("/citizen")
                                }
                            >
                                My Complaints
                            </button>

                            <button
                                className="nav-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>

                    ) : (

                        <>
                            <Link
                                to="/login"
                                className="nav-login"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="nav-register"
                            >
                                Register
                            </Link>
                        </>

                    )}

                </div>

            </nav>



            {/* =========================================
                HERO
            ========================================= */}

            <section className="hero-section">

                {/* Dark background overlay */}

                <div className="hero-overlay"></div>

                {/* Decorative background elements */}

                <div className="background-bin background-bin-one">
                    🗑️
                </div>

                <div className="background-bin background-bin-two">
                    ♻️
                </div>

                <div className="background-bin background-bin-three">
                    🗑️
                </div>


                {/* =====================================
                    HERO CONTENT
                ===================================== */}

                <div className="hero-content">

                    <div className="hero-badge">
                        ♻️ AI-Powered Smart Waste Management
                    </div>

                    <h1>
                        Together,
                        <span>
                            Let's Keep Our Cities Clean
                        </span>
                    </h1>

                    <p>
                        See waste. Report it. Track the action.
                        Make your neighborhood cleaner with
                        smarter technology.
                    </p>

                    <div className="hero-buttons">

                        <button
                            className="hero-primary"
                            onClick={handleSubmitComplaint}
                        >
                            Submit a Complaint
                            <span>→</span>
                        </button>

                        <button
                            className="hero-secondary"
                            onClick={handleTrackComplaint}
                        >
                            Track My Complaint
                        </button>

                        <br></br>

                    </div>

                </div>
               

                

            </section>



            {/* =========================================
                HOW IT WORKS
            ========================================= */}

            <section className="workflow-section">

                <div className="section-heading">

                    <span>
                        How It Works
                    </span>
                    <br></br>
                    <p>
                        Reporting waste takes only a few seconds.
                        SwachhLens helps turn your report into action.
                    </p>

                </div>


                <div className="workflow-grid">


                    {/* STEP 1 */}

                    <div className="workflow-card">

                        <div className="workflow-image workflow-image-one">

                            <img
                                src={snapReport}
                                alt="Snap and Report"
                            />

                        </div>


                        <div className="workflow-number">
                            01
                        </div>


                        <h3>
                            Snap & Report
                        </h3>


                        <p>
                            Take a photo of the waste or
                            overflowing garbage and submit
                            a complaint.
                        </p>

                    </div>



                    {/* STEP 2 */}

                    <div className="workflow-card">

                        <div className="workflow-image workflow-image-two">

                            <img
                                src={locateAnalyze}
                                alt="Locate and Analyze"
                            />

                        </div>


                        <div className="workflow-number">
                            02
                        </div>


                        <h3>
                            Locate & Analyze
                        </h3>


                        <p>
                            Your location and complaint data
                            help identify the type and priority
                            of the waste.
                        </p>

                    </div>



                    {/* STEP 3 */}

                    <div className="workflow-card">

                        <div className="workflow-image workflow-image-three">

                            <img
                                src={trackResolve}
                                alt="Track and Resolve"
                            />

                        </div>


                        <div className="workflow-number">
                            03
                        </div>


                        <h3>
                            Track & Resolve
                        </h3>


                        <p>
                            Follow your complaint status while
                            authorities take action to resolve it.
                        </p>

                    </div>

                </div>

            </section>



            {/* =========================================
                ACTION SECTION
            ========================================= */}

            <section className="action-section">

                <div className="action-content">

                    <div>

                        <span className="action-label">
                            SEE A PROBLEM?
                        </span>

                        <h2>
                            Don't Just Walk Past It.
                        </h2>

                        <p>
                            One picture can help authorities
                            identify and resolve a waste problem
                            in your neighborhood.
                        </p>

                    </div>


                    <button
                        className="action-button"
                        onClick={handleSubmitComplaint}
                    >
                        Report Waste Now →
                    </button>

                </div>

            </section>



            {/* =========================================
                SMART FEATURES
            ========================================= */}

            <section className="features-section">

                <div className="section-heading">

                    <span>
                        Why Swachhlens?
                    </span>
                    <br></br>
                    <p>
                        Technology that helps citizens and
                        authorities work together for cleaner cities.
                    </p>

                </div>


                <div className="features-grid">


                    {/* FEATURE 1 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <FaBrain color="#2ecc71" size={28} />
                        </div>

                        <h3>
                            AI Waste Analysis
                        </h3>

                        <p>
                            Analyze reported waste and identify
                            useful information such as waste type,
                            size and priority.
                        </p>

                    </div>



                    {/* FEATURE 2 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <FaMapMarkerAlt color="#3498db" size={28} />
                        </div>

                        <h3>
                            Location Based Reports
                        </h3>

                        <p>
                            Every complaint can include its
                            location so problems can be addressed
                            efficiently.
                        </p>

                    </div>



                    {/* FEATURE 3 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <FaBell color="#f39c12" size={28} />
                        </div>

                        <h3>
                            Complaint Updates
                        </h3>

                        <p>
                            Stay informed about the progress
                            of your submitted complaints.
                        </p>

                    </div>



                    {/* FEATURE 4 */}

                    <div className="feature-card">

                        <div className="feature-icon">
                            <FaLightbulb color="#f1c40f" size={28} />
                        </div>

                        <h3>
                            Smart Decisions
                        </h3>

                        <p>
                            Turn waste reports into useful
                            information for better city management.
                        </p>

                    </div>

                </div>

            </section>



            {/* =========================================
                FINAL CTA
            ========================================= */}

            <section className="final-cta">

                <div className="final-cta-icon">
                    🌱
                </div>


                <h2>
                    A Cleaner City Starts With You.
                </h2>


                <p>
                    Spot waste. Report it. Track it.
                    Help make your community cleaner.
                </p>


                <button
                    className="final-button"
                    onClick={handleSubmitComplaint}
                >
                    Submit a Complaint →
                </button>

            </section>



            {/* =========================================
                FOOTER
            ========================================= */}

            <footer className="home-footer">

                <div className="footer-logo">
                    🌱 SwachhLens
                </div>


                <p>
                    AI-Powered Waste Response Decision
                    Support System
                </p>


                


                <p className="copyright">

                    © 2026 SwachhLens.
                    Building cleaner communities through technology.

                </p>

            </footer>

        </div>

    );

}

export default Home;