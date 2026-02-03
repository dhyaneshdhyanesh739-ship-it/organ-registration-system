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

        // Additional check for admin: must match ADMIN_EMAIL in .env
        if (req.user.role === 'admin') {
            const adminEmail = process.env.ADMIN_EMAIL || 'admin@organdonor.com';
            if (req.user.email !== adminEmail) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Unauthorized admin email.',
                });
            }
        }

        next();
    };
};

module.exports = roleCheck;
