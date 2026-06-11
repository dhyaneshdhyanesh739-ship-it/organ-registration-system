const mongoose = require('mongoose');
const User = require('./models/User');
const ReceiverRequest = require('./models/ReceiverRequest');
const OrganRequest = require('./models/OrganRequest');
const Donor = require('./models/Donor');

async function repairData() {
    try {
        await mongoose.connect('mongodb://localhost:27017/organ-donor-system');
        
        console.log('Searching for orphan requests...');
        
        const orphans = await ReceiverRequest.find({
            status: { $in: ['approved', 'completed'] },
            matchedDonor: null
        });

        console.log(`Found ${orphans.length} orphan ReceiverRequests`);

        for (const req of orphans) {
            const donor = await Donor.findOne({
                organsForDonation: req.organType,
                bloodGroup: req.bloodGroup,
                donationStatus: 'active'
            });

            if (donor) {
                req.matchedDonor = donor._id;
                await req.save();
                console.log(`Linked Request ${req._id} to Donor ${donor._id}`);
            } else {
                console.log(`No matching donor found for Request ${req._id} (${req.organType}, ${req.bloodGroup})`);
            }
        }

        const hospitalOrphans = await OrganRequest.find({
            status: { $in: ['matched', 'completed'] },
            selectedDonor: null
        });

        console.log(`Found ${hospitalOrphans.length} orphan OrganRequests`);

        for (const req of hospitalOrphans) {
            const donor = await Donor.findOne({
                organsForDonation: req.organType,
                bloodGroup: req.bloodGroup,
                donationStatus: 'active'
            });

            if (donor) {
                req.selectedDonor = donor._id;
                await req.save();
                console.log(`Linked Hospital Request ${req._id} to Donor ${donor._id}`);
            } else {
                console.log(`No matching donor found for Hospital Request ${req._id} (${req.organType}, ${req.bloodGroup})`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

repairData();
