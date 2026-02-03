import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { searchSchema } from '../lib/validations';
import { motion } from 'framer-motion';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import { Search, Filter, X } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ORGANS = ['Heart', 'Liver', 'Kidneys', 'Lungs', 'Pancreas', 'Intestines', 'Corneas'];
const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['pending', 'matched', 'completed', 'cancelled'];

const SearchFilter = ({ onSearch, onReset, showFilters = true }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = (data) => {
    // Remove empty fields
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '' && value !== undefined)
    );
    onSearch(filteredData);
  };

  const handleReset = () => {
    reset();
    onReset?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold">Search & Filter</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Search Query */}
        <Input
          label="Search"
          placeholder="Search by name, ID, or keywords..."
          error={errors.query?.message}
          {...register('query')}
          icon={Search}
        />

        {showFilters && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Blood Group */}
            <Select
              label="Blood Group"
              error={errors.bloodGroup?.message}
              {...register('bloodGroup')}
              options={[
                { value: '', label: 'All Blood Groups' },
                ...BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg })),
              ]}
            />

            {/* Organ Type */}
            <Select
              label="Organ Type"
              error={errors.organType?.message}
              {...register('organType')}
              options={[
                { value: '', label: 'All Organs' },
                ...ORGANS.map((organ) => ({ value: organ, label: organ })),
              ]}
            />

            {/* City */}
            <Input
              label="City"
              placeholder="Enter city"
              error={errors.city?.message}
              {...register('city')}
            />

            {/* State */}
            <Input
              label="State"
              placeholder="Enter state"
              error={errors.state?.message}
              {...register('state')}
            />

            {/* Urgency */}
            <Select
              label="Urgency"
              error={errors.urgency?.message}
              {...register('urgency')}
              options={[
                { value: '', label: 'All Urgency Levels' },
                ...URGENCY_LEVELS.map((level) => ({
                  value: level,
                  label: level.charAt(0).toUpperCase() + level.slice(1),
                })),
              ]}
            />

            {/* Status */}
            <Select
              label="Status"
              error={errors.status?.message}
              {...register('status')}
              options={[
                { value: '', label: 'All Statuses' },
                ...STATUS_OPTIONS.map((status) => ({
                  value: status,
                  label: status.charAt(0).toUpperCase() + status.slice(1),
                })),
              ]}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" leftIcon={<Search className="w-4 h-4" />} className="flex-1">
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            leftIcon={<X className="w-4 h-4" />}
          >
            Reset
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SearchFilter;
