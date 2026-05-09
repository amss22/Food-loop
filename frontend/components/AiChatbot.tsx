'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles, BookOpen, MessageCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { findBestIntent, getCategories, getIntentsByCategory } from '../utils/chatbotEngine';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'faq'>('chat');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm FoodLoop AI. Ask me anything about donations, NGOs, or how the platform works." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, viewMode]);

  const simulateTyping = async (text: string) => {
    setIsTyping(true);
    // Simulate natural delay based on text length
    await new Promise(r => setTimeout(r, Math.min(800 + text.length * 10, 2000)));
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'assistant', content: text }]);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSubmit = textOverride || input.trim();
    if (!textToSubmit) return;

    if (viewMode === 'faq') setViewMode('chat');

    const userMessage = { role: 'user' as const, content: textToSubmit };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // 1. Check Local Intents First
    const localMatch = findBestIntent(textToSubmit);
    if (localMatch) {
      await simulateTyping(localMatch.answer);
      return;
    }

    // 2. Fallback to API if no local match
    setIsTyping(true);
    try {
      const { data } = await axios.post(`${API}/ai/chat`, {
        messages: [...messages, userMessage]
      });
      
      if (data.success && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error('Failed to get reply');
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I couldn't find an exact answer for that, and I'm currently offline from my main AI brain. Please check the FAQ Directory!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = ["How to donate?", "Who can receive food?", "How does AI matching work?"];

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-green-600 to-green-400 rounded-full flex items-center justify-center shadow-2xl shadow-green-600/30 text-white z-50 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
        <Bot className="w-7 h-7 z-10" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] bg-white rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden z-50 flex flex-col border border-green-50"
            style={{ height: '600px' }}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-green-600 to-green-500 text-white shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-green-50" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight">FoodLoop AI</h3>
                    <p className="text-[10px] text-green-100 font-bold uppercase tracking-widest">Smart Assistant</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex bg-green-700/40 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('chat')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'chat' ? 'bg-white text-green-600 shadow-sm' : 'text-green-50 hover:bg-green-600/50'}`}
                >
                  <MessageCircle className="w-4 h-4" /> Live Chat
                </button>
                <button 
                  onClick={() => setViewMode('faq')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'faq' ? 'bg-white text-green-600 shadow-sm' : 'text-green-50 hover:bg-green-600/50'}`}
                >
                  <BookOpen className="w-4 h-4" /> FAQ Directory
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-[#f8fdf9]">
              {viewMode === 'chat' ? (
                // Chat Mode
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 shadow-sm border border-green-200">
                            <Bot className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                        <div 
                          className={`px-4 py-3 text-sm rounded-2xl max-w-[80%] leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-gradient-to-br from-green-600 to-green-500 text-white rounded-br-sm shadow-md' 
                              : 'bg-white border border-green-50 text-slate-700 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-end gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 shadow-sm border border-green-200">
                          <Bot className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="px-5 py-4 bg-white border border-green-50 rounded-2xl rounded-bl-sm shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Replies */}
                  {messages.length < 3 && !isTyping && (
                    <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                      {quickReplies.map(qr => (
                        <button
                          key={qr}
                          onClick={() => handleSend(qr)}
                          className="shrink-0 px-4 py-2 bg-white border border-green-100 rounded-full text-xs font-bold text-green-700 hover:bg-green-50 hover:border-green-200 transition-colors shadow-sm"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 bg-white border-t border-green-50">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-green-400 focus-within:ring-4 focus-within:ring-green-500/10 transition-all">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-800 placeholder-slate-400"
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-green-500 text-white hover:bg-green-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-md"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // FAQ Directory Mode
                <div className="absolute inset-0 overflow-y-auto p-5">
                  {!selectedCategory ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Browse Topics</h4>
                      {getCategories().map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className="w-full flex items-center justify-between p-4 bg-white border border-green-50 rounded-2xl hover:border-green-300 hover:shadow-md transition-all group"
                        >
                          <span className="font-bold text-slate-700 group-hover:text-green-700">{cat}</span>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-green-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-700 mb-6 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to Topics
                      </button>
                      <h4 className="text-xl font-black text-slate-800 mb-4">{selectedCategory} FAQs</h4>
                      <div className="space-y-4">
                        {getIntentsByCategory(selectedCategory).map(intent => (
                          <div key={intent.id} className="bg-white p-4 rounded-2xl border border-green-50 shadow-sm">
                            <p className="font-bold text-slate-800 text-sm mb-2">{intent.variations[0]}</p>
                            <p className="text-sm text-slate-600 leading-relaxed bg-green-50/50 p-3 rounded-xl border border-green-100/50">{intent.answer}</p>
                            <button
                              onClick={() => {
                                handleSend(intent.variations[0]);
                                setViewMode('chat');
                              }}
                              className="mt-3 text-xs font-bold text-green-600 hover:text-green-700"
                            >
                              Ask this in chat →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
