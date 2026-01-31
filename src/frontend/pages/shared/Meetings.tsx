import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Card, Button, Badge } from '../../components/UI';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Edit2, Save, X } from 'lucide-react';
import { Meeting } from '../../types';
import MeetingChat from '../../components/MeetingChat';
const Meetings = () => {
    const { user } = useAppContext();
    const location = useLocation();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<'day' | 'week' | 'month'>('week');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [expandedMeetingId, setExpandedMeetingId] = useState<string | null>(null);

    // Reschedule State
    const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
    const [editDate, setEditDate] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchMeetings = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/meetings?role=${user.role}`);
            if (res.ok) {
                const data = await res.json();
                setMeetings(data);

                // Deep Link Logic
                const params = new URLSearchParams(location.search);
                const linkedMeetingId = params.get('meetingId');

                if (linkedMeetingId) {
                    const linkedMeeting = data.find((m: Meeting) => m.id === linkedMeetingId);
                    if (linkedMeeting) {
                        setCurrentDate(new Date(linkedMeeting.date));
                        setView('day');
                        setExpandedMeetingId(linkedMeetingId);

                        // Clear param after handling to avoid re-opening on refresh/nav (optional but good UX)
                        // window.history.replaceState({}, '', location.pathname); 
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch meetings", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();

        // Poll for live chat messages every 5 seconds
        const interval = setInterval(() => {
            // We reuse fetchMeetings but maybe avoid refetching deep link logic every time?
            // Actually fetchMeetings handles it, checking location.search. 
            // If we clear params it won't re-trigger. If we don't, it stays open.
            // For polling, we might just want to update data, not reset view...
            // Refactoring to separate initial fetch vs poll would be cleaner but for now let's just re-fetch data 
            // and relying on state preservation.

            // Simplified poll:
            if (!user) return;
            fetch(`/api/meetings?role=${user.role}`).then(res => {
                if (res.ok) res.json().then(data => setMeetings(data));
            });

        }, 5000);

        return () => clearInterval(interval);
    }, [user, location.search]); // Depend on location.search to re-run if URL changes

    const handleSendReply = async (meetingId: string, content: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/meetings/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meetingId, content })
            });

            if (res.ok) {
                const newMessage = await res.json();
                setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, messages: [...m.messages, newMessage] } : m));
                return true;
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
        return false;
    };

    const handleStartReschedule = (m: Meeting) => {
        setEditingMeetingId(m.id);
        setEditDate(new Date(m.date).toISOString().split('T')[0]);
        setEditStartTime(m.startTime);
        setEditEndTime(m.endTime);
    };

    const handleCancelReschedule = () => {
        setEditingMeetingId(null);
        setEditDate('');
        setEditStartTime('');
        setEditEndTime('');
    };

    const handleSaveReschedule = async () => {
        if (!editingMeetingId) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/meetings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingMeetingId,
                    date: editDate,
                    startTime: editStartTime,
                    endTime: editEndTime
                })
            });

            if (res.ok) {
                const updated = await res.json();
                // Refresh list or optimistic update. Refresh is safer for sorting.
                await fetchMeetings();
                handleCancelReschedule();
            } else {
                alert("Failed to reschedule. Please check values.");
            }
        } catch (error) {
            console.error("Reschedule failed", error);
        } finally {
            setIsSaving(false);
        }
    };


    // --- Helper to get Display Name based on Role ---
    const getDisplayName = (m: Meeting) => {
        if (user?.role === 'ADMIN') {
            return `${m.clientName} & ${m.expertName}`;
        }
        return user?.role === 'CLIENT' ? m.expertName : m.clientName;
    };

    const getDisplayAvatarChar = (m: Meeting) => {
        if (user?.role === 'ADMIN') return 'M';
        return (user?.role === 'CLIENT' ? m.expertName : m.clientName).charAt(0);
    }

    // --- Calendar helpers ---
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getMonthData = (year: number, month: number) => {
        const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
        const daysInMonth = getDaysInMonth(year, month);
        const data = [];
        let day = 1;
        // Fill first week empty slots
        for (let i = 0; i < firstDay; i++) {
            data.push(null);
        }
        // Fill days
        while (day <= daysInMonth) {
            data.push(new Date(year, month, day));
            day++;
        }
        return data;
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };

    const getMeetingsForDay = (date: Date) => {
        return meetings.filter(m => isSameDay(new Date(m.date), date));
    };

    // Today's Meetings Logic
    const today = new Date();
    const todaysMeetings = getMeetingsForDay(today);

    // Navigation Logic
    const navigateCalendar = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        } else if (view === 'week') {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const onMeetingClick = (m: Meeting) => {
        // Navigate to Day view of that meeting
        setCurrentDate(new Date(m.date));
        setView('day');
        setExpandedMeetingId(m.id);
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = getMonthData(year, month);
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        if (!day) return <div key={idx} className="bg-gray-50/50 aspect-square rounded-lg" />;
                        const dayMeetings = getMeetingsForDay(day);
                        const isToday = isSameDay(day, today);

                        return (
                            <div key={idx} className={`aspect-square p-2 border rounded-xl relative hover:border-indigo-300 transition-colors cursor-pointer flex flex-col items-center justify-between
                                ${isToday ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-100'}
                                ${dayMeetings.length > 0 ? 'ring-1 ring-indigo-100' : ''}
                            `}
                                onClick={() => { setCurrentDate(day); setView('day'); }} // Switch to day view on click
                            >
                                <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day.getDate()}</span>
                                {dayMeetings.length > 0 && (
                                    <div className="flex gap-1 flex-wrap justify-center">
                                        {dayMeetings.slice(0, 3).map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }

        return (
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                    const dayMeetings = getMeetingsForDay(day);
                    const isToday = isSameDay(day, today);
                    return (
                        <div key={idx}
                            onClick={() => { setCurrentDate(day); setView('day'); }}
                            className={`min-h-[200px] bg-white rounded-xl border p-3 flex flex-col gap-2 cursor-pointer hover:border-indigo-300 transition-colors ${isToday ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-gray-100'}`}
                        >
                            <div className="text-center pb-2 border-b border-gray-50 mb-1">
                                <p className="text-xs text-gray-400 font-bold uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                <p className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-gray-800'}`}>{day.getDate()}</p>
                            </div>
                            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-hide">
                                {dayMeetings.map(m => (
                                    <div key={m.id}
                                        onClick={(e) => { e.stopPropagation(); onMeetingClick(m); }}
                                        className="p-2 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg border border-indigo-100/50 cursor-pointer transition-colors"
                                    >
                                        <p className="text-xs font-bold text-indigo-900 truncate">{m.startTime}</p>
                                        <p className="text-xs text-gray-600 truncate">{getDisplayName(m)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const dayMeetings = getMeetingsForDay(currentDate);

        return (
            <div className="min-h-[400px] bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <CalendarIcon size={20} className="text-indigo-600" />
                    Schedule for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                {dayMeetings.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Clock size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No meetings scheduled for this day.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {dayMeetings.map(m => (
                            <div key={m.id} className="group flex gap-4 p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                <div className="w-16 flex flex-col items-center pt-1">
                                    <span className="text-sm font-bold text-gray-900">{m.startTime}</span>
                                    <div className="w-px h-full bg-gray-200 mt-2 group-last:hidden"></div>
                                </div>
                                <div className="flex-1">
                                    <div className={`p-4 rounded-xl border ${m.status === 'CONFIRMED' ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200 shadow-sm'}`}>

                                        {/* Header Row: Info or Edit Mode */}
                                        {editingMeetingId === m.id ? (
                                            <div className="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100 space-y-3">
                                                <h4 className="font-bold text-indigo-800 flex items-center gap-2"><Edit2 size={16} /> Rescheduling Meeting</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-indigo-600">New Date</label>
                                                        <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full p-2 rounded border border-indigo-200 text-sm" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-xs font-bold text-indigo-600">Start</label>
                                                            <input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} className="w-full p-2 rounded border border-indigo-200 text-sm" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-xs font-bold text-indigo-600">End</label>
                                                            <input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} className="w-full p-2 rounded border border-indigo-200 text-sm" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end pt-2">
                                                    <Button size="sm" variant="outline" onClick={handleCancelReschedule}><X size={14} /> Cancel</Button>
                                                    <Button size="sm" onClick={handleSaveReschedule} disabled={isSaving} isLoading={isSaving}><Save size={14} /> Save Changes</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-lg">
                                                        Meeting w/ {getDisplayName(m)}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                        <Clock size={14} /> {m.startTime} - {m.endTime}
                                                        {m.request?.displayId && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Req #{m.request.displayId}</span>}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <Badge status={m.status} />
                                                    {user?.role === 'CLIENT' && ['PENDING', 'CONFIRMED'].includes(m.status) && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleStartReschedule(m); }}
                                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                                        >
                                                            <Edit2 size={12} /> Reschedule
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Expandable Details */}
                                        <button
                                            onClick={() => setExpandedMeetingId(expandedMeetingId === m.id ? null : m.id)}
                                            className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1 mt-2"
                                        >
                                            {expandedMeetingId === m.id ? 'Hide Details' : 'View Details & Chat'}
                                        </button>

                                        {expandedMeetingId === m.id && (
                                            <MeetingChat
                                                meeting={m}
                                                user={user}
                                                onSendMessage={handleSendReply}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) return <div className="p-8 text-center flex items-center justify-center h-full"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

            {/* 1. Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                        <CalendarIcon className="text-indigo-600" size={32} /> {user?.role === 'ADMIN' ? 'Global Calendar' : 'My Calendar'}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {user?.role === 'ADMIN' ? 'Monitor all scheduled sessions across the platform.' : 'Manage your schedule and upcoming sessions.'}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    {(['day', 'week', 'month'] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${view === v ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            {v} View
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Today's Meetings Table */}
            <Card className="overflow-hidden border-0 shadow-xl ring-1 ring-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Today's Schedule
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{today.toLocaleDateString()}</span>
                </div>

                {todaysMeetings.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-white">
                        <p>No meetings scheduled for today. Enjoy your day!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">With</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {todaysMeetings.map(m => (
                                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 border-l-4 border-transparent group-hover:border-indigo-500 transition-colors">
                                            {m.startTime} - {m.endTime}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                    {getDisplayAvatarChar(m)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{getDisplayName(m)}</p>
                                                    {m.request?.displayId && <p className="text-xs text-gray-400">Req #{m.request.displayId}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={m.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="outline" onClick={() => { setView('day'); setExpandedMeetingId(m.id); }}>
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* 3. Calendar View Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <button onClick={() => navigateCalendar('prev')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="text-gray-600" /></button>
                <h2 className="text-xl font-bold text-gray-900">
                    {view === 'month' ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                        view === 'day' ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) :
                            `Week of ${new Date(new Date(currentDate).setDate(currentDate.getDate() - currentDate.getDay())).toLocaleDateString()}`}
                </h2>
                <button onClick={() => navigateCalendar('next')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="text-gray-600" /></button>
            </div>

            {/* 4. Calendar View Render */}
            <div className="animate-in slide-in-from-bottom-4 duration-500">
                {view === 'month' && renderMonthView()}
                {view === 'week' && renderWeekView()}
                {view === 'day' && renderDayView()}
            </div>

        </div>
    );
};

export default Meetings;
