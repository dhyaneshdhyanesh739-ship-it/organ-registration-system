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
        // Log incoming registration request for debugging
        console.log('Incoming Register Request:', req.body);
    // Basic validation
    const { email, password, role, firstName, lastName, phone } = req.body;
    if (!email || !password || !role || !firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        field: 'missing_fields',
        message: 'All fields are required',
      });
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        field: 'email',
        message: 'Invalid email format',
      });
    }
    // Phone validation (digits only)
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!/^[0-9]+$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        field: 'phone',
        message: 'Phone number must contain only digits',
      });
    }
    // Role validation
    const allowedRoles = ['donor', 'receiver', 'hospital', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        field: 'role',
        message: 'Invalid role selected',
      });
    }
    // Password validation (minimum 8 chars, uppercase, lowercase, number, special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        field: 'password',
        message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPhone = phone.trim();
        const normalizedFirstName = firstName.trim().toUpperCase();

        // Check if this is an attempt to register as admin with wrong details
        const ADMIN_EMAIL = 'dhyaneshdhyanesh739@gmail.com'.toLowerCase();
        const ADMIN_PHONE = '7550317811';
        const ADMIN_FIRST_NAME = 'DHYANESH';

        // Check if this is an attempt to register as admin with wrong details
        if (role === 'admin' && (normalizedEmail !== ADMIN_EMAIL || trimmedPhone !== ADMIN_PHONE || normalizedFirstName !== ADMIN_FIRST_NAME)) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized admin credentials',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            // Special case for the designated admin
            if (normalizedEmail === ADMIN_EMAIL) {
                // Allow overwriting/promotng the existing user to Admin
                existingUser.role = 'admin';
                existingUser.firstName = ADMIN_FIRST_NAME;
                existingUser.lastName = lastName.trim();
                existingUser.phone = ADMIN_PHONE;
                existingUser.password = password; // Update to the new password provided
                existingUser.isVerified = true;
                await existingUser.save();

                // Proceed to generate tokens
                const user = existingUser;

                // Create audit log for promotion
                await AuditLog.create({
                    user: user._id,
                    action: 'user_promoted_to_admin',
                    entityType: 'User',
                    entityId: user._id,
                    details: { email: normalizedEmail, previousRole: existingUser.role },
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                });

                // Generate tokens and return response
                const accessToken = generateAccessToken(user._id, user.role);
                const refreshToken = generateRefreshToken(user._id);
                user.refreshToken = refreshToken;
                await user.save();

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

                return res.status(200).json({
                    success: true,
                    message: 'Admin account updated successfully',
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
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered',
                });
            }
        }

        // Create new user
        const user = await User.create({
            email: normalizedEmail,
            password,
            role,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: trimmedPhone,
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

        // Basic validation
        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email and phone are required',
            });
        }
        const trimmedPhone = phone.replace(/\D/g, '').trim();
        if (!/^[0-9]+$/.test(trimmedPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must contain only digits',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Generate 6-digit OTP
        const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database (upsert based on email)
        await OTP.findOneAndUpdate(
            { email },
            { phone: trimmedPhone, emailOTP: phoneOTP, phoneOTP, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send Phone OTP (handle possible errors)
        let smsResult;
        try {
            smsResult = await sendOTPSMS(trimmedPhone, phoneOTP);
        } catch (smsErr) {
            console.error('⚠️ SMS send error:', smsErr.message);
            return res.status(500).json({
                success: false,
                message: `Failed to send OTP via SMS: ${smsErr.message}`,
            });
        }

        // If SMS service returned a failure (including demo mode with success false)
        if (!smsResult.success) {
            const errMsg = smsResult.error || smsResult.message || 'Failed to send OTP via SMS';
            return res.status(500).json({
                success: false,
                message: errMsg,
            });
        }

        // Send Email OTP (priority, but failures are non‑blocking)
        try {
            await sendOTPEmail(email, phoneOTP);
            console.log(`📧 OTP sent to Gmail: ${email}`);
        } catch (emailErr) {
            console.error('❌ Failed to send OTP email:', emailErr.message);
            // Continue – user can still verify via SMS or demo mode
        }

        // Development console log
        console.log('------------------------------------');
        console.log(`🔑 REGISTRATION OTP for ${trimmedPhone}:`);
        console.log(`📱 Phone OTP: ${phoneOTP}`);
        console.log('------------------------------------');

        // Respond – include demo flag if provided by SMS service
        res.status(200).json({
            success: true,
            message: 'Verification code has been sent',
            ...(smsResult.demoMode ? { demoMode: true } : {}),
            ...(process.env.NODE_ENV === 'development' && { _dev_otp: phoneOTP }),
        });
    } catch (error) {
        console.error('❗ sendOTP handler error:', error);
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
        const { email, phoneOTP } = req.body;

        if (!email || !phoneOTP) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
        }

        const otpRecord = await OTP.findOne({ email: email.toLowerCase() });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not requested. Please request a new one.',
            });
        }

        // Check if OTP is older than 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (otpRecord.createdAt < tenMinutesAgo) {
            await OTP.deleteOne({ email: email.toLowerCase() });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired',
            });
        }

        if (otpRecord.phoneOTP !== phoneOTP) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Phone number verified successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email',
            });
        }

        if (!user.phone) {
            return res.status(400).json({
                success: false,
                message: 'Profile is incomplete (missing phone). Please contact support.',
            });
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. Store OTP
        try {
            await OTP.findOneAndUpdate(
                { email: normalizedEmail },
                { 
                  email: normalizedEmail,
                  phone: user.phone,
                  emailOTP: otpCode, 
                  phoneOTP: '000000', 
                  createdAt: Date.now() 
                },
                { upsert: true, new: true, runValidators: true }
            );
        } catch (otpError) {
            if (otpError.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Verification system error (OTP Validation)',
                });
            }
            throw otpError;
        }

        // 2. Send Email
        try {
            const emailResult = await sendOTPEmail(normalizedEmail, otpCode);
            
            if (emailResult && emailResult.messageId === 'demo-mode') {
                console.warn('⚠️ [FORGOT_PASS] Email service in DEMO MODE.');
            }
        } catch (emailError) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please check server email configuration.',
                error: emailError.message
            });
        }

        // 3. Log action
        try {
            await AuditLog.create({
                user: user._id,
                action: 'password_reset_request',
                entityType: 'User',
                entityId: user._id,
                status: 'success',
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
            });
        } catch (auditError) {
            // Don't fail the whole request if just audit log fails
            console.error('Audit Log Error:', auditError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Verification code sent to your email',
            // Return OTP in development so user can proceed if email is delayed
            ...(process.env.NODE_ENV === 'development' && { _dev_otp: otpCode })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const otpRecord = await OTP.findOne({ email: normalizedEmail });

        if (!otpRecord || otpRecord.emailOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code',
            });
        }

        // Check if OTP is older than 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (otpRecord.createdAt < tenMinutesAgo) {
            await OTP.deleteOne({ email });
            return res.status(400).json({
                success: false,
                message: 'Verification code expired',
            });
        }

        // Update user password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User no longer exists',
            });
        }

        user.password = newPassword;
        await user.save();

        // Delete OTP record
        await OTP.deleteOne({ email });

        // Log action
        await AuditLog.create({
            user: user._id,
            action: 'password_reset_success',
            entityType: 'User',
            entityId: user._id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/validate-email
 * @desc    Validate if an email is real using deep-email-validator
 * @access  Public
 */
const validateEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }
        
        // Dynamic import because deep-email-validator is an ES module 
        // or CJS depending on version, require() is safer in older setups but
        // let's try requiring it here
        const emailValidator = require('deep-email-validator');
        const validate = emailValidator.validate || emailValidator.default;
        
        // Disable SMTP check because many servers (like Gmail) block or timeout unauthorized SMTP probing
        const result = await validate({
            email: email,
            validateRegex: true,
            validateMx: true,
            validateTypo: true,
            validateDisposable: true,
            validateSMTP: false,
        });
        
        res.status(200).json({
            success: true,
            valid: result.valid,
            reason: result.reason,
            validators: result.validators,
        });
    } catch (error) {
        console.error('Email validation error:', error);
        // Fallback to true if validation service fails, so we don't block users if the API or DNS check fails
        res.status(200).json({
            success: true,
            valid: true,
            reason: 'fallback_error',
        });
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
    forgotPassword,
    resetPassword,
    validateEmail,
};
