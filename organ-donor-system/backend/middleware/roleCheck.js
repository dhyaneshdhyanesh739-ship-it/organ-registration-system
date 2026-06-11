/**
 * Role-based access control middleware
 * Usage: roleCheck(['admin', 'hospital'])
 */
const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
            });
        }

        // Admin role verification (hardcoded email check removed for consistency)
        next();
    };
};

module.exports = roleCheck;
