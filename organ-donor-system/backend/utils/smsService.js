const axios = require('axios');

/**
 * SMS Service
 * Handles sending real SMS via Fast2SMS gateway.
 */
const sendSMS = async (phone, message) => {
    try {
        const apiKey = process.env.FAST2SMS_API_KEY ? process.env.FAST2SMS_API_KEY.trim() : null;

        if (!apiKey || apiKey === 'your_fast2sms_api_key_here' || apiKey === '') {
            const errorMsg = 'FAST2SMS_API_KEY is not configured in .env file';
            return { 
                success: false, 
                error: errorMsg,
                needsConfig: true 
            };
        }

        // Fast2SMS Quick SMS API - expects 10 digit Indian numbers
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        
        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
            route: 'q',
            message: message,
            language: 'english',
            flash: 0,
            numbers: cleanPhone,
        }, {
            headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.return === true) {
            console.log(`✅ Real SMS sent to ${phone}`);
            return { success: true };
        } else {
            throw new Error(response.data.message || 'Fast2SMS API returned failure');
        }
    } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || errorData?.status_code || error.message;
        
        console.error('❌ Fast2SMS API Error:', errorMessage);

        // Specific handling for the "100 INR" credit requirement
        if (errorMessage.includes('100 INR') || errorMessage.includes('transaction')) {
            console.warn('\n**************************************************');
            console.warn('⚠️  SMS SERVICE BLOCKED BY FAST2SMS');
            console.warn('👉  Reason: You need to add ₹100 credit to your account.');
            console.warn(`📝  OTP Message: ${message}`);
            console.warn('FALLBACK: Check server console for OTP while you add credit.');
            console.warn('**************************************************\n');

            return { 
                success: true, // Returning true as a bypass so frontend proceeds
                demoMode: true,
                message: 'Account restricted. OTP sent to server console (Fallback active).' 
            };
        }
        
        return { 
            success: false, 
            error: `SMS Service Error: ${errorMessage}` 
        };
    }
};

const sendOTPSMS = async (phone, otp) => {
    const message = `Your verification code for Organ Donor System is: ${otp}. Valid for 10 minutes.`;
    return await sendSMS(phone, message);
};

module.exports = {
    sendSMS,
    sendOTPSMS
};
