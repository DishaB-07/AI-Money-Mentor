import { useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Calculator, Sparkles, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { getFinancialInsight, extractFinancialData } from '../services/gemini';
import { useLanguage } from '../App';

export default function TaxWizard() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({ 
    income: 1200000, 
    sec80c: 150000, 
    sec80d: 25000, 
    hraExemption: 100000 
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid PDF or Image file.');
      return;
    }

    setAnalyzing(true);
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
      
      const newFormData = {
        income: extractedData.income || formData.income,
        sec80c: extractedData.sec80c || formData.sec80c,
        sec80d: extractedData.sec80d || formData.sec80d,
        hraExemption: extractedData.hraExemption || formData.hraExemption
      };
      
      setFormData(newFormData);
      
      // Automatically calculate after extraction
      await performCalculation(newFormData);
    } catch (err: any) {
      console.error('Error analyzing Form 16:', err);
      alert(err.message || 'Could not analyze the document. Please ensure it is a clear Form 16.');
    } finally {
      setAnalyzing(false);
    }
  };

  const calculate = () => performCalculation(formData);

  const performCalculation = async (data: typeof formData) => {
    setLoading(true);
    try {
      const res = await axios.post(`/api/tax-wizard`, data);
      const calculations = res.data.calculations;
      
      const aiInsights = await getFinancialInsight("Tax Optimization", calculations, language);
      
      const finalResult = { calculations, ai_insights: aiInsights };
      setResult(finalResult);
      
      // Save to history
      if (auth.currentUser) {
        const path = `users/${auth.currentUser.uid}/history`;
        try {
          await addDoc(collection(db, path), {
            uid: auth.currentUser.uid,
            type: 'tax',
            input: data,
            output: calculations,
            aiInsights: aiInsights,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, path);
        }
      }
    } catch (err) { 
      console.error('Error calculating tax:', err);
      alert('Error calculating tax. Please try again.'); 
    }
    setLoading(false);
  };

  const chartData = result ? [
    { name: 'Old Regime', tax: result.calculations.old_regime_tax },
    { name: 'New Regime', tax: result.calculations.new_regime_tax }
  ] : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-2 font-syne">Tax Optimizer</h1>
      <p className="text-gray-500 mb-8 font-sans">Stop overpaying taxes. Let logic choose your regime.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className={cn(
            "bg-white border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative",
            analyzing ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-500"
          )}>
            <input 
              type="file" 
              accept=".pdf,image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
              disabled={analyzing}
            />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                {analyzing ? (
                  <Loader2 className="text-blue-600 animate-spin" size={20} />
                ) : (
                  <Sparkles className="text-blue-600" size={20} />
                )}
              </div>
              <h4 className="font-bold text-sm font-syne">
                {analyzing ? 'Analyzing Form 16...' : 'Upload Form 16'}
              </h4>
              <p className="text-[10px] text-gray-400 font-sans">
                {analyzing ? 'Extracting your salary structure...' : 'AI will automatically extract your salary structure.'}
              </p>
            </div>
          </div>

          <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-lg mb-6 font-syne">Manual Input (₹)</h3>
            <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Annual Gross Income</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#2563eb' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-blue-500 transition-all"
                value={formData.income} 
                onChange={(e) => setFormData({...formData, income: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Section 80C Deductions (PPF, ELSS, etc.)</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#2563eb' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-blue-500 transition-all"
                value={formData.sec80c} 
                onChange={(e) => setFormData({...formData, sec80c: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Section 80D (Health Insurance)</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#2563eb' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-blue-500 transition-all"
                value={formData.sec80d} 
                onChange={(e) => setFormData({...formData, sec80d: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">HRA Exemption</label>
              <motion.input 
                whileFocus={{ scale: 1.01, borderColor: '#2563eb' }}
                type="number" 
                className="w-full border-gray-200 border p-3 rounded-xl bg-white outline-none focus:border-blue-500 transition-all"
                value={formData.hraExemption} 
                onChange={(e) => setFormData({...formData, hraExemption: Number(e.target.value)})} 
              />
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate} 
            disabled={loading} 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-8 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {loading ? 'Optimizing Tax...' : 'Calculate Tax'}
          </motion.button>
        </div>
      </div>

      <div className="space-y-6">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold uppercase tracking-widest opacity-80">Recommended Regime</span>
                  <Sparkles size={24} />
                </div>
                <h2 className="text-4xl font-black mb-2 font-syne">{result.calculations.recommended}</h2>
                <p className="text-lg font-medium opacity-90">Potential Savings: ₹{result.calculations.savings.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-64">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Tax Comparison</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="tax" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === result.calculations.recommended ? '#2563eb' : '#94a3b8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-64">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Take-home vs Tax</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Take-home', value: formData.income - (result.calculations.recommended === 'New Regime' ? result.calculations.new_regime_tax : result.calculations.old_regime_tax) },
                          { name: 'Tax', value: result.calculations.recommended === 'New Regime' ? result.calculations.new_regime_tax : result.calculations.old_regime_tax }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#2563eb" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm border-l-4 border-l-blue-600">
                <h4 className="font-bold text-lg mb-4 text-black font-syne flex items-center gap-2">
                  <span className="text-xl">💡</span> Smart Deductions
                </h4>
                <div className="text-sm text-gray-600 leading-relaxed font-sans prose prose-sm max-w-none prose-orange">
                  <ReactMarkdown>{result.ai_insights}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calculator className="text-gray-400" size={32} />
              </div>
              <h3 className="font-bold text-gray-400 mb-2 font-syne">Optimize Your Tax</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Compare Old vs New regime and find ways to save more.</p>
              <div className="mt-6 p-4 bg-amber-50 rounded-xl text-left flex gap-3 border border-amber-100">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] text-amber-700 leading-normal">
                  Calculations are based on FY 2024-25 (AY 2025-26) tax slabs. Standard deduction of ₹50,000 is applied to both regimes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
