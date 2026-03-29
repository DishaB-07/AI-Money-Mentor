import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History as HistoryIcon, 
  Search, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  Filter,
  Activity,
  Target,
  Calculator,
  Heart,
  TrendingUp,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useLanguage } from '../App';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface HistoryItem {
  id: string;
  type: 'score' | 'fire' | 'tax' | 'couple' | 'xray' | 'chat';
  timestamp: any;
  data: any;
  insight?: string;
  title?: string;
}

export default function History() {
  const { language } = useLanguage();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'history'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const historyItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      setItems(historyItems);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching history:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const deleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'history', id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  const t = {
    English: {
      title: 'Activity History',
      subtitle: 'Review your past calculations, insights, and AI conversations.',
      search: 'Search history...',
      noResults: 'No history found.',
      deleteConfirm: 'Are you sure you want to delete this?',
      details: 'Details',
      insight: 'AI Insight',
      data: 'Input Data',
      types: {
        all: 'All',
        score: 'Health Score',
        fire: 'FIRE Plan',
        tax: 'Tax Wizard',
        couple: 'Couple Plan',
        xray: 'Portfolio X-Ray',
        chat: 'AI Chat'
      }
    },
    Hindi: {
      title: 'गतिविधि इतिहास',
      subtitle: 'अपनी पिछली गणनाओं, अंतर्दृष्टि और AI बातचीत की समीक्षा करें।',
      search: 'इतिहास खोजें...',
      noResults: 'कोई इतिहास नहीं मिला।',
      deleteConfirm: 'क्या आप वाकई इसे हटाना चाहते हैं?',
      details: 'विवरण',
      insight: 'AI अंतर्दृष्टि',
      data: 'इनपुट डेटा',
      types: {
        all: 'सभी',
        score: 'हेल्थ स्कोर',
        fire: 'FIRE प्लान',
        tax: 'टैक्स विजार्ड',
        couple: 'कपल प्लान',
        xray: 'पोर्टफोलियो एक्स-रे',
        chat: 'AI चैट'
      }
    },
    Hinglish: {
      title: 'Activity History',
      subtitle: 'Apne past calculations, insights, aur AI conversations review karein.',
      search: 'Search history...',
      noResults: 'No history found.',
      deleteConfirm: 'Are you sure you want to delete this?',
      details: 'Details',
      insight: 'AI Insight',
      data: 'Input Data',
      types: {
        all: 'All',
        score: 'Health Score',
        fire: 'FIRE Plan',
        tax: 'Tax Wizard',
        couple: 'Couple Plan',
        xray: 'Portfolio X-Ray',
        chat: 'AI Chat'
      }
    }
  }[language as 'English' | 'Hindi' | 'Hinglish'];

  const getIcon = (type: string) => {
    switch (type) {
      case 'score': return <Activity className="text-emerald-500" />;
      case 'fire': return <Target className="text-orange-500" />;
      case 'tax': return <Calculator className="text-blue-500" />;
      case 'couple': return <Heart className="text-pink-500" />;
      case 'xray': return <TrendingUp className="text-indigo-500" />;
      case 'chat': return <MessageSquare className="text-amber-500" />;
      default: return <HistoryIcon className="text-gray-500" />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat(language === 'Hindi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 lg:px-0">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-syne mb-3 tracking-tight flex items-center gap-4">
            <HistoryIcon className="text-[#D97706]" size={40} />
            {t.title}
          </h1>
          <p className="text-gray-500 font-sans text-lg">{t.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#D97706] bg-white font-sans text-sm shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-12 pr-10 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#D97706] bg-white font-sans text-sm shadow-sm appearance-none cursor-pointer font-bold"
            >
              {Object.entries(t.types).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List */}
        <div className={cn("lg:col-span-5 space-y-4", selectedItem && "hidden lg:block")}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />
            ))
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-400 font-bold">{t.noResults}</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <motion.div
                layoutId={item.id}
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  "p-5 rounded-3xl border transition-all cursor-pointer group relative",
                  selectedItem?.id === item.id 
                    ? "bg-[#D97706] border-[#D97706] shadow-lg shadow-[#D97706]/20" 
                    : "bg-white border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    selectedItem?.id === item.id ? "bg-white/20" : "bg-gray-50"
                  )}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        selectedItem?.id === item.id ? "text-white/70" : "text-gray-400"
                      )}>
                        {t.types[item.type as keyof typeof t.types]}
                      </span>
                      <span className={cn(
                        "text-[10px] font-bold",
                        selectedItem?.id === item.id ? "text-white/50" : "text-gray-300"
                      )}>
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <h3 className={cn(
                      "font-bold truncate font-syne",
                      selectedItem?.id === item.id ? "text-white" : "text-gray-900"
                    )}>
                      {item.title || t.types[item.type as keyof typeof t.types]}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={(e) => deleteItem(item.id, e)}
                  className={cn(
                    "absolute top-4 right-4 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all",
                    selectedItem?.id === item.id ? "text-white/50 hover:text-white hover:bg-white/10" : "text-gray-300 hover:text-red-500 hover:bg-red-50"
                  )}
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Details View */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden sticky top-8"
              >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      {getIcon(selectedItem.type)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-syne">{selectedItem.title || t.types[selectedItem.type as keyof typeof t.types]}</h2>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mt-1">
                        <Clock size={12} /> {formatDate(selectedItem.timestamp)}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="lg:hidden p-3 bg-gray-100 rounded-2xl"
                  >
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  {selectedItem.insight && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
                        <Sparkles size={14} /> {t.insight}
                      </div>
                      <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-3xl text-gray-800 leading-relaxed font-sans prose prose-sm prose-amber max-w-none">
                        <ReactMarkdown>{selectedItem.insight}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      <Activity size={14} /> {t.data}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(selectedItem.data).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-lg font-bold text-gray-900 font-syne">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                  <button 
                    onClick={() => {/* Navigate to relevant page with data */}}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
                  >
                    Re-calculate <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-[600px] bg-white rounded-[2.5rem] border border-gray-100 border-dashed text-center p-12">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <HistoryIcon className="text-gray-200" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-300 font-syne mb-2">Select an item to view details</h3>
                <p className="text-gray-400 font-sans max-w-xs">Click on any activity from the list to see the full breakdown and AI insights.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
