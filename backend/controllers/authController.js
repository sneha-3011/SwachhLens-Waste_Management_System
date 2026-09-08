const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password, mobile_no} = req.body;
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            mobile_no: mobile_no || null,
            role:"citizen"
        });

        if(!process.env.JWT_SECRET){
            console.error("JWT_SECRET is missing from .env");
            return res.status(500).json({
                message: "Server authentication configuration error"
            });
        }

        const token= jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        );

        res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: error.message
        });
    }
};


const login = async (req, res) => {
    console.log("Login func called");
    try {
        const { email, password } = req.body;

        

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if(!process.env.JWT_SECRET){
            console.error(
                "JWT_SECRET is missing from .env"
            );

            return res.status(500).json({
                message: "Server authentication configuration error"
            });
        }
        console.log("LOGIN JWT SECRET:", process.env.JWT_SECRET);

        const token=jwt.sign({
            id:user.id,
            email: user.email,
            role:user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
};


const getProfile = async (req, res) => {

    try {
        console.log(
            "PROFILE REQUEST USER:",
            req.user
        );

        if(!req.user || !req.user.id){
            return res.status(401).json({
                message: "User information not found in token"
            });
        }

        const user = await User.findByPk(
            req.user.id,
            {
                attributes: [
                    "id",
                    "name",
                    "email",
                    "mobile_no",
                    "role",
                    "profileImage",
                    "createdAt"
                ]
            }
        );

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        res.status(200).json(user);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to load profile"
        });

    }

};
const updateProfileImage = async (req, res) => {

    try {

        // Check whether image was uploaded
        if (!req.file) {

            return res.status(400).json({
                message: "Please select an image"
            });

        }

        const user = await User.findByPk(req.user.id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        // Save image filename
        user.profileImage = req.file.filename;

        await user.save();

        res.status(200).json({

            message: "Profile image updated successfully",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                createdAt: user.createdAt
            }

        });

    } catch (error) {

        console.error(
            "Profile Image Error:",
            error
        );

        res.status(500).json({
            message: "Failed to update profile image"
        });

    }

};

module.exports = { register, login, getProfile, updateProfileImage };