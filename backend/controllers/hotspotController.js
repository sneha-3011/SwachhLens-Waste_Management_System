const Complaint = require("../models/Complaint");

const getHotspots = async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            attributes: [
                "id",
                "latitude",
                "longitude",
                "wasteType",
                "wasteSize",
                "priority",
                "status"
            ]
        });

        const hotspots = {};

        complaints.forEach((complaint) => {
            const lat = parseFloat(complaint.latitude);
            const lon = parseFloat(complaint.longitude);

            if (isNaN(lat) || isNaN(lon)) {
                return;
            }

            // Round coordinates to create geographic zones
            const zoneLat = lat.toFixed(3);
            const zoneLon = lon.toFixed(3);

            const zone = `${zoneLat},${zoneLon}`;

            if (!hotspots[zone]) {
                hotspots[zone] = {
                    latitude: parseFloat(zoneLat),
                    longitude: parseFloat(zoneLon),
                    complaintCount: 0,
                    complaints: [],
                    highPriorityCount: 0
                };
            }

            hotspots[zone].complaintCount++;

            hotspots[zone].complaints.push(complaint.id);

            if (
                complaint.priority === "High" ||
                complaint.priority === "Critical"
            ) {
                hotspots[zone].highPriorityCount++;
            }
        });

        const result = Object.values(hotspots)
            .sort((a, b) => b.complaintCount - a.complaintCount);

        res.json({
            totalHotspots: result.length,
            hotspots: result
        });

    } catch (error) {
        console.error("Hotspot Error:", error);

        res.status(500).json({
            message: "Failed to calculate hotspots"
        });
    }
};

module.exports = { getHotspots };