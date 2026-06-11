const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const {
    generateAccessToken,
    generateRefreshToken,
} = require('../utils/tokenService');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper to set auth cookies and return response
 */
const sendAuthResponse = async (user, res, req, action) => {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    await AuditLog.create({
        user: user._id,
        action,
        entityType: 'User',
        entityId: user._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
    });

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
};

/**
 * @route   POST /api/auth/google-login
 * @desc    Google Social Login (supports both idToken and accessToken)
 */
exports.googleLogin = async (req, res, next) => {
    try {
        const { idToken, accessToken: googleAccessToken, role } = req.body;

        let email, googleId, given_name, family_name;

        if (idToken) {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            email = payload.email;
            googleId = payload.sub;
            given_name = payload.given_name;
            family_name = payload.family_name;
        } else if (googleAccessToken) {
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${googleAccessToken}` },
            });
            email = response.data.email;
            googleId = response.data.sub;
            given_name = response.data.given_name;
            family_name = response.data.family_name;
        } else {
            return res.status(400).json({ success: false, message: 'Google token is required' });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: 'Could not retrieve email from Google' });
        }

        let user = await User.findOne({ 
            $or: [{ googleId }, { email: email.toLowerCase() }] 
        });

        if (user) {
            // Update googleId if missing
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
            return sendAuthResponse(user, res, req, 'google_login');
        }

        // Register new user
        if (!role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Role is required for new registration via Google' 
            });
        }

        user = await User.create({
            email: email.toLowerCase(),
            googleId,
            firstName: given_name || 'Google',
            lastName: family_name || 'User',
            role,
            isVerified: true, // Social emails are verified
        });

        return sendAuthResponse(user, res, req, 'google_register');
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/facebook-login
 * @desc    Facebook Social Login
 */
exports.facebookLogin = async (req, res, next) => {
    try {
        const { accessToken, role } = req.body;

        if (!accessToken) {
            return res.status(400).json({ success: false, message: 'Facebook Access Token is required' });
        }

        // Verify with Facebook Graph API
        const { data } = await axios.get(
            `https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${accessToken}`
        );

        const { id: facebookId, first_name, last_name, email } = data;

        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email permissions are required for Facebook login' 
            });
        }

        let user = await User.findOne({ 
            $or: [{ facebookId }, { email: email.toLowerCase() }] 
        });

        if (user) {
            if (!user.facebookId) {
                user.facebookId = facebookId;
                await user.save();
            }
            return sendAuthResponse(user, res, req, 'facebook_login');
        }

        if (!role) {
            return res.status(400).json({ 
                success: false, 
                message: 'Role is required for new registration via Facebook' 
            });
        }

        user = await User.create({
            email: email.toLowerCase(),
            facebookId,
            firstName: first_name || 'Facebook',
            lastName: last_name || 'User',
            role,
            isVerified: true,
        });

        return sendAuthResponse(user, res, req, 'facebook_register');
    } catch (error) {
        next(error);
    }
};
