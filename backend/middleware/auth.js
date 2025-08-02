import jwt from "jsonwebtoken"
import User from "../models/user.js"
import dotenv from "dotenv";
dotenv.config()

export async function authenticate(req, resizeBy, next) {
    try {
        const tokenString = req.header("Authorization");

        if (!tokenString) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const token = tokenString.replace("Bearer ", "");

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Get user from database to ensure they still exist and are active
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. User not found or inactive."
            });
        }

        req.user = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        };

        next();
    } catch (error) {
        console.log("Token verification error:", error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }
};

export async function optionalAuth(req, res, next) {
    const tokenString = req.header("Authorization");

    if (tokenString != null) {
        const token = tokenString.replace("Bearer ", "");

        jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
            if (decoded != null) {
                try {
                    const user = await User.findById(decoded.id);
                    if (user && user.isActive) {
                        req.user = {
                            id: user._id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            isEmailVerified: user.isEmailVerified
                        };
                    }
                } catch (error) {
                    console.log("Optional auth error:", error.message);
                }
            } else {
                console.log("Invalid token:", err.message);
            }
            next();
        });
    } else {
        next();
    }
};

export function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            message: "Authentication required."
        })
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required."
        })
    }
    next()
}

export function requireEmailVerification(req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            message: "Authentication required."
        })
    }
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            message: "Email verification required."
        });
    }
    next()
}
