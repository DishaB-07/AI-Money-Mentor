import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Target, Calculator, Heart, TrendingUp, MessageSquare, Sparkles, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../App';

export default function Dashboard() {
  const { language } = useLanguage();

  const t = {
    English: {
      hero: {
        title: 'Financial Planning for the',
        subtitle: '95%',
        desc: 'AI-powered financial wisdom tailored for the Indian middle class. Secure your future with DhanSetu.',
        cta: 'Get Started'
      },
      features: {
        score: { title: 'Health Score', desc: 'Get your financial grade in 5 mins' },
        fire: { title: 'FIRE Roadmap', desc: 'Plan your early retirement' },
        tax: { title: 'Tax Wizard', desc: 'Optimize Old vs New regime' },
        couple: { title: 'Couple Planner', desc: 'Joint goals for partners' },
        xray: { title: 'Portfolio X-Ray', desc: 'Deep dive into your CAS' },
        chat: { title: 'AI Mentor', desc: 'Chat with your financial guide' }
      }
    },
    Hindi: {
      hero: {
        title: 'वित्तीय योजना',
        subtitle: '95% के लिए',
        desc: 'भारतीय मध्यम वर्ग के लिए AI-संचालित वित्तीय ज्ञान। धनसेतु के साथ अपना भविष्य सुरक्षित करें।',
        cta: 'शुरू करें'
      },
      features: {
        score: { title: 'हेल्थ स्कोर', desc: '5 मिनट में अपना वित्तीय ग्रेड प्राप्त करें' },
        fire: { title: 'FIRE रोडमैप', desc: 'अपनी जल्दी सेवानिवृत्ति की योजना बनाएं' },
        tax: { title: 'टैक्स विजार्ड', desc: 'पुराने बनाम नए शासन को अनुकूलित करें' },
        couple: { title: 'कपल प्लानर', desc: 'साझेदारों के लिए संयुक्त लक्ष्य' },
        xray: { title: 'पोर्टफोलियो एक्स-रे', desc: 'अपने CAS का गहरा विश्लेषण' },
        chat: { title: 'AI मेंटर', desc: 'अपने वित्तीय मार्गदर्शक के साथ चैट करें' }
      }
    },
    Hinglish: {
      hero: {
        title: 'Financial Planning for the',
        subtitle: '95%',
        desc: 'AI-powered financial wisdom tailored for the Indian middle class. Secure your future with DhanSetu.',
        cta: 'Get Started'
      },
      features: {
        score: { title: 'Health Score', desc: 'Get your financial grade in 5 mins' },
        fire: { title: 'FIRE Roadmap', desc: 'Plan your early retirement' },
        tax: { title: 'Tax Wizard', desc: 'Optimize Old vs New regime' },
        couple: { title: 'Couple Planner', desc: 'Joint goals for partners' },
        xray: { title: 'Portfolio X-Ray', desc: 'Deep dive into your CAS' },
        chat: { title: 'AI Mentor', desc: 'Chat with your financial guide' }
      }
    }
  }[language as 'English' | 'Hindi' | 'Hinglish'];

  const features = [
    { id: 'score', path: '/score', icon: Activity, color: 'bg-blue-50 text-blue-600', span: 'col-span-1 md:col-span-2' },
    { id: 'fire', path: '/fire', icon: Target, color: 'bg-emerald-50 text-emerald-600', span: 'col-span-1' },
    { id: 'tax', path: '/tax', icon: Calculator, color: 'bg-amber-50 text-amber-600', span: 'col-span-1' },
    { id: 'couple', path: '/couple', icon: Heart, color: 'bg-rose-50 text-rose-600', span: 'col-span-1 md:col-span-2' },
    { id: 'xray', path: '/xray', icon: TrendingUp, color: 'bg-indigo-50 text-indigo-600', span: 'col-span-1 md:col-span-2' },
    { id: 'chat', path: '/chat', icon: MessageSquare, color: 'bg-purple-50 text-purple-600', span: 'col-span-1' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gray-900 p-8 md:p-16 text-white">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#D97706] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-20" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest text-[#D97706]"
          >
            <Sparkles size={14} />
            AI-Powered Wealth Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-syne leading-[0.9] tracking-tight"
          >
            {t.hero.title} <span className="text-[#D97706] italic">{t.hero.subtitle}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 font-medium leading-relaxed"
          >
            {t.hero.desc}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <Link 
              to="/score" 
              className="px-8 py-4 bg-[#D97706] hover:bg-[#B45309] text-white rounded-2xl font-bold transition-all flex items-center gap-2 group shadow-lg shadow-[#D97706]/20"
            >
              {t.hero.cta}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img 
                  key={i}
                  src={`https://i.pravatar.cc/100?u=${i}`} 
                  alt="" 
                  className="w-12 h-12 rounded-full border-4 border-gray-900"
                />
              ))}
              <div className="w-12 h-12 rounded-full bg-gray-800 border-4 border-gray-900 flex items-center justify-center text-xs font-bold">
                +10k
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const content = t.features[feature.id as keyof typeof t.features];
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
              className={cn(
                "group relative p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden",
                feature.span
              )}
            >
              <div className={cn("inline-flex p-4 rounded-2xl mb-6 transition-transform group-hover:scale-110", feature.color)}>
                <feature.icon size={28} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-syne text-gray-900">{content.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{content.desc}</p>
              </div>
              
              <Link 
                to={feature.path} 
                className="absolute inset-0 z-10"
                aria-label={content.title}
              />
              
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center">
                  <ArrowRight size={20} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-gray-100">
        <div className="flex flex-col items-center gap-2 text-center">
          <ShieldCheck className="text-[#D97706]" size={32} />
          <p className="text-sm font-bold font-syne">Bank-Grade Security</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">AES-256 Encryption</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Zap className="text-emerald-600" size={32} />
          <p className="text-sm font-bold font-syne">Real-time Insights</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Instant Analysis</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Globe className="text-blue-600" size={32} />
          <p className="text-sm font-bold font-syne">Multi-Language</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">English, Hindi, Hinglish</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <Sparkles className="text-purple-600" size={32} />
          <p className="text-sm font-bold font-syne">AI First</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Gemini Powered</p>
        </div>
      </section>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
