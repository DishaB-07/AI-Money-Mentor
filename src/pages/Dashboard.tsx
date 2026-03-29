import { Link } from 'react-router-dom';
import { ShieldCheck, Wallet, TrendingUp, Heart, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../App';

export default function Dashboard() {
  const { language } = useLanguage();

  const t = {
    English: {
      title: 'Financial Planning for the 95%',
      subtitle: 'AI-powered, structured financial planning that usually costs ₹25,000/year—now free for you.',
      live: 'Live: 131+ Indians building wealth today',
      score: 'Get Health Score',
      mentor: 'Talk to AI Mentor',
      history: 'View History',
      features: [
        { icon: <ShieldCheck className="text-[#D97706] mb-4" size={32} />, title: 'Money Health Score', desc: 'Find gaps in your emergency funds and insurance coverage instantly.', color: 'border-t-[#D97706]', path: '/score' },
        { icon: <TrendingUp className="text-[#059669] mb-4" size={32} />, title: 'FIRE Roadmap', desc: 'Calculate exactly how much SIP you need to retire early and live free.', color: 'border-t-[#059669]', path: '/fire' },
        { icon: <Wallet className="text-blue-500 mb-4" size={32} />, title: 'Tax Optimizer', desc: 'Old vs New regime calculator with smart deduction suggestions.', color: 'border-t-blue-500', path: '/tax' },
        { icon: <Heart className="text-pink-500 mb-4" size={32} />, title: 'Couple Planner', desc: 'India\'s first joint financial planning tool for partners.', color: 'border-t-pink-500', path: '/couple' },
        { icon: <Zap className="text-yellow-500 mb-4" size={32} />, title: 'Portfolio X-Ray', desc: 'Upload CAS statement to find overlap and expense ratio drag.', color: 'border-t-yellow-500', path: '/xray' },
        { icon: <Sparkles className="text-purple-500 mb-4" size={32} />, title: 'Life Events', desc: 'AI advisor for marriage, new baby, bonus, or inheritance.', color: 'border-t-purple-500', path: '/events' }
      ]
    },
    Hindi: {
      title: '95% भारतीयों के लिए वित्तीय योजना',
      subtitle: 'AI-संचालित, संरचित वित्तीय योजना जो आमतौर पर ₹25,000/वर्ष की होती है—अब आपके लिए मुफ्त।',
      live: 'लाइव: 131+ भारतीय आज अपनी संपत्ति बना रहे हैं',
      score: 'हेल्थ स्कोर प्राप्त करें',
      mentor: 'AI मेंटर से बात करें',
      history: 'इतिहास देखें',
      features: [
        { icon: <ShieldCheck className="text-[#D97706] mb-4" size={32} />, title: 'मनी हेल्थ स्कोर', desc: 'आपातकालीन फंड और बीमा कवरेज में कमियों का तुरंत पता लगाएं।', color: 'border-t-[#D97706]', path: '/score' },
        { icon: <TrendingUp className="text-[#059669] mb-4" size={32} />, title: 'FIRE रोडमैप', desc: 'सटीक गणना करें कि आपको जल्दी रिटायर होने के लिए कितने SIP की आवश्यकता है।', color: 'border-t-[#059669]', path: '/fire' },
        { icon: <Wallet className="text-blue-500 mb-4" size={32} />, title: 'टैक्स ऑप्टिमाइज़र', desc: 'स्मार्ट कटौती सुझावों के साथ पुरानी बनाम नई व्यवस्था कैलकुलेटर।', color: 'border-t-blue-500', path: '/tax' },
        { icon: <Heart className="text-pink-500 mb-4" size={32} />, title: 'कपल प्लानर', desc: 'पार्टनर्स के लिए भारत का पहला संयुक्त वित्तीय नियोजन उपकरण।', color: 'border-t-pink-500', path: '/couple' },
        { icon: <Zap className="text-yellow-500 mb-4" size={32} />, title: 'पोर्टफोलियो एक्स-रे', desc: 'ओवरलैप और एक्सपेंस रेशियो ड्रैग खोजने के लिए CAS स्टेटमेंट अपलोड करें।', color: 'border-t-yellow-500', path: '/xray' },
        { icon: <Sparkles className="text-purple-500 mb-4" size={32} />, title: 'लाइफ इवेंट्स', desc: 'शादी, नए बच्चे, बोनस या विरासत के लिए AI सलाहकार।', color: 'border-t-purple-500', path: '/events' }
      ]
    },
    Hinglish: {
      title: 'Financial Planning for the 95%',
      subtitle: 'AI-powered financial planning jo usually ₹25,000/year cost karti hai—ab aapke liye free.',
      live: 'Live: 131+ Indians building wealth today',
      score: 'Get Health Score',
      mentor: 'Talk to AI Mentor',
      history: 'View History',
      features: [
        { icon: <ShieldCheck className="text-[#D97706] mb-4" size={32} />, title: 'Money Health Score', desc: 'Emergency funds aur insurance coverage mein gaps find karein instantly.', color: 'border-t-[#D97706]', path: '/score' },
        { icon: <TrendingUp className="text-[#059669] mb-4" size={32} />, title: 'FIRE Roadmap', desc: 'Calculate karein kitna SIP chahiye early retirement ke liye.', color: 'border-t-[#059669]', path: '/fire' },
        { icon: <Wallet className="text-blue-500 mb-4" size={32} />, title: 'Tax Optimizer', desc: 'Old vs New regime calculator with smart deduction suggestions.', color: 'border-t-blue-500', path: '/tax' },
        { icon: <Heart className="text-pink-500 mb-4" size={32} />, title: 'Couple Planner', desc: 'Partners ke liye India ka pehla joint financial planning tool.', color: 'border-t-pink-500', path: '/couple' },
        { icon: <Zap className="text-yellow-500 mb-4" size={32} />, title: 'Portfolio X-Ray', desc: 'CAS statement upload karein overlap aur expense ratio check karne ke liye.', color: 'border-t-yellow-500', path: '/xray' },
        { icon: <Sparkles className="text-purple-500 mb-4" size={32} />, title: 'Life Events', desc: 'Marriage, baby, bonus, ya inheritance ke liye AI advisor.', color: 'border-t-purple-500', path: '/events' }
      ]
    }
  }[language as 'English' | 'Hindi' | 'Hinglish'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="bg-gradient-to-r from-[#D97706] to-[#059669] rounded-3xl p-8 md:p-12 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block">
            🔴 {t.live}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 font-syne leading-tight whitespace-pre-line">{t.title.replace('for', '\nfor')}</h1>
          <p className="text-lg opacity-90 max-w-md mb-8 font-sans">{t.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/score" className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform text-center">{t.score}</Link>
            <Link to="/chat" className="bg-black/20 text-white px-8 py-3 rounded-full font-bold hover:bg-black/30 transition-all text-center backdrop-blur-sm">{t.mentor}</Link>
            <Link to="/history" className="bg-white/10 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all text-center backdrop-blur-sm border border-white/20">{t.history}</Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {t.features.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={cn(
              "bg-[#F9FAFB] rounded-2xl p-6 border border-gray-100 shadow-sm border-t-4 cursor-pointer transition-shadow hover:shadow-xl",
              item.color
            )}
          >
            <Link to={item.path}>
              {item.icon}
              <h3 className="text-xl font-bold mb-2 font-syne">{item.title}</h3>
              <p className="text-gray-500 text-sm font-sans">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 font-syne">Why DhanSetu?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold mb-2 text-[#D97706]">No Jargon</h4>
            <p className="text-sm text-gray-600">We speak the language of common Indians. No complex financial terms that confuse you.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-[#059669]">AI-Powered Insights</h4>
            <p className="text-sm text-gray-600">Get personalized advice from our Gemini-powered AI mentor trained on Indian financial laws.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-blue-500">Completely Free</h4>
            <p className="text-sm text-gray-600">Quality financial planning shouldn't be a luxury. We're building for the 95%.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-purple-500">Secure & Private</h4>
            <p className="text-sm text-gray-600">Your data is yours. We use Firebase to ensure your information is securely stored and accessible only to you.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
