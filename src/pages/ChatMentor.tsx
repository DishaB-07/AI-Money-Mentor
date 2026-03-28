import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { createChat } from '../services/gemini';
import { useLanguage } from '../App';

export default function ChatMentor() {
  const { language } = useLanguage();
  
  const getInitialMessage = (lang: string) => {
    if (lang === 'Hindi') {
      return `नमस्ते! मैं **धनसेतु** हूँ, आपका अपना CA और फाइनेंशियल मेंटर। मैं यहाँ फाइनेंस को आपके लिए आसान बनाने आया हूँ।

मैं आज आपकी कैसे मदद कर सकता हूँ? आप मुझसे इनके बारे में पूछ सकते हैं:
* **Tax Saving** (सरकार को कम टैक्स देना)
* **Investing** (Mutual Funds, Gold, या FDs में पैसा बढ़ाना)
* **Budgeting** (अपनी मंथली सैलरी मैनेज करना)
* **Insurance** (अपने परिवार का भविष्य सुरक्षित करना)

आपके मन में क्या चल रहा है?`;
    }
    if (lang === 'Hinglish') {
      return `Namaste! Main hoon **DhanSetu**, aapka friendly CA aur financial mentor. Main yahan finance ko aapke liye simple banane aaya hoon.

Aaj main aapki wealth build karne mein kaise help kar sakta hoon? Aap mujhse pooch sakte hain:
* **Tax Saving** (Government ko kam tax dena)
* **Investing** (Mutual Funds, Gold, ya FDs mein paisa badhana)
* **Budgeting** (Monthly salary manage karna)
* **Insurance** (Apni family ka future protect karna)

Aapke mind mein kya chal raha hai?`;
    }
    return `Namaste! I am **DhanSetu**, your friendly CA and financial mentor. I’m here to make finance simple for you.

How can I help you today? You can ask me about:
* **Tax Saving** (Paying less tax to the government)
* **Investing** (Growing your money in Mutual Funds, Gold, or FDs)
* **Budgeting** (Managing your monthly salary)
* **Insurance** (Protecting your family’s future)

What’s on your mind?`;
  };

  const [messages, setMessages] = useState([
    { role: 'assistant', content: getInitialMessage(language) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Update initial message when language changes, but only if it's the only message
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', content: getInitialMessage(language) }]);
    }
  }, [language]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chat = createChat(messages.slice(-5), language, highThinking);
      const response = await chat.sendMessageStream({ message: text });
      
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      for await (const chunk of response) {
        const chunkText = chunk.text;
        if (chunkText) {
          setMessages(prev => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = { 
                ...updated[lastIndex], 
                content: updated[lastIndex].content + chunkText 
              };
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your internet and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full max-w-3xl mx-auto"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 font-syne">
            <Sparkles className="text-[#D97706]" /> AI Mentor Chat
          </h1>
          <p className="text-gray-500 text-sm font-sans">Your CA friend, 24/7. Trained on Indian financial laws.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider", highThinking ? "text-[#D97706]" : "text-gray-400")}>
            {highThinking ? "Expert Mode" : "Standard Mode"}
          </span>
          <button 
            onClick={() => setHighThinking(!highThinking)}
            className={cn(
              "w-10 h-5 rounded-full transition-all relative",
              highThinking ? "bg-[#D97706]" : "bg-gray-200"
            )}
          >
            <div className={cn(
              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
              highThinking ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/50 rounded-3xl border border-gray-100 p-4 mb-4 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-gray-900" : "bg-white border border-gray-100"
              )}>
                {msg.role === 'user' ? (
                  <img src={auth.currentUser?.photoURL || ''} className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <Bot size={16} className="text-[#D97706]" />
                )}
              </div>
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm font-sans prose prose-sm",
                msg.role === 'user' 
                  ? "bg-gray-900 text-white rounded-tr-none prose-invert" 
                  : "bg-orange-50/50 border border-orange-100 rounded-tl-none text-gray-800 prose-orange"
              )}>
                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs animate-pulse ml-11">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            DhanSetu is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="relative flex items-center gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask about mutual funds, tax, or retirement..." 
          className="flex-1 p-4 pr-14 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#D97706] shadow-sm bg-white font-sans"
          disabled={loading}
        />
        <button 
          onClick={() => sendMessage(input)} 
          disabled={loading || !input.trim()} 
          className="absolute right-2 p-2.5 bg-[#D97706] text-white rounded-xl hover:bg-[#B45309] transition-all disabled:opacity-50 shadow-md"
        >
          <Send size={20} />
        </button>
      </div>
    </motion.div>
  );
}
