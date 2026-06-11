const mongoose = require('mongoose');
const path = require('path');

// Models
const ReceiverRequest = require('e:/kiddo/organ-donor-system/server/models/ReceiverRequest');
const OrganRequest = require('e:/kiddo/organ-donor-system/server/models/OrganRequest');
const User = require('e:/kiddo/organ-donor-system/server/models/User');

async function checkData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/organ-donor-system');
        
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
