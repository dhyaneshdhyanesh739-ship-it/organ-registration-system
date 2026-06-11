import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, MapPin, Activity, Info, Ruler, Weight } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useToast } from '../context/ToastContext';

const MatchList = ({ matches, organType, onSelect }) => {
  const toast = useToast();
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Matches Found</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try expanding your search radius or contact central support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
      {matches.map((match, index) => (
        <motion.div
          key={match.donor?._id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-l-4 border-l-primary-500 overflow-hidden hover:shadow-lg transition-shadow">
            <Card.Content className="p-5">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Score & Basic Info */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900/30 flex items-center justify-center bg-white dark:bg-gray-800">
                      <span className="text-lg font-black text-primary-600 dark:text-primary-400">
                        {match.matchScore}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       Donor #{match.donor?._id?.substring(match.donor._id.length - 6) || 'N/A'}
                       {match.matchScore >= 90 && (
                         <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">Excellent Match</span>
                       )}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                        🩸 {match.donor?.bloodGroup || match.bloodGroup}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium">
                        🎂 {match.donor?.age || match.age} yrs
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {match.distance} km
                      </span>
                    </div>
                  </div>
                </div>

                {/* Compatibility Breakdown */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 flex-grow">
                  {/* HLA Compatibility */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                      <span>HLA Match</span>
                      <span className="text-primary-500">{match.breakdown?.hla || 0}/40</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(match.breakdown?.hla || 0) / 40 * 100}%` }}
                        className="h-full bg-purple-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Size Match */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                      <span>Size Match</span>
                      <span className="text-primary-500">{match.breakdown?.size || 0}/10</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(match.breakdown?.size || 0) / 10 * 100}%` }}
                        className="h-full bg-orange-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Blood Match */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                      <span>Blood Compatibility</span>
                      <span className="text-primary-500">{match.breakdown?.blood || 0}/30</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(match.breakdown?.blood || 0) / 30 * 100}%` }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Transport Match */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                      <span>Transport Feasibility</span>
                      <span className="text-primary-500">{Math.round(match.breakdown?.distance || 0)}/10</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(match.breakdown?.distance || 0) / 10 * 100}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Age Match */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] uppercase text-gray-400 font-bold tracking-wider">
                      <span>Age Compatibility</span>
                      <span className="text-primary-500">{match.breakdown?.age || 0}/10</span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(match.breakdown?.age || 0) / 10 * 100}%` }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Urgency Multiplier */}
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      match.breakdown?.urgencyMultiplier > 1 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      Urgency Factor: x{match.breakdown?.urgencyMultiplier || 1.0}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex md:flex-col justify-end gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none"
                    onClick={() => onSelect?.(match)}
                  >
                    Accept Match
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-400 hover:text-primary-600"
                    onClick={() => {
                        toast.info(`Detailed profile for Donor #${match.donor?._id?.substring(match.donor._id.length - 6)} is being prepared.`);
                    }}
                  >
                    View Bio-Medical Profile
                  </Button>
                </div>
              </div>

              {/* Tooltip-like Info */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="w-3 h-3" />
                  <span>Score breakdown is based on refined medical algorithms</span>
                </div>
                <div className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  Match Verified by System
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default MatchList;
