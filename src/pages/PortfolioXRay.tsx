import React, { useState } from 'react';
import { Upload, FileText, PieChart as PieChartIcon, AlertCircle, CheckCircle2, TrendingUp, Layers, Zap, Loader2, ShieldCheck, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '../lib/utils';
import { useLanguage } from '../App';
import { analyzePortfolio } from '../services/gemini';

export default function PortfolioXRay() {
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      alert('Please upload a valid PDF or Image file.');
      return;
    }
    setFile(uploadedFile);
    await performAnalysis(uploadedFile);
  };

  const performAnalysis = async (fileToAnalyze: File) => {
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
      reader.readAsDataURL(fileToAnalyze);
      const base64Data = await base64Promise;

      const analysisResult = await analyzePortfolio(base64Data, fileToAnalyze.type, language);
      setResult(analysisResult);
    } catch (err: any) {
      console.error('Portfolio Analysis Error:', err);
      alert(err.message || 'Failed to analyze your portfolio. Please ensure it is a clear CAS statement (PDF or Image).');
    } finally {
      setAnalyzing(false);
    }
  };

  const t = {
    English: {
      title: 'MF Portfolio X-Ray',
      subtitle: 'Upload your CAMS/KFintech CAS statement for a 10-second deep dive.',
      upload: 'Upload CAS Statement (PDF/Image)',
      analyzing: 'Analyzing your portfolio...',
      resultTitle: 'Portfolio Reconstruction',
      xirr: 'True XIRR',
      overlap: 'Portfolio Overlap',
      expense: 'Expense Ratio Drag',
      benchmark: 'vs Benchmark',
      rebalance: 'Rebalancing Plan',
      insights: 'AI Insights'
    },
    Hindi: {
      title: 'MF पोर्टफोलियो एक्स-रे',
      subtitle: '10 सेकंड में अपने पोर्टफोलियो का गहरा विश्लेषण पाने के लिए CAMS/KFintech स्टेटमेंट अपलोड करें।',
      upload: 'CAS स्टेटमेंट अपलोड करें (PDF/Image)',
      analyzing: 'आपके पोर्टफोलियो का विश्लेषण हो रहा है...',
      resultTitle: 'पोर्टफोलियो पुनर्गठन',
      xirr: 'सच्चा XIRR',
      overlap: 'पोर्टफोलियो ओवरलैप',
      expense: 'एक्सपेंस रेशियो ड्रैग',
      benchmark: 'बनाम बेंचमार्क',
      rebalance: 'रीबैलेंसिंग प्लान',
      insights: 'AI अंतर्दृष्टि'
    },
    Hinglish: {
      title: 'MF Portfolio X-Ray',
      subtitle: 'Apne portfolio ka deep dive analysis paane ke liye CAMS/KFintech statement upload karein.',
      upload: 'CAS Statement Upload Karein (PDF/Image)',
      analyzing: 'Aapke portfolio ka analysis ho raha hai...',
      resultTitle: 'Portfolio Reconstruction',
      xirr: 'True XIRR',
      overlap: 'Portfolio Overlap',
      expense: 'Expense Ratio Drag',
      benchmark: 'vs Benchmark',
      rebalance: 'Rebalancing Plan',
      insights: 'AI Insights'
    }
  }[language as 'English' | 'Hindi' | 'Hinglish'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-syne mb-2">{t.title}</h1>
        <p className="text-gray-500 font-sans">{t.subtitle}</p>
      </div>

      {!result && !analyzing && (
        <div className="space-y-6">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-[#D97706] transition-colors cursor-pointer relative group"
          >
            <input 
              type="file" 
              accept=".pdf,image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-[#D97706]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2 font-syne">{file ? file.name : t.upload}</h3>
              <p className="text-sm text-gray-400 font-sans">Supports CAMS, KFintech, or Karvy CAS statements (PDF/Image).</p>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                <ShieldCheck size={14} /> 100% Secure & Private
              </div>
            </div>
          </motion.div>

          {file && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => performAnalysis(file)}
              className="w-full bg-[#D97706] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#D97706]/20 hover:bg-[#B45309] transition-all flex items-center justify-center gap-2"
            >
              <Zap size={20} /> Analyze Portfolio Now
            </motion.button>
          )}
        </div>
      )}

      {analyzing && (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-t-[#D97706] border-gray-100 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="text-[#D97706] animate-pulse" size={32} />
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 font-syne">{t.analyzing}</h3>
          <div className="max-w-xs mx-auto space-y-2">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 3 }}
                className="h-full bg-[#D97706]"
              />
            </div>
            <p className="text-xs text-gray-400 font-sans">Extracting folios, calculating XIRR, and checking overlap...</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t.xirr, value: result.xirr, icon: <TrendingUp className="text-green-500" size={20} /> },
                { label: t.overlap, value: result.overlap, icon: <Layers className="text-orange-500" size={20} /> },
                { label: t.expense, value: result.expenseRatio, icon: <AlertCircle className="text-red-500" size={20} /> },
                { label: t.benchmark, value: result.benchmarkDiff, icon: <CheckCircle2 className="text-blue-500" size={20} /> }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {stat.icon}
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold font-syne">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 font-syne flex items-center gap-2">
                  <PieChartIcon size={20} className="text-[#D97706]" /> {t.resultTitle}
                </h3>
                
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.holdings.map((h: any) => ({
                          name: h.name,
                          value: parseFloat(h.weight.replace('%', '')) || 0
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {result.holdings.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={[
                            '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'
                          ][index % 6]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {result.holdings.map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-bold text-sm">{h.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold">{h.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#D97706]">{h.weight}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-4 font-syne flex items-center gap-2">
                  <Zap size={20} className="text-yellow-500" /> {t.insights}
                </h3>
                <div className="space-y-3">
                  {result.insights.map((insight: string, i: number) => (
                    <div key={i} className="flex gap-3 p-3 border border-yellow-100 bg-yellow-50/30 rounded-xl text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                      {insight}
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                  {t.rebalance}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
