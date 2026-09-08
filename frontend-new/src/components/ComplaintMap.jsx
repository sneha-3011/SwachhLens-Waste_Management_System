
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";


// ==========================================
// BLUE ICON - NORMAL COMPLAINT
// ==========================================

const complaintIcon = new L.Icon({

    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],

    popupAnchor: [1, -34],

    shadowSize: [41, 41]

});


// ==========================================
// RED ICON - WASTE HOTSPOT
// ==========================================

const hotspotIcon = new L.Icon({

    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",

    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],

    popupAnchor: [1, -34],

    shadowSize: [41, 41]

});


// ==========================================
// MAP COMPONENT
// ==========================================

function ComplaintMap({
    complaints,
    hotspots
}) {

    const defaultPosition = [
        20.3508,
        85.8056
    ];


    return (

        <div>

            {/* ================================= */}
            {/* MAP */}
            {/* ================================= */}

            <MapContainer

                center={defaultPosition}

                zoom={6}

                style={{
                    height: "500px",
                    width: "100%",
                    marginTop: "20px"
                }}

            >

                {/* OpenStreetMap */}

                <TileLayer

                    attribution='&copy; OpenStreetMap contributors'

                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                />


                {/* ================================= */}
                {/* NORMAL COMPLAINT MARKERS */}
                {/* ================================= */}

                {complaints.map(
                    (complaint) => {

                        if (
                            complaint.latitude === null ||
                            complaint.longitude === null
                        ) {

                            return null;

                        }


                        return (

                            <Marker

                                key={
                                    `complaint-${complaint.id}`
                                }

                                position={[
                                    Number(
                                        complaint.latitude
                                    ),

                                    Number(
                                        complaint.longitude
                                    )
                                ]}

                                icon={
                                    complaintIcon
                                }

                            >

                                <Popup>

                                    <h3>
                                        Complaint #
                                        {complaint.id}
                                    </h3>


                                    <p>
                                        <strong>
                                            Status:
                                        </strong>{" "}
                                        {complaint.status}
                                    </p>


                                    <p>
                                        <strong>
                                            Waste Type:
                                        </strong>{" "}
                                        {complaint.wasteType ||
                                            "Not analyzed"}
                                    </p>


                                    <p>
                                        <strong>
                                            Waste Size:
                                        </strong>{" "}
                                        {complaint.wasteSize ||
                                            "Not analyzed"}
                                    </p>


                                    <p>
                                        <strong>
                                            Priority:
                                        </strong>{" "}
                                        {complaint.priority ||
                                            "Not analyzed"}
                                    </p>


                                    <p>
                                        <strong>
                                            Comment:
                                        </strong>{" "}
                                        {complaint.comment ||
                                            "No comment"}
                                    </p>


                                </Popup>

                            </Marker>

                        );

                    }
                )}


                {/* ================================= */}
                {/* HOTSPOT MARKERS */}
                {/* ================================= */}

                {hotspots.map(
                    (hotspot, index) => {

                        if (
                            hotspot.latitude === null ||
                            hotspot.longitude === null
                        ) {

                            return null;

                        }


                        return (

                            <Marker

                                key={
                                    `hotspot-${index}`
                                }

                                position={[
                                    Number(
                                        hotspot.latitude
                                    ),

                                    Number(
                                        hotspot.longitude
                                    )
                                ]}

                                icon={
                                    hotspotIcon
                                }

                            >

                                <Popup>

                                    <h3>
                                        🔴 Waste Hotspot #
                                        {index + 1}
                                    </h3>


                                    <p>
                                        <strong>
                                            Complaints:
                                        </strong>{" "}

                                        {
                                            hotspot.complaintCount
                                        }

                                    </p>


                                    <p>
                                        <strong>
                                            High Priority:
                                        </strong>{" "}

                                        {
                                            hotspot.highPriorityCount
                                        }

                                    </p>


                                    <p>
                                        <strong>
                                            Complaint IDs:
                                        </strong>{" "}

                                        {
                                            hotspot.complaints
                                                ?.join(", ")
                                                ||
                                                "None"
                                        }

                                    </p>


                                    <p>

                                        <strong>
                                            Location:
                                        </strong>

                                        <br />

                                        {
                                            hotspot.latitude
                                        }
                                        ,
                                        {" "}
                                        {
                                            hotspot.longitude
                                        }

                                    </p>


                                </Popup>

                            </Marker>

                        );

                    }
                )}

            </MapContainer>


            {/* ================================= */}
            {/* MAP LEGEND */}
            {/* ================================= */}

            <div
                style={{
                    marginTop: "10px",
                    padding: "10px",
                    border: "1px solid #ccc",
                    width: "fit-content"
                }}
            >

                <strong>
                    Map Legend
                </strong>

                <p>
                    🔵 Normal Complaint
                </p>

                <p>
                    🔴 Waste Hotspot
                </p>

            </div>

        </div>

    );

}


export default ComplaintMap;
