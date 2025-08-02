import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import { validationResult } from 'express-validator';
import User from "../models/user.js";
import { sendRegistrationOTP } from "../utils/otp.js";

dotenv.config()

function generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Send token response
function sendTokenResponse(user, statusCode, res, message = 'Success') {
    const token = generateToken(user._id);

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            avatar: user.avatar,
            authProvider: user.authProvider
        }
    });
};

export async function register(req, res) {
    try {
        let bodyData = req.body;


        if (req.get('Content-Type') === 'text/plain' && typeof req.body === 'string') {
            try {
                bodyData = JSON.parse(req.body);
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON format in request body.'
                });
            }
        }

        if (!bodyData || typeof bodyData !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Please send JSON data.',
                contentType: req.get('Content-Type'),
                bodyType: typeof req.body
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password } = bodyData;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required',
                received: { name: !!name, email: !!email, password: !!password }
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            authProvider: 'local'
        });

        // Generate and save OTP
        const otp = user.generateOTP();
        await user.save();

        // Send OTP email
        try {
            await sendRegistrationOTP(user.email, user.name, otp);

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please check your email for OTP verification.',
                userId: user._id,
                email: user.email
            });
        } catch (emailError) {
            await User.findByIdAndDelete(user._id);
            throw new Error('Failed to send verification email');
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Registration failed. Please try again.',
        });
    }
};