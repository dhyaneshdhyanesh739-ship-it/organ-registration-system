import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { hospitalProfileSchema } from '../lib/validations';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { hospitalService } from '../services';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import LocationPicker from './LocationPicker';
import { Building2, User, MapPin, Activity, Upload } from 'lucide-react';

const HOSPITAL_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'private', label: 'Private' },
  { value: 'trust', label: 'Trust' },
];

const FACILITIES = [
  'ICU',
  'Organ Transplant Unit',
  'Blood Bank',
  '24/7 Emergency',
  'Laboratory',
  'Ambulance Services',
];

const SPECIALIZATIONS = [
  'Cardiology',
  'Nephrology',
  'Hepatology',
  'Ophthalmology',
  'Pulmonology',
  'Gastroenterology',
];

const HospitalProfileForm = ({ initialData, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [registrationCertificate, setRegistrationCertificate] = useState(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(hospitalProfileSchema),
    defaultValues: initialData || {
      hospitalType: 'private',
      address: {
        country: 'India',
      },
      facilities: [],
      specializations: [],
      facilityChecklist: {
        patientBeds: 0,
        adaAccessible: false,
        emergencyExitsMarked: false,
        fireSafetyUpToDate: false,
        backupGeneratorFunctional: false,
        wasteDisposalProtocols: false,
        staffCredentialsVerified: false,
      }
    },
  });

  useEffect(() => {
    if (!initialData && !watch('registrationNumber')) {
      const randomReg = `HOS-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      setValue('registrationNumber', randomReg, { shouldValidate: true, shouldDirty: true });
    }
  }, [initialData, setValue, watch]);

  const onSubmit = async (data) => {
    if (!registrationCertificate && !initialData) {
      toast.error('Please upload registration certificate');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'object' && key !== 'registrationCertificate') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      if (registrationCertificate) {
        formData.append('registrationCertificate', registrationCertificate);
      }

      if (initialData) {
        await hospitalService.updateProfile(formData);
        toast.success('Profile updated successfully!');
      } else {
        await hospitalService.createProfile(formData);
        toast.success('Profile created successfully!');
      }
      
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const selectedFacilities = watch('facilities') || [];
  const selectedSpecializations = watch('specializations') || [];

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"
    >
      {/* Contact Person */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          Contact Person
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Name"
            error={errors.contactPerson?.name?.message}
            {...register('contactPerson.name')}
            icon={User}
          />
          <Input
            label="Designation"
            error={errors.contactPerson?.designation?.message}
            {...register('contactPerson.designation')}
          />
          <Input
            label="Phone Number"
            error={errors.contactPerson?.phone?.message}
            {...register('contactPerson.phone')}
          />
          <Input
            label="Email Address"
            error={errors.contactPerson?.email?.message}
            {...register('contactPerson.email')}
          />
        </div>
      </div>


      {/* General Information (Moved) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          General Information
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Hospital Name"
            error={errors.hospitalName?.message}
            {...register('hospitalName')}
            icon={Building2}
            enableVoice={true}
          />
          <Select
            label="Hospital Type"
            error={errors.hospitalType?.message}
            {...register('hospitalType')}
            options={HOSPITAL_TYPES}
          />
          <Input
            label="Registration Number"
            error={errors.registrationNumber?.message}
            {...register('registrationNumber')}
            icon={Activity}
            placeholder="Auto-generated"
          />
          <Input
            label="Tax ID (TIN)"
            error={errors.taxId?.message}
            {...register('taxId')}
            placeholder="XX-XXXXXXX"
          />
          <Input
            label="NPI Number"
            error={errors.npiNumber?.message}
            {...register('npiNumber')}
            placeholder="XXXXXXXXXX"
          />
        </div>
      </div>

      {/* Location Details (Moved) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Location Details
        </h3>
        <Input
          label="Street Address"
          error={errors.address?.street?.message}
          {...register('address.street')}
          icon={MapPin}
          enableVoice={true}
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Search Village, City or District
          </label>
          <LocationPicker 
            onSelect={(loc) => {
              setValue('address.city', loc.village, { shouldValidate: true, shouldDirty: true });
              setValue('address.state', loc.state, { shouldValidate: true, shouldDirty: true });
              if (loc.pincode) setValue('address.pincode', loc.pincode, { shouldValidate: true, shouldDirty: true });
            }} 
            initialValue={{
              village: watch('address.city'),
              state: watch('address.state'),
              pincode: watch('address.pincode')
            }}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="City"
            placeholder="Auto-filled"
            error={errors.address?.city?.message}
            {...register('address.city')}
          />
          <Input
            label="State"
            placeholder="Auto-filled"
            error={errors.address?.state?.message}
            {...register('address.state')}
          />
          <Input
            label="Pincode"
            placeholder="Enter PIN"
            error={errors.address?.pincode?.message}
            {...register('address.pincode')}
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-3">Facilities</label>
          <div className="flex flex-wrap gap-2">
            {FACILITIES.map((facility) => (
              <label
                key={facility}
                className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all ${
                  selectedFacilities.includes(facility)
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  value={facility}
                  className="hidden"
                  {...register('facilities')}
                />
                {facility}
              </label>
            ))}
          </div>
          {errors.facilities && (
            <p className="text-sm text-red-500 mt-2">{errors.facilities.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Specializations</label>
          <div className="flex flex-wrap gap-2">
            {SPECIALIZATIONS.map((specialization) => (
              <label
                key={specialization}
                className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all ${
                  selectedSpecializations.includes(specialization)
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  value={specialization}
                  className="hidden"
                  {...register('specializations')}
                />
                {specialization}
              </label>
            ))}
          </div>
          {errors.specializations && (
            <p className="text-sm text-red-500 mt-2">{errors.specializations.message}</p>
          )}
        </div>
      </div>

      {/* Facility Checklist */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          Facility Checklist
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="col-span-2 md:col-span-1">
            <Input
              type="number"
              label="Number of patient beds available"
              error={errors.facilityChecklist?.patientBeds?.message}
              {...register('facilityChecklist.patientBeds', { valueAsNumber: true })}
            />
          </div>
          <div className="hidden md:block"></div>
          
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Is the main entrance ADA accessible?</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('facilityChecklist.adaAccessible')} className="w-5 h-5 text-primary-600 rounded border-gray-300" />
              <span className="text-sm">Yes</span>
            </label>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Are emergency exits clearly marked?</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('facilityChecklist.emergencyExitsMarked')} className="w-5 h-5 text-primary-600 rounded border-gray-300" />
              <span className="text-sm">Yes</span>
            </label>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fire safety inspection up to date?</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('facilityChecklist.fireSafetyUpToDate')} className="w-5 h-5 text-primary-600 rounded border-gray-300" />
              <span className="text-sm">Yes</span>
            </label>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Backup generator functional?</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('facilityChecklist.backupGeneratorFunctional')} className="w-5 h-5 text-primary-600 rounded border-gray-300" />
              <span className="text-sm">Yes</span>
            </label>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Waste disposal protocols in place?</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('facilityChecklist.wasteDisposalProtocols')} className="w-5 h-5 text-primary-600 rounded border-gray-300" />
              <span className="text-sm">Yes</span>
            </label>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Staff credentials verified?</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('facilityChecklist.staffCredentialsVerified')} className="w-5 h-5 text-primary-600 rounded border-gray-300" />
              <span className="text-sm">Yes</span>
            </label>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Registration Certificate</label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
          <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
          <input
            type="file"
            onChange={(e) => setRegistrationCertificate(e.target.files[0])}
            accept=".pdf,image/*"
            className="hidden"
            id="cert-upload"
          />
          <label
            htmlFor="cert-upload"
            className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
          >
            Click to upload registration certificate
          </label>
          <p className="text-xs text-gray-500 mt-1">
            {registrationCertificate ? registrationCertificate.name : 'PDF or Image (max 5MB)'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={loading}>
          {initialData ? 'Update Profile' : 'Complete Profile'}
        </Button>
      </div>
    </motion.form>
  );
};

export default HospitalProfileForm;
