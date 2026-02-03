/**
 * SMS Service
 * This service handles sending SMS notifications.
 * For demonstration, it logs to console. 
 * Integrate with Fast2SMS or Twilio for production.
 */

const sendSMS = async (phone, message) => {
    try {
        // MOCK: In a real implementation, you would use axios to call your SMS gateway API
        // Example for Fast2SMS:
        /*
        const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
            params: {
                authorization: process.env.SMS_API_KEY,
                route: 'q',
                message: message,
                flash: 0,
                numbers: phone,
            }
        });
        */

        console.log(`📱 SMS sent to ${phone}: ${message}`);
        return { success: true };
    } catch (error) {
        console.error('❌ SMS sending failed:', error.message);
        // We don't throw error to prevent blocking the flow if SMS fails in dev
        return { success: false, error: error.message };
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
