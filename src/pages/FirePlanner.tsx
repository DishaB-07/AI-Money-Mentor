import { useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Target, TrendingUp, Info, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getFinancialInsight } from '../services/gemini';
import { useLanguage } from '../App';

export default function FirePlanner() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ 
    monthlyExpenses: 50000, 
    inflationRate: 6, 
    yearsToRetire: 15, 
    currentSavings: 500000 
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/fire-plan`, formData);
      const calculations = res.data.calculations;
      
      const aiInsights = await getFinancialInsight("FIRE Planning", calculations, language);
      
      const finalResult = { calculations, ai_insights: aiInsights };
      setResult(finalResult);
      
      // Save to history
      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/history`;
        try {
          await addDoc(collection(db, path), {
            uid: auth.currentUser.uid,
            type: 'fire',
            input: formData,
            output: calculations,
            aiInsights: aiInsights,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
    } catch (err) { 
      console.error('Error calculating FIRE:', err);
      alert('Error calculating FIRE plan. Please try again.'); 
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-2 font-syne">FIRE Planner</h1>
      <p className="text-gray-500 mb-8 font-sans">Financial Independence, Retire Early. Your roadmap to freedom.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6 font-syne">Retirement Goals</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Current Monthly Expenses (₹)</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#059669' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-[#059669] transition-all"
                value={formData.monthlyExpenses} 
                onChange={(e) => setFormData({...formData, monthlyExpenses: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Expected Inflation Rate (%)</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#059669' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-[#059669] transition-all"
                value={formData.inflationRate} 
                onChange={(e) => setFormData({...formData, inflationRate: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Years to Retirement</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#059669' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-[#059669] transition-all"
                value={formData.yearsToRetire} 
                onChange={(e) => setFormData({...formData, yearsToRetire: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Current Savings (₹)</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#059669' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-[#059669] transition-all"
                value={formData.currentSavings} 
                onChange={(e) => setFormData({...formData, currentSavings: Number(e.target.value)})} 
              />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate} 
            disabled={loading} 
            className="w-full bg-[#059669] text-white py-4 rounded-xl font-bold mt-8 hover:bg-[#047857] transition-all disabled:opacity-50 shadow-lg shadow-[#059669]/20"
          >
            {loading ? 'Building Roadmap...' : 'Generate FIRE Plan'}
          </motion.button>
        </div>

        <div className="space-y-6">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-[#059669] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Required FIRE Corpus</p>
                  <h2 className="text-4xl md:text-5xl font-black mb-6 font-syne">₹{result.calculations.fire_corpus.toLocaleString()}</h2>
                  
                  <div className="bg-black/20 backdrop-blur-md p-4 rounded-xl border border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Required Monthly SIP (at 12%)</p>
                    <h3 className="text-2xl font-bold font-syne">₹{result.calculations.required_sip.toLocaleString()}</h3>
                  </div>
                </div>
                <Target className="absolute -bottom-4 -right-4 text-white/10" size={120} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Future Monthly Exp.</p>
                  <p className="text-lg font-bold text-gray-700">₹{result.calculations.future_monthly_expenses.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Corpus Shortfall</p>
                  <p className="text-lg font-bold text-red-500">₹{result.calculations.shortfall.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-64">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Projected Corpus Growth</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.from({ length: formData.yearsToRetire + 1 }, (_, i) => {
                    const r = 0.12;
                    const years = i;
                    const futureValue = formData.currentSavings * Math.pow(1 + r, years) + 
                      (result.calculations.required_sip * 12 * (Math.pow(1 + r, years) - 1)) / r;
                    return { year: i, corpus: Math.round(futureValue) };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Corpus']}
                    />
                    <Line type="monotone" dataKey="corpus" stroke="#059669" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-[#059669]">
                <h4 className="font-bold text-lg mb-4 text-black font-syne flex items-center gap-2">
                  <span className="text-xl">🚀</span> Execution Strategy
                </h4>
                <div className="text-sm text-gray-600 leading-relaxed font-sans prose prose-sm max-w-none prose-orange">
                  <ReactMarkdown>{result.ai_insights}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="text-gray-400" size={32} />
              </div>
              <h3 className="font-bold text-gray-400 mb-2 font-syne">Plan Your Freedom</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Enter your goals to see how much you need to retire early.</p>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl text-left flex gap-3 border border-blue-100">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-[10px] text-blue-700 leading-normal">
                  We use the 4% rule (25x annual expenses) for corpus calculation and assume a 12% CAGR for your investments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
