const mongoose = require('./backend/node_modules/mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// Models
const ReceiverRequest = require('./backend/models/ReceiverRequest');
const OrganRequest = require('./backend/models/OrganRequest');
const User = require('./backend/models/User');

async function checkData() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/organ-donor-system';
        console.log('Connecting to database...');
        
        mongoose.connection.on('error', err => {
            console.error('Mongoose connection error handler:', err);
        });

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // 5 seconds timeout for server selection
        });
        console.log('✅ Connected successfully to database!');
        
        const totalReceiverRequests = await ReceiverRequest.countDocuments();
        const pendingReceiverRequests = await ReceiverRequest.countDocuments({ status: 'pending' });
        
        const totalOrganRequests = await OrganRequest.countDocuments();
        const pendingOrganRequests = await OrganRequest.countDocuments({ status: 'pending' });

        console.log(JSON.stringify({
            receiverRequests: { total: totalReceiverRequests, pending: pendingReceiverRequests },
            organRequests: { total: totalOrganRequests, pending: pendingOrganRequests }
        }, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
