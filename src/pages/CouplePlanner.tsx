import { useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import ReactMarkdown from 'react-markdown';
import { Heart, Users, TrendingUp, ShieldCheck, Sparkles, Plus, Trash2, Target, FileUp, CheckCircle2, AlertCircle, Loader2, BarChart3, Clock } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
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
        const path = `users/${auth.currentUser.uid}/history`;
        try {
          await addDoc(collection(db, path), {
            uid: auth.currentUser.uid,
            type: 'couple',
            input: { partner1: p1, partner2: p2, goals: currentGoals },
            output: calculations,
            aiInsights: aiInsights,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
    } catch (err) { 
      console.error('Error calculating couple plan:', err);
      alert('Error calculating joint plan. Please try again.'); 
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeRemaining = (deadline: string) => {
    if (!deadline) return null;
    const now = new Date();
    const target = new Date(deadline + '-01');
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: 'Past Deadline', color: 'text-red-500', bg: 'bg-red-50' };
    
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    
    let text = '';
    if (years > 0) text += `${years}y `;
    text += `${months}m left`;
    
    return { 
      text, 
      color: days < 180 ? 'text-orange-600' : 'text-green-600',
      bg: days < 180 ? 'bg-orange-50' : 'bg-green-50'
    };
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
        ${isDragging === partnerNum ? (partnerNum === 1 ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-pink-500 bg-pink-50 scale-[1.02]') : 'border-gray-200 hover:border-gray-300 bg-white'}
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
      <div className={`w-10 h-10 ${partnerNum === 1 ? 'bg-blue-50' : 'bg-pink-50'} rounded-full flex items-center justify-center`}>
        {processingFile === partnerNum ? (
          <Loader2 className={`${partnerNum === 1 ? 'text-blue-500' : 'text-pink-500'} animate-spin`} size={20} />
        ) : (
          <FileUp className={isDragging === partnerNum ? (partnerNum === 1 ? 'text-blue-500' : 'text-pink-500') : 'text-gray-400'} size={20} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Partner 1 */}
        <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-6 font-syne flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> Partner 1
          </h3>
          <div className="space-y-4 flex-1">
            {Object.entries(partner1).map(([key, value]) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                  {key === 'sec80c' ? 'Section 80C' : key === 'sec80d' ? 'Section 80D' : key.replace(/([A-Z])/g, ' $1')}
                </label>
                <motion.input 
                  whileFocus={{ scale: 1.01, borderColor: '#3b82f6' }}
                  type="number" 
                  min={0}
                  step={1000}
                  className="w-full border-gray-200 border p-2 rounded-xl bg-white outline-none focus:border-blue-500 transition-all text-sm"
                  value={value} 
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
            {Object.entries(partner2).map(([key, value]) => (
              <div key={key}>
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                  {key === 'sec80c' ? 'Section 80C' : key === 'sec80d' ? 'Section 80D' : key.replace(/([A-Z])/g, ' $1')}
                </label>
                <motion.input 
                  whileFocus={{ scale: 1.01, borderColor: '#ec4899' }}
                  type="number" 
                  min={0}
                  step={1000}
                  className="w-full border-gray-200 border p-2 rounded-xl bg-white outline-none focus:border-pink-500 transition-all text-sm"
                  value={value} 
                  onChange={(e) => setPartner2({...partner2, [key]: Number(e.target.value)})} 
                />
              </div>
            ))}
          </div>
          <DropZone partnerNum={2} />
        </div>
      </div>

      {/* Joint Goals & Results Section - Moved Below Partners */}
      <div className="space-y-8">
        {/* Joint Goals Section */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 opacity-30" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-bold text-2xl font-syne flex items-center gap-3">
                <Target size={28} className="text-orange-500" /> Joint Financial Goals
              </h3>
              <p className="text-sm text-gray-400 mt-1">Plan your future milestones together</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addGoal}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition-all"
            >
              <Plus size={18} /> Add New Goal
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <AnimatePresence mode="popLayout">
              {goals.map((goal) => {
                const timeRemaining = getTimeRemaining(goal.deadline);
                const progress = Math.round((goal.current / goal.target) * 100);
                
                return (
                  <motion.div 
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm relative group hover:border-orange-200 hover:shadow-md transition-all"
                  >
                    <button 
                      onClick={() => removeGoal(goal.id)}
                      className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-gray-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                          <Target className="text-orange-500" size={20} />
                        </div>
                        <div>
                          <input 
                            className="bg-transparent font-bold text-lg w-full outline-none focus:text-orange-600 transition-colors"
                            value={goal.title}
                            onChange={(e) => updateGoal(goal.id, { title: e.target.value })}
                            placeholder="Goal Name"
                          />
                          <div className="flex items-center gap-2 mt-0.5">
                            {timeRemaining && (
                              <div className={`flex items-center gap-1 px-2 py-0.5 ${timeRemaining.bg} ${timeRemaining.color} rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                                <Clock size={10} /> {timeRemaining.text}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Amount</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-400">₹</span>
                          <input 
                            type="number"
                            className="bg-transparent text-base font-black w-full outline-none border-b border-gray-100 focus:border-orange-500 transition-all"
                            value={goal.target}
                            onChange={(e) => updateGoal(goal.id, { target: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Current Savings</label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-gray-400">₹</span>
                          <input 
                            type="number"
                            className="bg-transparent text-base font-black w-full outline-none border-b border-gray-100 focus:border-orange-500 transition-all"
                            value={goal.current}
                            onChange={(e) => updateGoal(goal.id, { current: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Visual */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progress</span>
                        <span className="text-sm font-black text-orange-600">{progress}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, progress)}%` }}
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Deadline</span>
                        <input 
                          type="month"
                          className="text-xs font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg outline-none focus:ring-1 focus:ring-orange-500"
                          value={goal.deadline}
                          onChange={(e) => updateGoal(goal.id, { deadline: e.target.value })}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Optimize Button */}
        <div className="max-w-md mx-auto w-full">
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                <span>Optimizing Joint Wealth...</span>
              </>
            ) : (
              <>
                <Sparkles size={24} />
                <span>Optimize Jointly</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Results Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold mb-8 font-syne flex items-center gap-3">
                <BarChart3 size={28} className="text-pink-500" /> Joint Financial Overview
              </h3>
              
              <div className="h-96 mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Income', p1: partner1.income, p2: partner2.income },
                      { name: 'Savings', p1: partner1.savings, p2: partner2.savings },
                      { name: 'Debt', p1: partner1.debt, p2: partner2.debt }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6', radius: 8 }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="top" height={48} iconType="circle" />
                    <Bar dataKey="p1" name="Partner 1" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                    <Bar dataKey="p2" name="Partner 2" fill="#ec4899" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Combined Net Worth</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-syne text-blue-900">{formatCurrency(result.calculations.combined.netWorth)}</span>
                  </div>
                </div>
                <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100">
                  <h4 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-2">Joint Savings</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-syne text-green-900">{formatCurrency(result.calculations.combined.savings)}</span>
                  </div>
                </div>
                <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                  <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Joint Debt</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-syne text-red-600">{formatCurrency(result.calculations.combined.debt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 border-l-8 border-l-purple-600 shadow-sm">
                <h4 className="font-bold text-xl mb-6 text-purple-900 font-syne flex items-center gap-3">
                  <Sparkles className="text-purple-600" size={24} /> Joint Strategy & Insights
                </h4>
                <div className="text-base text-gray-700 leading-relaxed font-sans prose prose-sm md:prose-base max-w-none prose-purple">
                  <ReactMarkdown>{result.ai_insights}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!result && (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="text-gray-300" size={40} />
            </div>
            <h3 className="font-bold text-gray-500 mb-2 font-syne text-lg">Better Together</h3>
            <p className="text-sm text-gray-400 max-w-md">Input both partners' data to see how you can optimize your HRA, NPS, and investments together.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
