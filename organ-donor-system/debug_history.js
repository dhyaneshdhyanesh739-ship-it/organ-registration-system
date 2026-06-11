const mongoose = require('mongoose');
const ReceiverRequest = require('e:/kiddo/organ-donor-system/server/models/ReceiverRequest');
const OrganRequest = require('e:/kiddo/organ-donor-system/server/models/OrganRequest');
const Donor = require('e:/kiddo/organ-donor-system/server/models/Donor');
const User = require('e:/kiddo/organ-donor-system/server/models/User');

async function debugHistory() {
    try {
        await mongoose.connect('mongodb://localhost:27017/organ-donor-system');
        
        console.log('--- Donor Documents ---');
        const donors = await Donor.find().populate('user', 'firstName lastName');
        donors.forEach(d => {
            console.log(`Donor ID: ${d._id}, User: ${d.user?.firstName} ${d.user?.lastName}`);
        });

        console.log('\n--- ReceiverRequests with matching fields ---');
        const receiverReqs = await ReceiverRequest.find({ 
            matchedDonor: { $exists: true, $ne: null } 
        }).populate('matchedDonor');
        console.log(`Found ${receiverReqs.length} receiver requests with matchedDonor`);
        receiverReqs.forEach(req => {
            console.log(`ID: ${req._id}, Status: ${req.status}, matchedDonor: ${req.matchedDonor}`);
        });

        console.log('\n--- OrganRequests with matching fields ---');
        const organReqs = await OrganRequest.find({ 
            selectedDonor: { $exists: true, $ne: null } 
        }).populate('selectedDonor');
        console.log(`Found ${organReqs.length} organ requests with selectedDonor`);
        organReqs.forEach(req => {
            console.log(`ID: ${req._id}, Status: ${req.status}, selectedDonor: ${req.selectedDonor}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugHistory();
