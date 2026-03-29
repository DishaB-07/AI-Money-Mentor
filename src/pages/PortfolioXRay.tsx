import React, { useState } from 'react';
import { Upload, FileText, PieChart as PieChartIcon, AlertCircle, CheckCircle2, TrendingUp, Layers, Zap, Loader2, ShieldCheck, FileUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '../lib/utils';
import { useLanguage } from '../App';
import { analyzePortfolio } from '../services/gemini';
import { saveHistory } from '../services/history';

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

      // Save to history
      await saveHistory({
        type: 'xray',
        data: { fileName: fileToAnalyze.name, fileSize: fileToAnalyze.size },
        insight: analysisResult.ai_insights,
        title: `Portfolio X-Ray: ${fileToAnalyze.name}`
      });
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
      uploadSubtitle: 'Supports CAMS, KFintech, or Karvy CAS statements (PDF/Image).',
      secure: '100% Secure & Private',
      analyzeBtn: 'Analyze Portfolio Now',
      analyzing: 'Analyzing your portfolio...',
      extracting: 'Extracting folios, calculating XIRR, and checking overlap...',
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
      uploadSubtitle: 'CAMS, KFintech, या Karvy CAS स्टेटमेंट (PDF/Image) का समर्थन करता है।',
      secure: '100% सुरक्षित और निजी',
      analyzeBtn: 'अभी पोर्टफोलियो का विश्लेषण करें',
      analyzing: 'आपके पोर्टफोलियो का विश्लेषण हो रहा है...',
      extracting: 'फोलियो निकालना, XIRR की गणना करना, और ओवरलैप की जांच करना...',
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
      uploadSubtitle: 'Supports CAMS, KFintech, or Karvy CAS statements (PDF/Image).',
      secure: '100% Secure & Private',
      analyzeBtn: 'Analyze Portfolio Now',
      analyzing: 'Aapke portfolio ka analysis ho raha hai...',
      extracting: 'Folios extract ho rahe hain, XIRR calculate ho raha hai...',
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
      className="max-w-5xl mx-auto pb-20 px-4 lg:px-0"
    >
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-syne mb-3 tracking-tight">{t.title}</h1>
        <p className="text-gray-500 font-sans text-lg">{t.subtitle}</p>
      </div>

      {!result && !analyzing && (
        <div className="space-y-8">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center hover:border-[#D97706] transition-all cursor-pointer relative group shadow-sm hover:shadow-md"
          >
            <input 
              type="file" 
              accept=".pdf,image/*" 
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <FileUp className="text-[#D97706]" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-syne">{file ? file.name : t.upload}</h3>
              <p className="text-sm text-gray-400 font-sans max-w-sm mx-auto leading-relaxed">{t.uploadSubtitle}</p>
              <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
                <ShieldCheck size={16} /> {t.secure}
              </div>
            </div>
          </motion.div>

          {file && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => performAnalysis(file)}
              className="w-full bg-[#D97706] text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#D97706]/20 hover:bg-[#B45309] transition-all flex items-center justify-center gap-3"
            >
              <Zap size={24} /> {t.analyzeBtn}
            </motion.button>
          )}
        </div>
      )}

      {analyzing && (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100 shadow-xl">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-t-[#D97706] border-gray-100 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="text-[#D97706] animate-pulse" size={48} />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-4 font-syne">{t.analyzing}</h3>
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 5 }}
                className="h-full bg-[#D97706]"
              />
            </div>
            <p className="text-sm text-gray-400 font-sans leading-relaxed">{t.extracting}</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: t.xirr, value: result.xirr, icon: <TrendingUp className="text-emerald-500" size={24} />, color: 'text-emerald-500' },
                { label: t.overlap, value: result.overlap, icon: <Layers className="text-orange-500" size={24} />, color: 'text-orange-500' },
                { label: t.expense, value: result.expenseRatio, icon: <AlertCircle className="text-rose-500" size={24} />, color: 'text-rose-500' },
                { label: t.benchmark, value: result.benchmarkDiff, icon: <CheckCircle2 className="text-blue-500" size={24} />, color: 'text-blue-500' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gray-50">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.15em]">{stat.label}</span>
                  </div>
                  <div className={cn("text-3xl font-bold font-syne", stat.color)}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-6 font-syne flex items-center gap-3">
                  <PieChartIcon size={24} className="text-[#D97706]" /> {t.resultTitle}
                </h3>
                
                <div className="h-72 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={result.holdings.map((h: any) => ({
                          name: h.name,
                          value: parseFloat(h.weight.replace('%', '')) || 0
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {result.holdings.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={[
                            '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'
                          ][index % 6]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {result.holdings.map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-colors hover:bg-gray-50">
                      <div>
                        <div className="font-bold text-sm text-gray-900">{h.name}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">{h.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#D97706] text-lg">{h.weight}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-xl font-bold mb-6 font-syne flex items-center gap-3">
                  <Sparkles size={24} className="text-amber-500" /> {t.insights}
                </h3>
                <div className="space-y-4 flex-1">
                  {result.insights.map((insight: string, i: number) => (
                    <div key={i} className="flex gap-4 p-5 border border-amber-100 bg-amber-50/30 rounded-2xl text-sm text-gray-700 leading-relaxed">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-sm shadow-amber-500/50" />
                      {insight}
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
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
