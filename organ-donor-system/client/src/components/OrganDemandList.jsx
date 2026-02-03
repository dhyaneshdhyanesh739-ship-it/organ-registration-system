import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Users } from 'lucide-react';

const OrganDemandList = ({ demand, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-28 bg-gray-800/50 animate-pulse rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {demand.map((item, index) => (
                <motion.div
                    key={item.organ}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-5 rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-white/5 hover:border-pink-500/30 transition-all group relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-pink-500/10 blur-2xl rounded-full group-hover:bg-pink-500/20 transition-colors" />

                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                item.urgency === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-orange-500/10 text-orange-400'
                            }`}>
                                {item.urgency}
                            </span>
                            <h4 className="text-xl font-bold text-white mt-2 group-hover:text-primary-400 transition-colors">
                                {item.organ}
                            </h4>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 justify-end text-primary-400">
                                <Users className="w-4 h-4" />
                                <span className="text-2xl font-black">{item.count}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium uppercase mt-1">
                                Waitlist Count
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span>High Priority matching active</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default OrganDemandList;
