import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { organRequestSchema } from '../lib/validations';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { hospitalService } from '../services';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { FileText, User, Activity } from 'lucide-react';

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

const HospitalRequestForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(organRequestSchema),
    defaultValues: {
      urgency: 'medium',
      patientDetails: {
        gender: 'male',
      },
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await hospitalService.createRequest(data);
      toast.success('Organ request created successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Organ Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Organ Details
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Organ Type"
            error={errors.organType?.message}
            {...register('organType')}
            options={[
              { value: '', label: 'Select Organ' },
              ...ORGANS.map((organ) => ({ value: organ, label: organ })),
            ]}
          />

          <Select
            label="Blood Group"
            error={errors.bloodGroup?.message}
            {...register('bloodGroup')}
            options={[
              { value: '', label: 'Select Blood Group' },
              ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
            ]}
          />
        </div>

        <Select
          label="Urgency Level"
          error={errors.urgency?.message}
          {...register('urgency')}
          options={[
            { value: 'low', label: '🟢 Low - Routine' },
            { value: 'medium', label: '🟡 Medium - Important' },
            { value: 'high', label: '🟠 High - Urgent' },
            { value: 'critical', label: '🔴 Critical - Emergency' },
          ]}
        />
      </div>

      {/* Patient Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          Patient Details
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Patient Age"
            type="number"
            min="1"
            max="120"
            error={errors.patientDetails?.age?.message}
            {...register('patientDetails.age', { valueAsNumber: true })}
            icon={User}
          />

          <Select
            label="Gender"
            error={errors.patientDetails?.gender?.message}
            {...register('patientDetails.gender')}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Patient Height (cm)"
            type="number"
            error={errors.patientDetails?.height?.message}
            {...register('patientDetails.height', { valueAsNumber: true })}
            placeholder="e.g. 170"
          />
          <Input
            label="Patient Weight (kg)"
            type="number"
            error={errors.patientDetails?.weight?.message}
            {...register('patientDetails.weight', { valueAsNumber: true })}
            placeholder="e.g. 70"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">HLA Markers (Optional)</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="HLA-A"
              error={errors.hlaMarkers?.hlaA?.message}
              {...register('hlaMarkers.hlaA')}
              placeholder="e.g. A2"
            />
            <Input
              label="HLA-B"
              error={errors.hlaMarkers?.hlaB?.message}
              {...register('hlaMarkers.hlaB')}
              placeholder="e.g. B8"
            />
            <Input
              label="HLA-DR"
              error={errors.hlaMarkers?.hlaDR?.message}
              {...register('hlaMarkers.hlaDR')}
              placeholder="e.g. DR1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Medical Condition <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('patientDetails.medicalCondition')}
            rows={4}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border rounded-lg transition-all duration-200 outline-none ${
              errors.patientDetails?.medicalCondition
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/50'
                : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
            }`}
            placeholder="Describe the patient's medical condition..."
          />
          {errors.patientDetails?.medicalCondition && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <span>⚠️</span> {errors.patientDetails.medicalCondition.message}
            </p>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Additional Notes (Optional)
        </label>
        <textarea
          {...register('additionalNotes')}
          rows={3}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          placeholder="Any additional information..."
        />
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
          leftIcon={<Activity className="w-4 h-4" />}
        >
          Create Request
        </Button>
      </div>
    </motion.form>
  );
};

export default HospitalRequestForm;
