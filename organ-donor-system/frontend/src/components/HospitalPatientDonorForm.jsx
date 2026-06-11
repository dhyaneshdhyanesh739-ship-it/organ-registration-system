import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { Heart, User, Activity } from 'lucide-react';
import { hospitalService } from '../services';

const ORGANS = [
  'Heart',
  'Liver',
  'Kidneys',
  'Lungs',
  'Pancreas',
  'Intestines',
  'Corneas',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalPatientDonorForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      organsForDonation: [],
    },
  });

  const selectedOrgans = watch('organsForDonation') || [];

  const onSubmit = async (data) => {
    if (selectedOrgans.length === 0) {
      toast.error('Please select at least one organ to donate');
      return;
    }
    
    setLoading(true);
    try {
      await hospitalService.registerPatientDonor(data);
      
      toast.success('Patient Donor registered successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register patient donor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Hospital Fast-Track Registration
        </h4>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          Use this form to quickly register a patient as an organ donor directly from your facility system.
        </p>
      </div>

      {/* Patient Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          Patient Details
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            error={errors.firstName?.message}
            {...register('firstName', { required: 'First name is required' })}
          />
          <Input
            label="Last Name"
            error={errors.lastName?.message}
            {...register('lastName', { required: 'Last name is required' })}
          />
          <Input
            label="Date of Birth"
            type="date"
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth', { required: 'Date of birth is required' })}
          />
          <Select
            label="Gender"
            error={errors.gender?.message}
            {...register('gender', { required: 'Gender is required' })}
            options={[
              { value: '', label: 'Select Gender' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Select
            label="Blood Group"
            error={errors.bloodGroup?.message}
            {...register('bloodGroup', { required: 'Blood group is required' })}
            options={[
              { value: '', label: 'Select Blood Group' },
              ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
            ]}
          />
          <Input
            label="Patient Phone / Emergency Contact"
            error={errors.phone?.message}
            {...register('phone', { required: 'Phone is required' })}
          />
        </div>
      </div>

      {/* Organ Selection */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary-600" />
          Organs for Donation
        </h3>
        <p className="text-sm text-gray-500 mb-2">Select the organs the patient has consented to donate.</p>
        
        <div className="flex flex-wrap gap-2">
          {ORGANS.map((organ) => (
            <label
              key={organ}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                selectedOrgans.includes(organ)
                  ? 'bg-primary-600 text-white shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="checkbox"
                value={organ}
                className="hidden"
                {...register('organsForDonation')}
              />
              {organ}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mt-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input 
            type="checkbox" 
            className="mt-1 w-5 h-5 text-primary-600 rounded border-gray-300"
            {...register('consentGiven', { required: 'Hospital verification of consent is required' })}
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Hospital Authorization:</strong> I verify that the patient or next of kin has provided legal consent for organ donation, and all necessary hospital protocols have been followed.
          </span>
        </label>
        {errors.consentGiven && (
          <p className="text-sm text-red-500 mt-2 pl-8">{errors.consentGiven.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          isLoading={loading}
          leftIcon={<Heart className="w-4 h-4" />}
        >
          Register Patient Donor
        </Button>
      </div>
    </motion.form>
  );
};

export default HospitalPatientDonorForm;
