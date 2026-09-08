import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import CitizenDashboard from "./pages/CitizenDashboard";
import CreateComplaint from "./pages/CreateComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";
import MapView from "./pages/MapView";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

import Home from "./pages/Home";




function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/home" element={<Home />}/>

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                


                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/citizen"
                    element={
                        <ProtectedRoute allowedRole="citizen">
                            <CitizenDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-complaint"
                    element={
                        <ProtectedRoute>
                            <CreateComplaint />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/complaint/:id"
                    element={
                        <ProtectedRoute>
                            <ComplaintDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/map"
                    element={
                        <ProtectedRoute>
                            <MapView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/notifications"
                    element={<Notifications />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;