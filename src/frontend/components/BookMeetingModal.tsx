import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './UI';
import { Request } from '../types';
import { useAppContext } from '../context/AppContext';

interface BookMeetingModalProps {
    onClose: () => void;
    requests: Request[];
    userId: string;
}

export const BookMeetingModal: React.FC<BookMeetingModalProps> = ({ onClose, requests, userId }) => {
    const { clients } = useAppContext();

    // Filter requests that have an assigned expert
    const eligibleRequests = requests.filter(r => r.assignedExpertId);

    const [step, setStep] = useState(1);
    const [selectedRequestId, setSelectedRequestId] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const selectedRequest = eligibleRequests.find(r => r.id === selectedRequestId);

    // Derived expert info (mocked or from request if relation exists in frontend type)
    // The frontend type 'Request' usually has 'assignedExpertId'. 
    // We might not have the full expert name in the Request object depending on API.
    // However, given the prompt constraints, we'll display what we can.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/meetings', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: selectedRequestId,
                    expertId: selectedRequest?.assignedExpertId,
                    date,
                    startTime,
                    endTime,
                    notes
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to book meeting');
            }

            // Success
            setStep(2); // Show success step or close
            setTimeout(() => {
                onClose();
                // Optionally navigate to meetings tab
                window.location.href = '/#/client/meetings';
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    if (step === 2) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Meeting Requested!</h2>
                    <p className="text-gray-500 mb-6">Your meeting request has been sent to the expert. Check the "Meetings" tab for updates.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="text-indigo-600" /> Book a Meeting
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Request & Expert</label>
                        <select
                            value={selectedRequestId}
                            onChange={(e) => setSelectedRequestId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            required
                        >
                            <option value="">-- Choose a Request --</option>
                            {eligibleRequests.map(req => (
                                <option key={req.id} value={req.id}>
                                    #{req.displayId || req.id.substring(0, 8)} - {req.serviceName || 'Service'} (Expert Assigned)
                                </option>
                            ))}
                        </select>
                        {eligibleRequests.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">You need a request with an assigned expert to book a meeting.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes for the Expert</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="What would you like to discuss?"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || !selectedRequestId} isLoading={isSubmitting}>
                            Confirm Booking
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
