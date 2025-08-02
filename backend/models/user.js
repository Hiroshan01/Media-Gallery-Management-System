import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true
    },
    avatar: {
        type: String,
        required: false,
        default: "https://img.freepik.com/premium-vector/man-avatar-profile-picture-isolated-background-avatar-profile-picture-man_1293239-4841.jpg?semt=ais_hybrid&w=740"
    },
    otpCode: {
        type: String,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpCode = otp;
    this.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function (otp) {
    if (!this.otpCode || !this.otpExpiresAt) return false;
    if (this.otpExpiresAt < new Date()) return false;
    return this.otpCode === otp;
};

// Clear OTP
userSchema.methods.clearOTP = function () {
    this.otpCode = null;
    this.otpExpiresAt = null;
};

// JSON response (exclude sensitive data)
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.otpCode;
    delete user.otpExpiresAt;
    delete user.passwordResetToken;
    delete user.passwordResetExpiresAt;
    return user;
};
const User = mongoose.model('User', userSchema);
export default User
