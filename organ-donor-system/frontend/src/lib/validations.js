import { z } from 'zod';

// Login Schema
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Register Schema
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    role: z.enum(['donor', 'hospital', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// Donor Profile Schema
export const donorProfileSchema = z.object({
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other']),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    address: z.object({
        street: z.string().min(5, 'Street address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
        country: z.string().default('India'),
    }),
    organsForDonation: z.array(z.string()).min(1, 'Select at least one organ'),
    medicalHistory: z.object({
        smokingStatus: z.enum(['never', 'former', 'current']),
        alcoholConsumption: z.enum(['never', 'occasional', 'regular']),
        chronicDiseases: z.array(z.string()).optional(),
        currentMedications: z.array(z.string()).optional(),
        allergies: z.array(z.string()).optional(),
        surgeries: z.array(z.string()).optional(),
    }),
    hlaMarkers: z.object({
        hlaA: z.string().optional(),
        hlaB: z.string().optional(),
        hlaDR: z.string().optional(),
    }).optional(),
    biometrics: z.object({
        height: z.number().min(0).optional(),
        weight: z.number().min(0).optional(),
    }).optional(),
    idProof: z.object({
        type: z.enum(['aadhaar', 'passport', 'driving_license', 'voter_id']),
        number: z.string().min(5, 'ID number is required'),
    }),
    emergencyContact: z.object({
        name: z.string().min(2, 'Emergency contact name is required'),
        relationship: z.string().min(2, 'Relationship is required'),
        phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    }),
});

// Hospital Profile Schema
export const hospitalProfileSchema = z.object({
    hospitalName: z.string().min(3, 'Hospital name is required'),
    hospitalType: z.enum(['government', 'private', 'trust']),
    registrationNumber: z.string().min(5, 'Registration number is required'),
    taxId: z.string().optional(),
    npiNumber: z.string().optional(),
    address: z.object({
        street: z.string().min(5, 'Street address is required'),
        city: z.string().min(2, 'City is required'),
        state: z.string().min(2, 'State is required'),
        pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
        country: z.string().default('India'),
    }),
    contactPerson: z.object({
        name: z.string().min(2, 'Contact person name is required'),
        designation: z.string().min(2, 'Designation is required'),
        phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
        email: z.string().email('Invalid email address'),
    }),
    facilities: z.array(z.string()).min(1, 'Select at least one facility'),
    specializations: z.array(z.string()).min(1, 'Select at least one specialization'),
    facilityChecklist: z.object({
        patientBeds: z.number().min(0, 'Invalid number of beds').optional(),
        adaAccessible: z.boolean().optional(),
        emergencyExitsMarked: z.boolean().optional(),
        fireSafetyUpToDate: z.boolean().optional(),
        backupGeneratorFunctional: z.boolean().optional(),
        wasteDisposalProtocols: z.boolean().optional(),
        staffCredentialsVerified: z.boolean().optional(),
    }).optional(),
});

// Organ Request Schema
export const organRequestSchema = z.object({
    organType: z.string().min(1, 'Organ type is required'),
    bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    patientDetails: z.object({
        age: z.number().min(1).max(120, 'Invalid age'),
        gender: z.enum(['male', 'female', 'other']),
        medicalCondition: z.string().min(10, 'Medical condition description is required'),
        height: z.number().min(0).optional(),
        weight: z.number().min(0).optional(),
    }),
    hlaMarkers: z.object({
        hlaA: z.string().optional(),
        hlaB: z.string().optional(),
        hlaDR: z.string().optional(),
    }).optional(),
    additionalNotes: z.string().optional(),
});

// Search Schema
export const searchSchema = z.object({
    query: z.string().optional(),
    bloodGroup: z.string().optional(),
    organType: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    urgency: z.string().optional(),
    status: z.string().optional(),
});
