import React from 'react';
import { ClientGamification } from '../types';
import { Star, Zap, TrendingUp, Shield } from 'lucide-react';

interface GamificationBarProps {
    gamification: ClientGamification;
    className?: string;
}

const LEVEL_COLORS = {
    'Bronze': 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-200 shadow-sm',
    'Silver': 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-200 shadow-sm',
    'Gold': 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-200 shadow-sm',
    'Platinum': 'bg-gradient-to-r from-indigo-100 to-violet-200 text-indigo-800 border-indigo-200 shadow-indigo-500/20 shadow-md',
};

export const GamificationBar: React.FC<GamificationBarProps> = ({ gamification, className = '' }) => {
    const { level, totalPoints, totalStars, currentStreak } = gamification;

    // Determine next level threshold (simplified logic)
    let nextThreshold = 100;
    if (level === 'Silver') nextThreshold = 300;
    if (level === 'Gold') nextThreshold = 700;
    if (level === 'Platinum') nextThreshold = 1500;

    const progress = Math.min((totalPoints / nextThreshold) * 100, 100);

    return (
        <div className={`flex items-center gap-4 ${className} animate-in slide-in-from-top-2 duration-700`}>
            {/* Level Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${LEVEL_COLORS[level]} hover:scale-105 transition-transform cursor-help`} title={`Current Level: ${level}`}>
                <Shield size={14} className="fill-current" />
                <span className="text-xs font-black uppercase tracking-wider">{level}</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-orange-600 border border-orange-100 font-bold text-xs shadow-sm hover:scale-105 transition-transform cursor-help" title="Daily Compliance Streak">
                <Zap size={14} className="fill-orange-500 text-orange-600" />
                <span>{currentStreak} Days</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-yellow-600 border border-yellow-100 font-bold text-xs shadow-sm hover:scale-105 transition-transform cursor-help" title="Total Stars Earned">
                <Star size={14} className="fill-yellow-400 text-yellow-500" />
                <span>{totalStars}</span>
            </div>

            {/* Progress Bar (Enhanced) */}
            <div className="hidden sm:flex flex-col w-32 gap-1 group">
                <div className="flex justify-between text-[10px] text-white/90 font-bold px-0.5" >
                    <span className="drop-shadow-sm">{totalPoints} pts</span>
                    <span className="opacity-70">{nextThreshold}</span>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] w-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
