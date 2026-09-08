const jwt = require("jsonwebtoken");

function protect(req, res, next) {
    try {
        console.log("AUTH HEADER:", req.headers.authorization);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized"
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("TOKEN:", token);

        if(!process.env.JWT_SECRET){
            console.error(
                "JWT_SECRET is missing"
            );
            return res.status(500).json({
                message: "Server authentication configuration error"
            });
        }
        console.log("VERIFY SECRET:", process.env.JWT_SECRET);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED:", decoded);

        req.user = decoded;

        next();

    } catch (error) {
        console.log("JWT ERROR:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}
const adminOnly = (req, res, next) => {

    if(!req.user){
        return res.status(401).json({
            message:"Not authorized"
        });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
};
module.exports = {protect,
    adminOnly};