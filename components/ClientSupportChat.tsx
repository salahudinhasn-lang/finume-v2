
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Headphones, Paperclip, CheckCircle, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
}

const ClientSupportChat = () => {
  const { user, language } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! Welcome to Finume Support. How can we assist you with your requests or compliance today?`, 
      sender: 'agent', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Position logic: Opposite to AI Assistant/WhatsApp
  // EN (LTR): AI is Right, Chat should be Left
  // AR (RTL): AI is Left, Chat should be Right
  const positionClass = language === 'en' ? 'left-6' : 'right-6';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Only show for Clients or Experts (Logged in)
  if (!user) return null;

  const handleSend = () => {
    if (!input.trim() || isResolved) return;

    const newMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      const responses = [
        "I understand. Could you provide the Request ID relating to this issue?",
        "Our team is reviewing your account details now.",
        "That's a great question regarding ZATCA compliance. Let me connect you with a specialist.",
        "I've updated the notes on your profile. Is there anything else?",
        "Please hold on a moment while I check the status of that transaction."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMsg: Message = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleResolve = () => {
    setIsResolved(true);
    setMessages(prev => [...prev, {
        id: Date.now(),
        text: "This conversation has been marked as resolved.",
        sender: 'system',
        timestamp: new Date()
    }]);
  };

  const handleRestart = () => {
    setIsResolved(false);
    setMessages([{
        id: Date.now(),
        text: "How can we help you today?",
        sender: 'agent',
        timestamp: new Date()
    }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 ${positionClass} p-4 bg-gray-900 text-white rounded-full shadow-xl hover:bg-gray-800 transition-all z-50 flex items-center gap-3 group animate-in fade-in slide-in-from-bottom-4`}
      >
        <div className="relative">
            <Headphones size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
        </div>
        <span className="font-medium pr-2 hidden md:inline group-hover:inline transition-all">Support Team</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 ${positionClass} w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
      {/* Header */}
      <div 
        className="p-4 bg-gray-900 text-white flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                <Headphones size={20} />
             </div>
             <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-gray-900 rounded-full ${isResolved ? 'bg-gray-400' : 'bg-green-500'}`}></span>
          </div>
          <div>
            <h3 className="font-bold text-sm">Finume Support</h3>
            <p className="text-xs text-gray-400">{isResolved ? 'Conversation Closed' : 'Typically replies in 2m'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
            {!isResolved && (
                <button 
                    onClick={(e) => { e.stopPropagation(); handleResolve(); }} 
                    className="p-1 hover:bg-gray-700 rounded text-green-400 hover:text-green-300 mr-1"
                    title="Mark as Resolved"
                >
                    <CheckCircle size={18} />
                </button>
            )}
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
                <X size={18} />
            </button>
        </div>
      </div>

      {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                <div className="text-center text-xs text-gray-400 my-4">Today</div>
                
                {messages.map((msg) => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                    <CheckCircle size={10} /> {msg.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'agent' && (
                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                    <Headphones size={12} className="text-gray-600" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                            }`}>
                                <p>{msg.text}</p>
                                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex justify-start">
                         <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1">
                                <Headphones size={12} className="text-gray-600" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
                {!isResolved ? (
                    <>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                            <button className="text-gray-400 hover:text-gray-600">
                                <Paperclip size={18} />
                            </button>
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-800 placeholder-gray-500"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className={`p-2 rounded-full transition-colors ${
                                    input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400'
                                }`}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">Powered by Finume Support</p>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-sm text-gray-500 mb-3">Conversation ended.</p>
                        <button 
                            onClick={handleRestart}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                        >
                            <RefreshCw size={16} /> Start New Chat
                        </button>
                    </div>
                )}
            </div>
          </>
      )}
    </div>
  );
};

export default ClientSupportChat;
