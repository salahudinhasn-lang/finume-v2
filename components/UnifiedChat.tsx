import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Headphones, Paperclip, RefreshCw, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useAppContext } from '../context/AppContext';

interface SupportMessage {
  id: number;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
}

const UnifiedChat: React.FC = () => {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'AI' | 'SUPPORT'>('AI');
  const [isMinimized, setIsMinimized] = useState(false);

  // AI State
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am your Finume AI Assistant. Ask me about compliance, ZATCA regulations, or help finding an expert.', timestamp: Date.now() }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Support State
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([
    { 
      id: 1, 
      text: `Hi ${user?.name ? user.name.split(' ')[0] : 'there'}! Welcome to Finume Support. How can we assist you today?`, 
      sender: 'agent', 
      timestamp: new Date() 
    }
  ]);
  const [supportInput, setSupportInput] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);
  const [isSupportResolved, setIsSupportResolved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, supportMessages, isAiLoading, isSupportTyping, activeTab, isOpen]);

  // --- AI Handlers ---
  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: aiInput, timestamp: Date.now() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setIsAiLoading(true);

    const aiText = await generateAIResponse(userMsg.text);
    
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: aiText, timestamp: Date.now() };
    setAiMessages(prev => [...prev, aiMsg]);
    setIsAiLoading(false);
  };

  // --- Support Handlers ---
  const handleSupportSend = () => {
    if (!supportInput.trim() || isSupportResolved) return;
    const newMessage: SupportMessage = { id: Date.now(), text: supportInput, sender: 'user', timestamp: new Date() };
    setSupportMessages(prev => [...prev, newMessage]);
    setSupportInput('');
    setIsSupportTyping(true);

    setTimeout(() => {
      const responses = [
        "I understand. Could you provide the Request ID?",
        "Our team is reviewing your account details now.",
        "That's a great question regarding ZATCA compliance.",
        "I've updated the notes on your profile. Is there anything else?",
        "Please hold on a moment while I check the status."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const agentMsg: SupportMessage = { id: Date.now() + 1, text: randomResponse, sender: 'agent', timestamp: new Date() };
      setSupportMessages(prev => [...prev, agentMsg]);
      setIsSupportTyping(false);
    }, 2000);
  };

  const handleRestartSupport = () => {
    setIsSupportResolved(false);
    setSupportMessages(prev => [...prev, { id: Date.now(), text: "How can we help you today?", sender: 'agent', timestamp: new Date() }]);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        // Positioned vertically above the WhatsApp button (bottom-24 vs bottom-6)
        className="fixed bottom-24 right-6 z-[60] transition-transform hover:scale-105 duration-200 group flex flex-row-reverse items-center gap-2"
        title="Open Support"
      >
        <div className="bg-gray-900 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white ring-4 ring-white/50 relative">
             <MessageSquare size={26} />
             <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full"></span>
        </div>
        <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 text-sm font-bold text-gray-800 hidden group-hover:block animate-in fade-in slide-in-from-right-2">
            Need Help?
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 z-[60] flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
      
      {/* Header */}
      <div className="bg-gray-900 text-white p-2">
          <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                  <div className="bg-gray-700 p-1.5 rounded-lg">
                      {activeTab === 'AI' ? <Bot size={18} /> : <Headphones size={18} />}
                  </div>
                  <h3 className="font-bold text-sm">Finume Assistant</h3>
              </div>
              <div className="flex items-center gap-1">
                  <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"><div className="w-3 h-0.5 bg-current"></div></button>
                  <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white"><X size={16} /></button>
              </div>
          </div>

          {/* Tabs */}
          {!isMinimized && (
              <div className="flex p-1 bg-gray-800 rounded-xl mx-2 mb-2">
                  <button 
                    onClick={() => setActiveTab('AI')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'AI' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                  >
                      <Sparkles size={14} /> AI Assistant
                  </button>
                  <button 
                    onClick={() => setActiveTab('SUPPORT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'SUPPORT' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                  >
                      <Headphones size={14} /> Live Support
                  </button>
              </div>
          )}
      </div>

      {!isMinimized && (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {activeTab === 'AI' ? (
                  // AI Messages
                  <>
                    {aiMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-primary-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAiLoading && (
                       <div className="flex justify-start">
                        <div className="bg-white text-gray-500 border border-gray-100 rounded-2xl rounded-bl-none p-3 text-xs shadow-sm flex gap-1 items-center">
                          <Sparkles size={12} className="animate-spin" /> Thinking...
                        </div>
                      </div>
                    )}
                  </>
              ) : (
                  // Support Messages
                  <>
                    {supportMessages.map((msg) => {
                        if (msg.sender === 'system') {
                            return <div key={msg.id} className="text-center text-xs text-gray-400 my-2 bg-gray-200/50 py-1 rounded-full w-fit mx-auto px-3">{msg.text}</div>;
                        }
                        return (
                          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'agent' && <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-1 text-blue-600"><Headphones size={12}/></div>}
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                              msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}>
                              {msg.text}
                              <p className={`text-[10px] mt-1 text-right opacity-70`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                    })}
                    {isSupportTyping && (
                       <div className="flex justify-start items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Headphones size={12}/></div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none p-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                      </div>
                    )}
                  </>
              )}
              <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
              {activeTab === 'AI' ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                      placeholder="Ask Finume AI..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <button 
                      onClick={handleAiSend}
                      disabled={isAiLoading || !aiInput.trim()}
                      className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:bg-gray-300 transition-colors shadow-sm"
                    >
                      <Send size={18} />
                    </button>
                  </div>
              ) : (
                  // Support Input
                  !isSupportResolved ? (
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1.5">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
                            <Paperclip size={18} />
                        </button>
                        <input 
                            type="text" 
                            value={supportInput}
                            onChange={(e) => setSupportInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSupportSend()}
                            placeholder="Message support..."
                            className="flex-1 bg-transparent border-none focus:outline-none text-sm px-1"
                        />
                        <button 
                            onClick={handleSupportSend}
                            disabled={!supportInput.trim()}
                            className={`p-2 rounded-full transition-colors shadow-sm ${supportInput.trim() ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                        <button onClick={handleRestartSupport} className="flex items-center gap-2 text-sm font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
                            <RefreshCw size={16} /> Start New Chat
                        </button>
                    </div>
                  )
              )}
              <div className="text-center mt-2">
                  <p className="text-[10px] text-gray-400">
                      {activeTab === 'AI' ? 'AI can make mistakes. Check important info.' : 'Powered by Finume Support Team'}
                  </p>
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedChat;