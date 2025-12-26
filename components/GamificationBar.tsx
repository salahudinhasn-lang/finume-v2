import React from 'react';
import { ClientGamification } from '../types';
import { Star, Zap, TrendingUp, Shield } from 'lucide-react';

interface GamificationBarProps {
    gamification: ClientGamification;
    className?: string;
}

const LEVEL_COLORS = {
    'Bronze': 'bg-orange-100 text-orange-700 border-orange-200 ring-orange-100',
    'Silver': 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-100',
    'Gold': 'bg-yellow-100 text-yellow-700 border-yellow-200 ring-yellow-100',
    'Platinum': 'bg-indigo-100 text-indigo-700 border-indigo-200 ring-indigo-100',
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
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Level Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ring-4 ring-offset-0 ${LEVEL_COLORS[level]}`}>
                <Shield size={12} className="fill-current" />
                <span className="text-xs font-extrabold uppercase tracking-wide">{level}</span>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 font-bold text-xs" title="Daily Streak">
                <Zap size={12} className="fill-orange-400" />
                <span>{currentStreak} Days</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-100 font-bold text-xs" title="Total Stars">
                <Star size={12} className="fill-yellow-400" />
                <span>{totalStars}</span>
            </div>

            {/* Progress Bar (Compact) */}
            <div className="hidden sm:flex flex-col w-24 gap-0.5">
                <div className="flex justify-between text-[10px] text-gray-400 font-medium px-0.5" >
                    <span>{totalPoints} pts</span>
                    <span>{nextThreshold}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};
