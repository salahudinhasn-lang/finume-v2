import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from './UI';
import { Meeting, User } from '../types';

interface MeetingChatProps {
    meeting: Meeting;
    user: User | null;
    onSendMessage: (meetingId: string, content: string) => Promise<boolean>;
}

const MeetingChat: React.FC<MeetingChatProps> = ({ meeting, user, onSendMessage }) => {
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [meeting.messages]);

    const handleSend = async () => {
        if (!replyText.trim() || isSending) return;
        setIsSending(true);
        const success = await onSendMessage(meeting.id, replyText);
        if (success) {
            setReplyText('');
        }
        setIsSending(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100/50">
            <div className="bg-white/50 rounded-lg p-3 mb-3 max-h-48 overflow-y-auto space-y-2 border border-gray-100 scrollbar-thin scrollbar-thumb-gray-200">
                {meeting.notes && (
                    <p className="text-sm text-gray-600 italic bg-yellow-50 p-2 rounded border border-yellow-100">
                        "{meeting.notes}"
                    </p>
                )}

                {meeting.messages.length === 0 && !meeting.notes && (
                    <p className="text-center text-xs text-gray-400 py-4">No messages yet. Start the conversation!</p>
                )}

                {meeting.messages.map(msg => {
                    const isMe = msg.senderId === user?.id;
                    const senderName = isMe ? 'Me' : (msg.senderId === meeting.clientId ? meeting.clientName : (msg.senderId === meeting.expertId ? meeting.expertName : 'Admin'));
                    const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`text-sm p-2 rounded-lg max-w-[80%] ${isMe ? 'bg-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-800'}`}>
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                {senderName} • {time}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isSending}
                />
                <Button size="sm" onClick={handleSend} disabled={isSending}>
                    {isSending ? '...' : <Send size={14} />}
                </Button>
            </div>
        </div>
    );
};

export default MeetingChat;
