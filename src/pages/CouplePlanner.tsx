import { useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Heart, Users, TrendingUp, ShieldCheck, Sparkles, Plus, Trash2, Target, FileUp, CheckCircle2, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getFinancialInsight, extractFinancialData } from '../services/gemini';
import { useLanguage } from '../App';

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

export default function CouplePlanner() {
  const { language } = useLanguage();
  const [partner1, setPartner1] = useState({ income: 1200000, sec80c: 150000, sec80d: 25000, hraExemption: 100000, savings: 500000, debt: 100000 });
  const [partner2, setPartner2] = useState({ income: 800000, sec80c: 100000, sec80d: 25000, hraExemption: 50000, savings: 300000, debt: 50000 });
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'House Downpayment', target: 2000000, current: 800000, deadline: '2028-12' },
    { id: '2', title: "Child's Education", target: 5000000, current: 0, deadline: '2040-01' }
  ]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [processingFile, setProcessingFile] = useState<number | null>(null);

  const addGoal = () => {
    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Goal',
      target: 1000000,
      current: 0,
      deadline: new Date().toISOString().split('T')[0].slice(0, 7)
    };
    setGoals([...goals, newGoal]);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const handleFileUpload = async (partnerNum: number, file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid PDF or Image file.');
      return;
    }

    setProcessingFile(partnerNum);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          if (!reader.result) {
            reject('Failed to read file');
            return;
          }
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = () => reject('File reading error');
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const extractedData = await extractFinancialData(base64Data, file.type);
      
      let updatedPartner1 = partner1;
      let updatedPartner2 = partner2;

      if (partnerNum === 1) {
        updatedPartner1 = { ...partner1, ...extractedData };
        setPartner1(updatedPartner1);
      } else {
        updatedPartner2 = { ...partner2, ...extractedData };
        setPartner2(updatedPartner2);
      }

      // Automatically trigger joint optimization after extraction
      await performCalculation(updatedPartner1, updatedPartner2, goals);
    } catch (err: any) {
      console.error('Error analyzing file:', err);
      alert(err.message || 'Could not analyze the document. Please ensure it is a clear image or PDF.');
    } finally {
      setProcessingFile(null);
    }
  };

  const calculate = () => performCalculation(partner1, partner2, goals);

  const performCalculation = async (p1: typeof partner1, p2: typeof partner2, currentGoals: Goal[]) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/couple-planner`, { partner1: p1, partner2: p2 });
      const calculations = res.data.calculations;
      
      const goalContext = currentGoals.map(g => `${g.title}: Target ₹${g.target}, Current ₹${g.current}, Deadline ${g.deadline}`).join('\n');
      const customPrompt = `Analyze our joint finances in the context of these goals:\n${goalContext}\n\nCalculations: ${JSON.stringify(calculations)}`;
      
      const aiInsights = await getFinancialInsight("Couple's Joint Financial Optimization & Goal Planning", customPrompt, language);
      
      const finalResult = { calculations, ai_insights: aiInsights };
      setResult(finalResult);
      
      if (auth.currentUser) {
        await addDoc(collection(db, `users/${auth.currentUser.uid}/history`), {
          uid: auth.currentUser.uid,
          type: 'couple',
          input: { partner1: p1, partner2: p2, goals: currentGoals },
          output: calculations,
          aiInsights: aiInsights,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) { 
      console.error('Error calculating couple plan:', err);
      alert('Error calculating joint plan. Please try again.'); 
    }
    setLoading(false);
  };

  const DropZone = ({ partnerNum }: { partnerNum: number }) => (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(partnerNum); }}
      onDragLeave={() => setIsDragging(null)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(null);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(partnerNum, file);
      }}
      className={`relative mt-4 border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer
        ${isDragging === partnerNum ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-gray-300 bg-white'}
        ${processingFile === partnerNum ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input 
        type="file" 
        className="absolute inset-0 opacity-0 cursor-pointer" 
        disabled={processingFile !== null}
        accept=".pdf,image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(partnerNum, file);
        }}
      />
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
        {processingFile === partnerNum ? (
          <Loader2 className="text-blue-500 animate-spin" size={20} />
        ) : (
          <FileUp className={isDragging === partnerNum ? 'text-blue-500' : 'text-gray-400'} size={20} />
        )}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold text-gray-500 uppercase">
          {processingFile === partnerNum ? 'Analyzing Document...' : 'Drop Statement / Image'}
        </p>
        <p className="text-[9px] text-gray-400 mt-0.5">
          {processingFile === partnerNum ? 'Extracting financial data...' : 'AI will extract your data automatically'}
        </p>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-20"
    >
      <div className="flex items-center gap-3 mb-2">
        <Heart className="text-red-500" fill="currentColor" />
        <h1 className="text-3xl font-bold font-syne">Couple's Money Planner</h1>
      </div>
      <p className="text-gray-500 mb-8 font-sans">India's first AI-powered joint financial planning tool. Optimize across both incomes and achieve joint goals.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Partner 1 */}
        <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 font-syne flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Partner 1
          </h3>
          <div className="space-y-4 flex-1">
            {Object.keys(partner1).map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</label>
                <motion.input 
                  whileFocus={{ scale: 1.01, borderColor: '#3b82f6' }}
                  type="number" 
                  className="w-full border-gray-200 border p-2 rounded-xl bg-white outline-none focus:border-blue-500 transition-all text-sm"
                  value={partner1[key as keyof typeof partner1]} 
                  onChange={(e) => setPartner1({...partner1, [key]: Number(e.target.value)})} 
                />
              </div>
            ))}
          </div>
          <DropZone partnerNum={1} />
        </div>

        {/* Partner 2 */}
        <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 font-syne flex items-center gap-2">
            <Users size={20} className="text-pink-500" /> Partner 2
          </h3>
          <div className="space-y-4 flex-1">
            {Object.keys(partner2).map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</label>
                <motion.input 
                  whileFocus={{ scale: 1.01, borderColor: '#ec4899' }}
                  type="number" 
                  className="w-full border-gray-200 border p-2 rounded-xl bg-white outline-none focus:border-pink-500 transition-all text-sm"
                  value={partner2[key as keyof typeof partner2]} 
                  onChange={(e) => setPartner2({...partner2, [key]: Number(e.target.value)})} 
                />
              </div>
            ))}
          </div>
          <DropZone partnerNum={2} />
        </div>

        {/* Joint Goals & Results */}
        <div className="space-y-6">
          {/* Joint Goals Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg font-syne flex items-center gap-2">
                <Target size={20} className="text-orange-500" /> Joint Goals
              </h3>
              <button 
                onClick={addGoal}
                className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {goals.map((goal) => (
                  <motion.div 
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group"
                  >
                    <button 
                      onClick={() => removeGoal(goal.id)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <input 
                      className="bg-transparent font-bold text-sm w-full outline-none mb-2"
                      value={goal.title}
                      onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
                    />
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Target (₹)</label>
                        <input 
                          type="number"
                          className="bg-transparent text-xs w-full outline-none border-b border-gray-200 focus:border-orange-500"
                          value={goal.target}
                          onChange={(e) => updateGoal(goal.id, { target: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Current (₹)</label>
                        <input 
                          type="number"
                          className="bg-transparent text-xs w-full outline-none border-b border-gray-200 focus:border-orange-500"
                          value={goal.current}
                          onChange={(e) => updateGoal(goal.id, { current: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                        className="h-full bg-orange-500"
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] text-gray-400">{Math.round((goal.current / goal.target) * 100)}% Complete</span>
                      <span className="text-[9px] text-gray-400">Due: {goal.deadline}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? 'Optimizing Joint Wealth...' : 'Optimize Jointly'}
          </motion.button>

          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 font-syne flex items-center gap-2">
                  <BarChart3 size={24} className="text-pink-500" /> Joint Financial Overview
                </h3>
                
                <div className="h-80 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Income', p1: partner1.income, p2: partner2.income },
                        { name: 'Savings', p1: partner1.savings, p2: partner2.savings },
                        { name: 'Debt', p1: partner1.debt, p2: partner2.debt }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar dataKey="p1" name="Partner 1" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="p2" name="Partner 2" fill="#ec4899" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Combined Net Worth</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black font-syne">₹{result.calculations.combined.netWorth.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Joint Savings</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black font-syne">₹{result.calculations.combined.savings.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-1">Joint Debt</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black font-syne text-red-500">₹{result.calculations.combined.debt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-100 border-l-4 border-l-purple-600">
                  <h4 className="font-bold text-lg mb-4 text-black font-syne flex items-center gap-2">
                    <Sparkles className="text-purple-600" size={20} /> Joint Optimization
                  </h4>
                  <div className="text-sm text-gray-600 leading-relaxed font-sans prose prose-sm max-w-none prose-orange">
                    <ReactMarkdown>{result.ai_insights}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="text-gray-400" size={32} />
              </div>
              <h3 className="font-bold text-gray-400 mb-2 font-syne">Better Together</h3>
              <p className="text-xs text-gray-400">Input both partners' data to see how you can optimize your HRA, NPS, and investments together.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
