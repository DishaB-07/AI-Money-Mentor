import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History as HistoryIcon, Trash2, ChevronRight, Calculator, Target, Activity, Heart, TrendingUp, Sparkles, FileText } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { subscribeToHistory } from '../services/history';
import { deleteDoc, doc } from 'firebase/firestore';

const typeIcons: Record<string, any> = {
  tax: <Calculator className="text-blue-500" />,
  fire: <Target className="text-green-500" />,
  health: <Activity className="text-orange-500" />,
  couple: <Heart className="text-pink-500" />,
  xray: <TrendingUp className="text-yellow-500" />,
  events: <Sparkles className="text-purple-500" />
};

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = subscribeToHistory(auth.currentUser.uid, (data) => {
      setHistory(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/history`, id));
    } catch (error) {
      console.error("Error deleting history item:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gray-100 rounded-2xl">
          <HistoryIcon className="text-gray-900" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-syne">Calculation History</h1>
          <p className="text-gray-500 font-sans">Your past financial reports and AI insights.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-gray-50 rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">No history found yet.</p>
          <p className="text-sm text-gray-400">Start using our planners to see your history here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  {typeIcons[item.type] || <FileText className="text-gray-400" />}
                </div>
                <div>
                  <h3 className="font-bold capitalize font-syne">{item.type} Analysis</h3>
                  <p className="text-xs text-gray-400 font-sans">
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight className="text-gray-300" size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
