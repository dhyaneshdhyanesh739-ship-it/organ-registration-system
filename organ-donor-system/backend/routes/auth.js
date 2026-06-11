const express = require('express');
const { body } = require('express-validator');
const {
    register,
    login,
    refreshAccessToken,
    logout,
    getCurrentUser,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { googleLogin, facebookLogin } = require('../controllers/socialAuthController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('role')
        .isIn(['donor', 'receiver', 'hospital', 'admin'])
        .withMessage('Invalid role'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('phone')
        .trim()
        .matches(/^[0-9]{10}$/)
        .withMessage('Valid 10-digit phone number is required'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// OTP Routes
router.post('/send-otp', registerLimiter, sendOTP);
router.post('/verify-otp', registerLimiter, verifyOTP);

// Password Reset Routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Social Login Routes
router.post('/google-login', authLimiter, googleLogin);
router.post('/facebook-login', authLimiter, facebookLogin);

// Email Validation Route
const { validateEmail } = require('../controllers/authController');
router.post('/validate-email', validateEmail);

module.exports = router;
