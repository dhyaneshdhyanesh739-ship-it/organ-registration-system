const mongoose = require('mongoose');
const User = require('./models/User'); // Required for populate
const ReceiverRequest = require('./models/ReceiverRequest');
const OrganRequest = require('./models/OrganRequest');
const Donor = require('./models/Donor');

async function debugHistory() {
    try {
        await mongoose.connect('mongodb://localhost:27017/organ-donor-system');
        
        const donor = await Donor.findOne().populate('user', 'firstName lastName');
        console.log('--- Sample Donor ---');
        if (donor) {
            console.log(`Donor ID: ${donor._id}, User: ${donor.user?.firstName} ${donor.user?.lastName}`);
        } else {
            console.log('No Donors found!');
        }

        console.log('\n--- ReceiverRequests ---');
        const receiverReqs = await ReceiverRequest.find().lean();
        receiverReqs.forEach(req => {
            console.log(`ID: ${req._id}, Status: ${req.status}, matchedDonor: ${req.matchedDonor || 'NULL'}`);
        });

        console.log('\n--- OrganRequests ---');
        const organReqs = await OrganRequest.find().lean();
        organReqs.forEach(req => {
            console.log(`ID: ${req._id}, Status: ${req.status}, selectedDonor: ${req.selectedDonor || 'NULL'}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugHistory();
