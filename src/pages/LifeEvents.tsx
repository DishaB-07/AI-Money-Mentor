import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Gift, Heart, Baby, Coins, Sparkles, Send, ChevronRight, ArrowLeft, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../App';
import { auth } from '../lib/firebase';
import { createChat } from '../services/gemini';
import { saveHistory } from '../services/history';

type EventType = 'bonus' | 'inheritance' | 'marriage' | 'baby' | null;

export default function LifeEvents() {
  const { language } = useLanguage();
  const [selectedEvent, setSelectedEvent] = useState<EventType>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [highThinking, setHighThinking] = useState(false);
  const [saving, setSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const t = {
    English: {
      title: 'Life Event Advisor',
      subtitle: 'Personalized financial advice for major life milestones.',
      back: 'Choose another event',
      placeholder: 'Tell me about your situation...',
      thinking: 'DhanSetu is thinking...',
      expert: 'Expert',
      standard: 'Standard',
      aiAdvisor: 'AI Advisor',
      getAdvice: 'Get Advice',
      events: {
        bonus: { title: 'Bonus / Windfall', desc: 'Got a big bonus? Let\'s invest it right.' },
        inheritance: { title: 'Inheritance', desc: 'Managing family wealth with care.' },
        marriage: { title: 'Marriage', desc: 'Planning your life together.' },
        baby: { title: 'New Baby', desc: 'Securing your child\'s future.' }
      }
    },
    Hindi: {
      title: 'लाइफ इवेंट एडवाइजर',
      subtitle: 'जीवन के प्रमुख पड़ावों के लिए व्यक्तिगत वित्तीय सलाह।',
      back: 'दूसरा इवेंट चुनें',
      placeholder: 'अपनी स्थिति के बारे में बताएं...',
      thinking: 'DhanSetu सोच रहा है...',
      expert: 'विशेषज्ञ',
      standard: 'मानक',
      aiAdvisor: 'AI सलाहकार',
      getAdvice: 'सलाह लें',
      events: {
        bonus: { title: 'बोनस / अप्रत्याशित लाभ', desc: 'बड़ा बोनस मिला? इसे सही जगह निवेश करें।' },
        inheritance: { title: 'विरासत', desc: 'पारिवारिक संपत्ति का सावधानी से प्रबंधन।' },
        marriage: { title: 'विवाह', desc: 'साथ मिलकर अपने जीवन की योजना बनाना।' },
        baby: { title: 'नया बच्चा', desc: 'अपने बच्चे के भविष्य को सुरक्षित करना।' }
      }
    },
    Hinglish: {
      title: 'Life Event Advisor',
      subtitle: 'Major life milestones ke liye personalized financial advice.',
      back: 'Choose another event',
      placeholder: 'Apni situation ke baare mein batayein...',
      thinking: 'DhanSetu is thinking...',
      expert: 'Expert',
      standard: 'Standard',
      aiAdvisor: 'AI Advisor',
      getAdvice: 'Get Advice',
      events: {
        bonus: { title: 'Bonus / Windfall', desc: 'Got a big bonus? Let\'s invest it right.' },
        inheritance: { title: 'Inheritance', desc: 'Managing family wealth with care.' },
        marriage: { title: 'Marriage', desc: 'Planning your life together.' },
        baby: { title: 'New Baby', desc: 'Securing your child\'s future.' }
      }
    }
  }[language as 'English' | 'Hindi' | 'Hinglish'];

  const events = [
    { id: 'bonus', icon: <Gift className="text-orange-500" />, title: t.events.bonus.title, desc: t.events.bonus.desc, color: 'bg-orange-50 border-orange-100' },
    { id: 'inheritance', icon: <Coins className="text-yellow-500" />, title: t.events.inheritance.title, desc: t.events.inheritance.desc, color: 'bg-yellow-50 border-yellow-100' },
    { id: 'marriage', icon: <Heart className="text-pink-500" />, title: t.events.marriage.title, desc: t.events.marriage.desc, color: 'bg-pink-50 border-pink-100' },
    { id: 'baby', icon: <Baby className="text-blue-500" />, title: t.events.baby.title, desc: t.events.baby.desc, color: 'bg-blue-50 border-blue-100' }
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

  const saveChatToHistory = async () => {
    if (messages.length < 2) return;
    setSaving(true);
    try {
      const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
      await saveHistory({
        type: 'chat',
        data: { event: selectedEvent, conversationLength: messages.length },
        insight: lastAssistantMsg?.content || '',
        title: `AI Advice: ${events.find(e => e.id === selectedEvent)?.title}`
      });
      alert('Advice saved to your history!');
    } catch (err) {
      console.error('Error saving chat:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto h-full flex flex-col pb-20 px-4 lg:px-0"
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1"
          >
            {events.map((event, i) => (
              <motion.div 
                key={event.id}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => startEventChat(event.id as EventType)}
                className={cn(
                  "p-8 rounded-[2rem] border border-gray-100 cursor-pointer transition-all shadow-sm flex flex-col justify-between group h-full",
                  event.color
                )}
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    {event.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 font-syne">{event.title}</h3>
                  <p className="text-sm text-gray-500 font-sans leading-relaxed">{event.desc}</p>
                </div>
                <div className="mt-8 flex items-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-colors">
                  {t.getAdvice} <ChevronRight size={16} className="ml-2" />
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
            className="flex-1 flex flex-col bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden min-h-[600px]"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={18} /> {t.back}
              </button>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={saveChatToHistory}
                  disabled={saving || messages.length < 2}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-200 transition-all disabled:opacity-50 shadow-sm"
                >
                  <Sparkles size={14} /> {saving ? 'Saving...' : 'Save Advice'}
                </button>

                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", highThinking ? "text-[#D97706]" : "text-gray-400")}>
                    {highThinking ? t.expert : t.standard}
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
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex items-start gap-4",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md overflow-hidden",
                    msg.role === 'user' ? "bg-gray-900" : "bg-white border border-gray-100"
                  )}>
                    {msg.role === 'user' ? (
                      auth.currentUser?.photoURL ? (
                        <img src={auth.currentUser.photoURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User size={20} className="text-white" />
                      )
                    ) : (
                      <Bot size={20} className="text-[#D97706]" />
                    )}
                  </div>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm font-sans prose prose-sm",
                    msg.role === 'user' 
                      ? "bg-gray-900 text-white rounded-tr-none prose-invert" 
                      : "bg-amber-50/50 border border-amber-100 rounded-tl-none text-gray-800 prose-amber"
                  )}>
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex items-center gap-3 text-gray-400 text-xs animate-pulse ml-14">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {t.thinking}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30">
              <div className="relative flex items-center gap-3">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder={t.placeholder} 
                  className="flex-1 p-5 pr-16 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#D97706] shadow-sm bg-white font-sans text-sm"
                  disabled={loading}
                />
                <button 
                  onClick={() => sendMessage(input)} 
                  disabled={loading || !input.trim()} 
                  className="absolute right-2 p-3 bg-[#D97706] text-white rounded-xl hover:bg-[#B45309] transition-all disabled:opacity-50 shadow-lg"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
