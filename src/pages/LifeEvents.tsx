import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Gift, Heart, Baby, Coins, Sparkles, Send, ChevronRight, ArrowLeft, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../App';
import { auth } from '../lib/firebase';
import { createChat } from '../services/gemini';

type EventType = 'bonus' | 'inheritance' | 'marriage' | 'baby' | null;

export default function LifeEvents() {
  const { language } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<EventType>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const events = [
    { id: 'bonus', icon: <Gift className="text-orange-500" />, title: 'Bonus / Windfall', desc: 'Got a big bonus? Let\'s invest it right.', color: 'bg-orange-50 border-orange-100' },
    { id: 'inheritance', icon: <Coins className="text-yellow-500" />, title: 'Inheritance', desc: 'Managing family wealth with care.', color: 'bg-yellow-50 border-yellow-100' },
    { id: 'marriage', icon: <Heart className="text-pink-500" />, title: 'Marriage', desc: 'Planning your life together.', color: 'bg-pink-50 border-pink-100' },
    { id: 'baby', icon: <Baby className="text-blue-500" />, title: 'New Baby', desc: 'Securing your child\'s future.', color: 'bg-blue-50 border-blue-100' }
  ];

  const startEventChat = (event: EventType) => {
    setSelectedEvent(event);
    const eventName = events.find(e => e.id === event)?.title;
    const initialMsg = {
      role: 'assistant',
      content: `Namaste! I see you've experienced a major life event: **${eventName}**. 
      
Congratulations! This is a great time to re-evaluate your finances. To give you the best advice, could you tell me:
1. What is the approximate amount involved (if applicable)?
2. What are your top 3 financial goals right now?
3. Do you have any existing debts or high-interest loans?`
    };
    setMessages([initialMsg]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const chat = createChat(messages.slice(-5), language, highThinking);
      const response = await chat.sendMessageStream({ message: `Context: Life Event - ${selectedEvent}. User says: ${text}` });
      
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    English: {
      title: 'Life Event Advisor',
      subtitle: 'Personalized financial advice for major life milestones.',
      back: 'Choose another event',
      placeholder: 'Tell me about your situation...'
    },
    Hindi: {
      title: 'लाइफ इवेंट एडवाइजर',
      subtitle: 'जीवन के प्रमुख पड़ावों के लिए व्यक्तिगत वित्तीय सलाह।',
      back: 'दूसरा इवेंट चुनें',
      placeholder: 'अपनी स्थिति के बारे में बताएं...'
    },
    Hinglish: {
      title: 'Life Event Advisor',
      subtitle: 'Major life milestones ke liye personalized financial advice.',
      back: 'Choose another event',
      placeholder: 'Apni situation ke baare mein batayein...'
    }
  }[language as 'English' | 'Hindi' | 'Hinglish'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold font-syne mb-2">{t.title}</h1>
        <p className="text-gray-500 font-sans">{t.subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedEvent ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1"
          >
            {events.map((event, i) => (
              <motion.div 
                key={event.id}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => startEventChat(event.id as EventType)}
                className={cn(
                  "p-6 rounded-3xl border border-gray-100 cursor-pointer transition-all shadow-sm flex flex-col justify-between group",
                  event.color
                )}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    {event.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-syne">{event.title}</h3>
                  <p className="text-sm text-gray-500 font-sans">{event.desc}</p>
                </div>
                <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-900 transition-colors">
                  Get Advice <ChevronRight size={14} className="ml-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-bottom border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} /> {t.back}
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", highThinking ? "text-[#D97706]" : "text-gray-400")}>
                    {highThinking ? "Expert" : "Standard"}
                  </span>
                  <button 
                    onClick={() => setHighThinking(!highThinking)}
                    className={cn(
                      "w-8 h-4 rounded-full transition-all relative",
                      highThinking ? "bg-[#D97706]" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all",
                      highThinking ? "left-4.5" : "left-0.5"
                    )} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#D97706]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">AI Advisor</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
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
                      <Bot size={14} className="text-[#D97706]" />
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

            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
              <div className="relative flex items-center gap-2">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder={t.placeholder} 
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
