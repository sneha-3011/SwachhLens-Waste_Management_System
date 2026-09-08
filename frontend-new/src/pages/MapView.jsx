import { useEffect, useState } from "react";
import axios from "axios";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function MapView() {

    const [complaints, setComplaints] = useState([]);

    useEffect(() => {

        const fetchComplaints = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/complaints/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setComplaints(
                    response.data.complaints || []
                );

            } catch (error) {

                console.error(
                    error.response?.data ||
                    error.message
                );

            }

        };

        fetchComplaints();

    }, []);


    return (

        <div>

            <h1>
                Complaint Map
            </h1>

            <MapContainer
                center={[20.2961, 85.8245]}
                zoom={6}
                style={{
                    height: "500px",
                    width: "100%"
                }}
            >

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {complaints.map((complaint) => (

                    complaint.latitude &&
                    complaint.longitude && (

                        <Marker
                            key={complaint.id}
                            position={[
                                complaint.latitude,
                                complaint.longitude
                            ]}
                        >

                            <Popup>

                                <b>
                                    Complaint #
                                    {complaint.id}
                                </b>

                                <br />

                                Status:
                                {" "}
                                {complaint.status}

                                <br />

                                {complaint.comment}

                            </Popup>

                        </Marker>

                    )

                ))}

            </MapContainer>

        </div>

    );

}

export default MapView;