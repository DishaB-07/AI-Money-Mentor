import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, googleProvider } from './lib/firebase';
import { Activity, Target, Calculator, MessageSquare, LogOut, Home, Menu, X, Heart, Globe, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import HealthScore from './pages/HealthScore';
import FirePlanner from './pages/FirePlanner';
import TaxWizard from './pages/TaxWizard';
import ChatMentor from './pages/ChatMentor';
import CouplePlanner from './pages/CouplePlanner';
import PortfolioXRay from './pages/PortfolioXRay';
import LifeEvents from './pages/LifeEvents';
import { cn } from './lib/utils';

// Context for Language
const LanguageContext = createContext({ language: 'English', setLanguage: (lang: string) => {} });

const ProtectedRoute = ({ children, user, loading }: { children: React.ReactNode, user: User | null, loading: boolean }) => {
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const Login = ({ user }: { user: User | null }) => {
  if (user) return <Navigate to="/" />;
  
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="text-center animate-fade-up max-w-md px-6">
        <h1 className="text-5xl font-bold mb-4 text-gray-900 font-syne">Dhan<span className="text-[#D97706]">Setu</span></h1>
        <p className="text-gray-500 mb-8 font-sans text-lg">Financial Planning for the 95% of India.</p>
        <button 
          onClick={handleLogin} 
          className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3 w-full"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

const Layout = ({ user }: { user: User | null }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useContext(LanguageContext);
  const location = useLocation();

  const t = {
    English: {
      nav: {
        dashboard: 'Dashboard',
        score: 'Health Score',
        fire: 'FIRE Planner',
        tax: 'Tax Wizard',
        couple: 'Couple Planner',
        xray: 'Portfolio X-Ray',
        events: 'Life Events',
        chat: 'AI Mentor'
      },
      language: 'Language',
      logout: 'Logout',
      footer: {
        madeFor: 'Made for ET Hackathon',
        disclaimer: 'This is not SEBI-registered financial advice. For educational purposes only.',
        developedBy: 'Developed by Team DhanSetu : SJ AI 😎🔥'
      }
    },
    Hindi: {
      nav: {
        dashboard: 'डैशबोर्ड',
        score: 'हेल्थ स्कोर',
        fire: 'FIRE प्लानर',
        tax: 'टैक्स विजार्ड',
        couple: 'कपल प्लानर',
        xray: 'पोर्टफोलियो एक्स-रे',
        events: 'लाइफ इवेंट्स',
        chat: 'AI मेंटर'
      },
      language: 'भाषा',
      logout: 'लॉगआउट',
      footer: {
        madeFor: 'ET हैकाथॉन के लिए बनाया गया',
        disclaimer: 'यह SEBI-पंजीकृत वित्तीय सलाह नहीं है। केवल शैक्षिक उद्देश्यों के लिए।',
        developedBy: 'टीम धनसेतु द्वारा विकसित: SJ AI 😎🔥'
      }
    },
    Hinglish: {
      nav: {
        dashboard: 'Dashboard',
        score: 'Health Score',
        fire: 'FIRE Planner',
        tax: 'Tax Wizard',
        couple: 'Couple Planner',
        xray: 'Portfolio X-Ray',
        events: 'Life Events',
        chat: 'AI Mentor'
      },
      language: 'Language',
      logout: 'Logout',
      footer: {
        madeFor: 'Made for ET Hackathon',
        disclaimer: 'Ye SEBI-registered financial advice nahi hai. Sirf educational purposes ke liye.',
        developedBy: 'Developed by Team DhanSetu : SJ AI 😎🔥'
      }
    }
  }[language as 'English' | 'Hindi' | 'Hinglish'];

  const navs = [
    { name: t.nav.dashboard, path: '/', icon: <Home size={20} /> },
    { name: t.nav.score, path: '/score', icon: <Activity size={20} /> },
    { name: t.nav.fire, path: '/fire', icon: <Target size={20} /> },
    { name: t.nav.tax, path: '/tax', icon: <Calculator size={20} /> },
    { name: t.nav.couple, path: '/couple', icon: <Heart size={20} /> },
    { name: t.nav.xray, path: '/xray', icon: <TrendingUp size={20} /> },
    { name: t.nav.events, path: '/events', icon: <Sparkles size={20} /> },
    { name: t.nav.chat, path: '/chat', icon: <MessageSquare size={20} /> }
  ];

  const handleLogout = () => signOut(auth);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-[#F9FAFB] border-r border-gray-100 flex flex-col p-6 hidden md:flex overflow-y-auto scrollbar-hide">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-900 font-syne">Dhan<span className="text-[#D97706]">Setu</span></h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navs.map((n) => (
            <motion.div
              key={n.path}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to={n.path}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-xl transition-all font-semibold",
                  location.pathname === n.path 
                    ? "bg-white text-[#D97706] shadow-sm border border-gray-100" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {n.icon}
                <span>{n.name}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <Globe size={14} /> {t.language}
          </div>
          <div className="flex flex-col gap-1">
            {['English', 'Hindi', 'Hinglish'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "text-left px-3 py-1.5 rounded-lg text-sm transition-all",
                  language === lang ? "bg-[#D97706] text-white font-bold" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-3 mb-4">
            <img src={user?.photoURL || 'https://picsum.photos/seed/user/40/40'} alt="User" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
            <span className="text-sm font-semibold truncate text-gray-700">{user?.displayName || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-500 hover:text-red-500 w-full p-2 transition-colors">
            <LogOut size={18} /> <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-100"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-40 w-64 bg-[#F9FAFB] border-r border-gray-100 flex flex-col p-6 md:hidden shadow-2xl overflow-y-auto scrollbar-hide"
          >
            <div className="mb-10">
              <h1 className="text-2xl font-bold text-gray-900 font-syne">Dhan<span className="text-[#D97706]">Setu</span></h1>
            </div>
            <nav className="flex-1 space-y-2">
              {navs.map((n) => (
                <Link 
                  key={n.path} 
                  to={n.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-xl transition-all font-semibold",
                    location.pathname === n.path 
                      ? "bg-white text-[#D97706] shadow-sm border border-gray-100" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {n.icon}
                  <span>{n.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Language Selector */}
            <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <Globe size={14} /> {t.language}
              </div>
              <div className="flex gap-2">
                {['English', 'Hindi', 'Hinglish'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setIsMobileMenuOpen(false); }}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[10px] transition-all",
                      language === lang ? "bg-[#D97706] text-white font-bold" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <img src={user?.photoURL || 'https://picsum.photos/seed/user/40/40'} alt="User" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                <span className="text-sm font-semibold truncate text-gray-700">{user?.displayName || 'User'}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-500 hover:text-red-500 w-full p-2">
                <LogOut size={18} /> <span>{t.logout}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
        <footer className="bg-[#F9FAFB]/90 backdrop-blur text-center pl-[7px] pr-[17px] pt-[7px] ml-0 mr-[-2px] h-[30.8px] flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 shrink-0">
          <p>{t.footer.madeFor}</p>
          <p className="hidden md:block">{t.footer.disclaimer}</p>
          <p>{t.footer.developedBy}</p>
        </footer>
      </main>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, errorInfo: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorDetails = "An unexpected error occurred.";
      try {
        if (this.state.errorInfo?.componentStack) {
          const jsonMatch = this.state.errorInfo.componentStack.match(/\{.*\}/);
          if (jsonMatch) {
            const errorObj = JSON.parse(jsonMatch[0]);
            errorDetails = `Firestore Error: ${errorObj.operationType} at ${errorObj.path || 'unknown path'}. ${errorObj.error}`;
          }
        }
      } catch (e) {}

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-syne">Something went wrong</h2>
            <p className="text-gray-600 mb-8 font-sans">{errorDetails}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Ensure user profile exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error ensuring user profile:", error);
        }
      }
    });
    return unsubscribe;
  }, []);

  return (
    <ErrorBoundary>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login user={user} />} />
            <Route path="/" element={<ProtectedRoute user={user} loading={loading}><Layout user={user} /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="score" element={<HealthScore />} />
              <Route path="fire" element={<FirePlanner />} />
              <Route path="tax" element={<TaxWizard />} />
              <Route path="couple" element={<CouplePlanner />} />
              <Route path="xray" element={<PortfolioXRay />} />
              <Route path="events" element={<LifeEvents />} />
              <Route path="chat" element={<ChatMentor />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageContext.Provider>
    </ErrorBoundary>
  );
}

export const useLanguage = () => useContext(LanguageContext);
