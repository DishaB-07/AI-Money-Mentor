import { useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { ShieldAlert, CheckCircle2, AlertCircle, Activity, Radar as RadarIcon } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getFinancialInsight } from '../services/gemini';
import { useLanguage } from '../App';

export default function HealthScore() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ 
    savings: 150000, 
    debt: 50000, 
    emi: 15000, 
    income: 80000, 
    insurance: 500000 
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/health-score`, formData);
      const calculations = res.data.calculations;
      
      const aiInsights = await getFinancialInsight("Financial Health Score", calculations, language);
      
      const finalResult = { calculations, ai_insights: aiInsights };
      setResult(finalResult);
      
      // Save to history
      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/history`), {
          uid: auth.currentUser.uid,
          type: 'health',
          input: formData,
          output: calculations,
          aiInsights: aiInsights,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) { 
      console.error('Error calculating score:', err);
      alert('Error calculating score. Please try again.'); 
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-2 font-syne">Money Health Score</h1>
      <p className="text-gray-500 mb-8 font-sans">Your financial report card in 5 minutes. Find out where you stand.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-6 font-syne"> ₹ Finance Dashboard </h3>
          <div className="space-y-4">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{key}</label>
                <input 
                  type="number" 
                  className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-[#D97706] transition-all"
                  value={formData[key as keyof typeof formData]} 
                  onChange={(e) => setFormData({...formData, [key]: Number(e.target.value)})} 
                />
              </div>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate} 
            disabled={loading} 
            className="w-full bg-[#D97706] text-white py-4 rounded-xl font-bold mt-8 hover:bg-[#B45309] transition-all disabled:opacity-50 shadow-lg shadow-[#D97706]/20"
          >
            {loading ? 'Analyzing ...' : 'Get Health Score'}
          </motion.button>
        </div>

        <div className="space-y-6">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-8 text-white shadow-xl ${result.calculations.grade === 'A+' ? 'bg-[#059669]' : 'bg-red-500'}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold uppercase tracking-widest opacity-80">Financial Grade</span>
                  {result.calculations.grade === 'A+' ? <CheckCircle2 size={32} /> : <ShieldAlert size={32} />}
                </div>
                <h1 className="text-7xl font-black mb-2 font-syne">{result.calculations.grade}</h1>
                <p className="text-lg font-medium opacity-90">Score: {result.calculations.score}/100</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-64">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Health Metrics</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: 'Savings', A: formData.savings / 1000, fullMark: 150 },
                    { subject: 'Debt', A: Math.max(0, 150 - (formData.debt / 1000)), fullMark: 150 },
                    { subject: 'Income', A: formData.income / 1000, fullMark: 150 },
                    { subject: 'Insurance', A: formData.insurance / 10000, fullMark: 150 },
                    { subject: 'EMI', A: Math.max(0, 150 - (formData.emi / 100)), fullMark: 150 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <Radar name="Score" dataKey="A" stroke="#D97706" fill="#D97706" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {result.calculations.issues.length > 0 && (
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                  <h4 className="font-bold text-red-700 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} /> Red Flags Detected
                  </h4>
                  <ul className="space-y-3">
                    {result.calculations.issues.map((i: string, idx: number) => (
                      <li key={idx} className="text-red-600 text-sm flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-[#D97706]">
                <h4 className="font-bold text-lg mb-4 text-black font-syne flex items-center gap-2">
                  <span className="text-xl">🧠</span> AI Mentor Insight
                </h4>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line font-sans">
                  {result.ai_insights}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Activity className="text-gray-400" size={32} />
              </div>
              <h3 className="font-bold text-gray-400 mb-2 font-syne">No Data Yet</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Fill in your details to see your financial health report.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
