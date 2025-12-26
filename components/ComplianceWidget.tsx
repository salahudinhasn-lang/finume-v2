import React, { useState } from 'react';
import { CheckCircle, UploadCloud, XCircle, Trophy } from 'lucide-react';
import { Button } from './UI';
import { useAppContext } from '../context/AppContext';

interface ComplianceWidgetProps {
    date: string;
    hasUploads: boolean;
    onUploadClick: () => void;
    onNothingTodayClick: () => void;
}

export const ComplianceWidget: React.FC<ComplianceWidgetProps> = ({
    date,
    hasUploads,
    onUploadClick,
    onNothingTodayClick
}) => {
    const [markedNothing, setMarkedNothing] = useState(false);

    const isCompleted = hasUploads || markedNothing;

    const handleNothingClick = () => {
        setMarkedNothing(true);
        onNothingTodayClick();
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm mb-6">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isCompleted ? <Trophy size={24} /> : <CheckCircle size={24} />}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">{date} Compliance Status</h4>
                    <p className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-orange-500'}`}>
                        {isCompleted
                            ? (hasUploads ? "Great job! Documents uploaded." : "Checked off: Nothing for today.")
                            : "Pending: Upload documents or mark 'Nothing for Today'."}
                    </p>
                </div>
            </div>

            {!isCompleted && (
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant="secondary"
                        onClick={handleNothingClick}
                        className="text-xs py-2 px-3 bg-white hover:bg-gray-50 text-gray-600 whitespace-nowrap flex-1 md:flex-none border border-gray-200 shadow-sm"
                    >
                        Nothing for Today
                    </Button>
                    <Button
                        onClick={onUploadClick}
                        className="text-xs py-2 px-4 shadow-md shadow-blue-200 whitespace-nowrap flex-1 md:flex-none"
                    >
                        <UploadCloud size={14} className="mr-2" /> Upload Files
                    </Button>
                </div>
            )}

            {isCompleted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/60 rounded-lg border border-white/50">
                    <span className="text-xs font-bold text-gray-600">Daily Streak Active! 🔥</span>
                </div>
            )}
        </div>
    );
};
