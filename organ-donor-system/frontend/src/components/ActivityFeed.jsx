import { motion } from 'framer-motion';
import { Activity, Heart, UserPlus, Building2, Clock } from 'lucide-react';

const TYPE_CONFIG = {
    donor_create: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
    match_found: { icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    hospital_verified: { icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    organ_request_create: { icon: Heart, color: 'text-orange-500', bg: 'bg-orange-500/10' },
};

const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ActivityFeed = ({ activities, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-800/50 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-gray-700 to-transparent" />

            <div className="space-y-6">
                {activities.map((activity, index) => {
                    const config = TYPE_CONFIG[activity.type] || { icon: Activity, color: 'text-primary-500', bg: 'bg-primary-500/10' };
                    const Icon = config.icon;

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-14 group"
                        >
                            {/* Dot */}
                            <div className={`absolute left-[21px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${config.color.replace('text', 'bg')} border-4 border-gray-900 z-10`} />

                            <div className="p-4 rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-white/5 group-hover:border-primary-500/30 transition-all hover:translate-x-1">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 leading-tight">
                                            {activity.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Clock className="w-3 h-3 text-gray-500" />
                                            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                                                {formatTime(activity.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityFeed;
