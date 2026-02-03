import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donorService } from '../services';
import { useNavigate, useLocation } from 'react-router-dom';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import OrganCard from '../components/OrganCard';
import LocationPicker from '../components/LocationPicker';
import { User, Calendar, Droplet, MapPin, Phone, FileText, Upload, Loader } from 'lucide-react';

const ORGANS = [
  'Heart',
  'Liver',
  'Kidneys',
  'Lungs',
  'Pancreas',
  'Intestines',
  'Corneas',
  'Skin',
  'Bone',
  'Heart Valves',
  'Blood Vessels',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorProfileForm = ({ isEdit = false }) => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    organsForDonation: location.state?.selectedOrgan ? [location.state.selectedOrgan] : [],
    medicalHistory: {
      chronicDiseases: [],
      currentMedications: [],
      allergies: [],
      surgeries: [],
      smokingStatus: 'never',
      alcoholConsumption: 'never',
    },
    idProof: {
      type: 'aadhaar',
      number: '',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
    hlaMarkers: {
      hlaA: '',
      hlaB: '',
      hlaDR: '',
    },
    biometrics: {
      height: '',
      weight: '',
    },
  });
  const [idDocument, setIdDocument] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchProfile();
    }
  }, [isEdit]);

  const fetchProfile = async () => {
    try {
      const { donor } = await donorService.getProfile();
      if (donor) {
        // Format date string for input type="date"
        const formattedDate = donor.dateOfBirth ? new Date(donor.dateOfBirth).toISOString().split('T')[0] : '';
        setFormData({
          ...donor,
          dateOfBirth: formattedDate,
          // Ensure nested objects exist
          address: donor.address || formData.address,
          medicalHistory: donor.medicalHistory || formData.medicalHistory,
          idProof: donor.idProof || formData.idProof,
          emergencyContact: donor.emergencyContact || formData.emergencyContact,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch profile data');
      navigate('/donor/dashboard');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleOrgan = (organ) => {
    setFormData({
      ...formData,
      organsForDonation: formData.organsForDonation.includes(organ)
        ? formData.organsForDonation.filter((o) => o !== organ)
        : [...formData.organsForDonation, organ],
    });
  };

  const handleFileChange = (e) => {
    setIdDocument(e.target.files[0]);
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        city: location.village,
        state: location.state,
        pincode: location.pincode || formData.address.pincode,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.organsForDonation.length === 0) {
      toast.error('Please select at least one organ');
      return;
    }

    if (!idDocument && !isEdit) {
      toast.error('Please upload ID proof');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('dateOfBirth', formData.dateOfBirth);
      data.append('gender', formData.gender);
      data.append('bloodGroup', formData.bloodGroup);
      data.append('address', JSON.stringify(formData.address));
      data.append('organsForDonation', JSON.stringify(formData.organsForDonation));
      data.append('medicalHistory', JSON.stringify(formData.medicalHistory));
      data.append('hlaMarkers', JSON.stringify(formData.hlaMarkers));
      data.append('biometrics', JSON.stringify(formData.biometrics));
      data.append('idProof', JSON.stringify(formData.idProof));
      data.append('emergencyContact', JSON.stringify(formData.emergencyContact));
      
      if (idDocument) {
        data.append('idDocument', idDocument);
      }

      if (isEdit) {
        await donorService.updateProfile(data);
        toast.success('Profile updated successfully!');
      } else {
        await donorService.createProfile(data);
        toast.success('Profile created successfully!');
      }
      navigate('/donor/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} profile`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex items-center ${s < 4 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s
                      ? 'bg-gradient-to-r from-primary-600 to-pink-600 text-white scale-110'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-all ${
                      step > s ? 'bg-gradient-to-r from-primary-600 to-pink-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Personal</span>
            <span>Medical</span>
            <span>Organs</span>
            <span>Documents</span>
          </div>
        </div>

        {/* Form */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <motion.div key="step1" className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text mb-6">Personal Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Date of Birth"
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      icon={Calendar}
                    />

                    <Select
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' },
                      ]}
                    />

                    <Select
                      label="Blood Group"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      required
                      options={[
                        { value: '', label: 'Select Blood Group' },
                        ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
                      ]}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Address</h3>
                    <Input
                      label="Street Address"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      required
                      icon={MapPin}
                      enableVoice={true}
                    />
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search Village, City or District
                      </label>
                      <LocationPicker 
                        onSelect={handleLocationSelect} 
                        initialValue={{
                          village: formData.address.city,
                          state: formData.address.state,
                          pincode: formData.address.pincode
                        }}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        label="City/Village"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        required
                        placeholder="Auto-filled from search"
                        enableVoice={true}
                      />
                      <Input
                        label="State"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        required
                        placeholder="Auto-filled"
                      />
                      <Input
                        label="Pincode"
                        name="address.pincode"
                        value={formData.address.pincode}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{6}"
                        placeholder="Enter 6-digit PIN"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Emergency Contact</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        label="Name"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleChange}
                        required
                        icon={User}
                      />
                      <Input
                        label="Relationship"
                        name="emergencyContact.relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={handleChange}
                        required
                      />
                      <Input
                        label="Phone"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                        icon={Phone}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={nextStep}>
                      Next Step →
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Medical History */}
              {step === 2 && (
                <motion.div key="step2" className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text mb-6">Medical History</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Select
                      label="Smoking Status"
                      name="medicalHistory.smokingStatus"
                      value={formData.medicalHistory.smokingStatus}
                      onChange={handleChange}
                      options={[
                        { value: 'never', label: 'Never' },
                        { value: 'former', label: 'Former' },
                        { value: 'current', label: 'Current' },
                      ]}
                    />

                    <Select
                      label="Alcohol Consumption"
                      name="medicalHistory.alcoholConsumption"
                      value={formData.medicalHistory.alcoholConsumption}
                      onChange={handleChange}
                      options={[
                        { value: 'never', label: 'Never' },
                        { value: 'occasional', label: 'Occasional' },
                        { value: 'regular', label: 'Regular' },
                      ]}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label="Height (cm)"
                      type="number"
                      name="biometrics.height"
                      value={formData.biometrics.height}
                      onChange={handleChange}
                      placeholder="e.g. 175"
                    />
                    <Input
                      label="Weight (kg)"
                      type="number"
                      name="biometrics.weight"
                      value={formData.biometrics.weight}
                      onChange={handleChange}
                      placeholder="e.g. 70"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">HLA Markers (Optional)</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        label="HLA-A"
                        name="hlaMarkers.hlaA"
                        value={formData.hlaMarkers.hlaA}
                        onChange={handleChange}
                        placeholder="e.g. A*02"
                      />
                      <Input
                        label="HLA-B"
                        name="hlaMarkers.hlaB"
                        value={formData.hlaMarkers.hlaB}
                        onChange={handleChange}
                        placeholder="e.g. B*07"
                      />
                      <Input
                        label="HLA-DR"
                        name="hlaMarkers.hlaDR"
                        value={formData.hlaMarkers.hlaDR}
                        onChange={handleChange}
                        placeholder="e.g. DRB1*01"
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Note: Precise medical matching significantly increases the chances of a successful transplant.
                  </p>

                  <div className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={prevStep}>
                      ← Previous
                    </Button>
                    <Button type="button" onClick={nextStep}>
                      Next Step →
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Organ Selection */}
              {step === 3 && (
                <motion.div key="step3" className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text mb-6">Select Organs for Donation</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ORGANS.map((organ) => (
                      <OrganCard
                        key={organ}
                        organ={organ}
                        isSelected={formData.organsForDonation.includes(organ)}
                        onClick={() => toggleOrgan(organ)}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected: {formData.organsForDonation.length} organ(s)
                  </p>

                  <div className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={prevStep}>
                      ← Previous
                    </Button>
                    <Button type="button" onClick={nextStep}>
                      Next Step →
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Documents */}
              {step === 4 && (
                <motion.div key="step4" className="space-y-6">
                  <h2 className="text-2xl font-bold gradient-text mb-6">Upload Documents</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <Select
                      label="ID Proof Type"
                      name="idProof.type"
                      value={formData.idProof.type}
                      onChange={handleChange}
                      options={[
                        { value: 'aadhaar', label: 'Aadhaar Card' },
                        { value: 'passport', label: 'Passport' },
                        { value: 'driving_license', label: 'Driving License' },
                        { value: 'voter_id', label: 'Voter ID' },
                      ]}
                    />

                    <Input
                      label="ID Number"
                      name="idProof.number"
                      value={formData.idProof.number}
                      onChange={handleChange}
                      required
                      icon={FileText}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Upload ID Proof</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                      <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,application/pdf"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Click to upload
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        {idDocument ? idDocument.name : 'PNG, JPG or PDF (max 5MB)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={prevStep}>
                      ← Previous
                    </Button>
                    <Button type="submit" isLoading={loading}>
                      Submit Profile
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorProfileForm;
