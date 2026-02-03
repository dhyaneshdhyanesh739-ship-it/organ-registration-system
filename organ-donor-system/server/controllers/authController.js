const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../utils/tokenService');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');
const { sendOTPSMS } = require('../utils/smsService');
const crypto = require('crypto');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { email, password, role, firstName, lastName, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Create user
        let userRole = role;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@organdonor.com';

        // Restrict admin role registration
        if (role === 'admin') {
            if (email !== adminEmail) {
                // Return error or default to donor
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized admin registration',
                });
            }
        }

        // If email matches adminEmail, ensure role is admin
        if (email === adminEmail) {
            userRole = 'admin';
        }

        const user = await User.create({
            email,
            password,
            role: userRole,
            firstName,
            lastName,
            phone,
        });

        // Create audit log
        await AuditLog.create({
            user: user._id,
            action: 'user_register',
            entityType: 'User',
            entityId: user._id,
            details: { role, email },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: user.isVerified,
            },
            accessToken,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            // Log failed attempt
            await AuditLog.create({
                user: user._id,
                action: 'user_login',
                entityType: 'User',
                entityId: user._id,
                status: 'failure',
                errorMessage: 'Invalid password',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Log successful login
        await AuditLog.create({
            user: user._id,
            action: 'user_login',
            entityType: 'User',
            entityId: user._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                isVerified: user.isVerified,
            },
            accessToken,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
const refreshAccessToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found',
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user
        const user = await User.findById(decoded.userId).select('+refreshToken');

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id, user.role);

        // Set cookie
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
        });

        res.json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = async (req, res, next) => {
    try {
        // Clear refresh token from database
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

        // Log logout
        await AuditLog.create({
            user: req.user._id,
            action: 'user_logout',
            entityType: 'User',
            entityId: req.user._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getCurrentUser = async (req, res, next) => {
    try {
        res.json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to email and phone
 * @access  Public
 */
const sendOTP = async (req, res, next) => {
    try {
        const { email, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Generate 6-digit OTPs
        const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database (upsert based on email)
        await OTP.findOneAndUpdate(
            { email },
            { phone, emailOTP, phoneOTP, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send OTPs
        await sendOTPEmail(email, emailOTP);
        await sendOTPSMS(phone, phoneOTP);

        res.status(200).json({
            success: true,
            message: 'OTP sent to email and phone',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify email and phone OTPs
 * @access  Public
 */
const verifyOTP = async (req, res, next) => {
    try {
        const { email, emailOTP, phoneOTP } = req.body;

        const otpRecord = await OTP.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found',
            });
        }

        if (otpRecord.emailOTP !== emailOTP || otpRecord.phoneOTP !== phoneOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code(s)',
            });
        }

        // OTP is valid. We could delete it now, or let it expire. 
        // For registration flow, we'll keep it for a short time to allow register call to check it.

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    getCurrentUser,
    sendOTP,
    verifyOTP,
};
