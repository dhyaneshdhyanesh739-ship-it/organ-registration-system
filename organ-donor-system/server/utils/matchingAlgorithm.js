/**
 * Blood group compatibility matrix
 * Key: Recipient blood group
 * Value: Array of compatible donor blood groups
 */
const BLOOD_COMPATIBILITY = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'], // Universal donor
};

/**
 * Calculate HLA Match Score (0-40 points)
 * Based on A, B, C, DR, DQ, and DP alleles.
 */
const calculateHLAScore = (donorHLA, recipientHLA) => {
    if (!donorHLA || !recipientHLA) return 20; // Neutral score if data missing

    let matches = 0;
    const markers = ['hlaA', 'hlaB', 'hlaC', 'hlaDR', 'hlaDQ', 'hlaDP'];

    markers.forEach(marker => {
        if (donorHLA[marker] && recipientHLA[marker] && donorHLA[marker] === recipientHLA[marker]) {
            matches++;
        }
    });

    // Max 6 points. Score = (matches / 6) * 40
    return Math.round((matches / markers.length) * 40);
};

/**
 * Calculate Age Compatibility Score (0-10 points)
 * Avoids large age gaps, especially for pediatric/elderly transitions.
 */
const calculateAgeScore = (donorAge, recipientAge) => {
    if (!donorAge || !recipientAge) return 7;

    const ageGap = Math.abs(donorAge - recipientAge);

    // Ideal gap is < 15 years
    if (ageGap <= 15) return 10;
    if (ageGap <= 30) return 7;
    if (ageGap <= 50) return 4;
    return 1;
};

/**
 * Calculate Size Compatibility Score (0-10 points)
 * Crucial for heart and lungs.
 */
const calculateSizeScore = (organType, donorBio, recipientBio) => {
    if (!donorBio || !recipientBio) return 5;

    // For heart/lungs, we want height/weight to be within roughly 20%
    const heightRatio = donorBio.height / recipientBio.height;
    const weightRatio = donorBio.weight / recipientBio.weight;

    if (organType === 'Heart' || organType === 'Lungs') {
        if (heightRatio > 0.8 && heightRatio < 1.2 && weightRatio > 0.8 && weightRatio < 1.2) {
            return 10;
        }
        return 2; // Severe penalty for size mismatch in thoracic organs
    }

    // For other organs, size is less critical but still beneficial
    return 7;
};

/**
 * Calculate match score between donor and request
 */
const calculateMatchScore = (donor, request, distance) => {
    let breakdown = {
        blood: 0,
        hla: 0,
        distance: 0,
        age: 0,
        size: 0,
        urgencyMultiplier: 1.0,
    };

    // 1. Blood compatibility (30 points)
    const compatibleBloodGroups = BLOOD_COMPATIBILITY[request.bloodGroup] || [];
    if (compatibleBloodGroups.includes(donor.bloodGroup)) {
        breakdown.blood += 20;
        if (donor.bloodGroup === request.bloodGroup) {
            breakdown.blood += 10;
        }
    } else {
        return null; // Incompatible blood group
    }

    // 2. HLA Matching (40 points)
    breakdown.hla = calculateHLAScore(donor.hlaMarkers, request.hlaMarkers);

    // 3. Distance/Transport score (10 points)
    const maxDistance = 1000;
    breakdown.distance = Math.max(0, 10 * (1 - distance / maxDistance));

    // 4. Age Compatibility (10 points)
    breakdown.age = calculateAgeScore(donor.age, request.patientDetails?.age);

    // 5. Size Compatibility (10 points)
    breakdown.size = calculateSizeScore(request.organType, donor.biometrics, request.patientDetails);

    // 6. Urgency factor
    const urgencyMultipliers = {
        critical: 1.3,
        high: 1.2,
        medium: 1.1,
        low: 1.0,
    };
    breakdown.urgencyMultiplier = urgencyMultipliers[request.urgency] || 1.0;

    let subtotal = breakdown.blood + breakdown.hla + breakdown.distance + breakdown.age + breakdown.size;
    let finalScore = Math.min(Math.round(subtotal * breakdown.urgencyMultiplier), 100);

    return {
        score: finalScore,
        breakdown,
    };
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in km
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

const toRad = (degrees) => {
    return (degrees * Math.PI) / 180;
};

/**
 * Find matching donors for an organ request
 */
const findMatchingDonors = async (Donor, request, hospitalLocation) => {
    const compatibleBloodGroups = BLOOD_COMPATIBILITY[request.bloodGroup] || [];

    if (compatibleBloodGroups.length === 0) {
        return [];
    }

    // Find donors with compatible blood group and requested organ
    const donors = await Donor.find({
        bloodGroup: { $in: compatibleBloodGroups },
        organsForDonation: request.organType,
        donationStatus: 'active',
        consentGiven: true,
    })
        .populate('user', 'firstName lastName email phone isVerified')
        .lean();

    // Filter only verified donors
    const verifiedDonors = donors.filter((donor) => donor.user?.isVerified);

    // Calculate match scores and distances
    const matches = verifiedDonors
        .map((donor) => {
            if (!donor.location?.coordinates || !hospitalLocation?.coordinates) {
                return null;
            }

            const distance = calculateDistance(
                donor.location.coordinates,
                hospitalLocation.coordinates
            );

            const maxDistance = request.preferredLocation?.maxDistance || 500;
            if (distance > maxDistance) {
                return null;
            }

            const matchResult = calculateMatchScore(donor, request, distance);

            if (!matchResult) {
                return null;
            }

            return {
                donor: donor._id,
                donorDetails: donor,
                matchScore: matchResult.score,
                breakdown: matchResult.breakdown,
                distance: Math.round(distance),
            };
        })
        .filter((match) => match !== null);

    // Sort by match score (descending)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches;
};

module.exports = {
    BLOOD_COMPATIBILITY,
    calculateMatchScore,
    calculateDistance,
    findMatchingDonors,
};

