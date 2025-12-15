import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { generateCVs } from './services/geminiService';
import { generatePDF } from './services/pdfService';
import { saveCV, getSavedCVs, deleteCV } from './services/storageService';
import { signInWithGoogle, logoutUser, subscribeToAuthChanges } from './services/authService';
import { AppView, CVProfile, CVType, JobCriteria, CVTone } from './types';
import { User } from 'firebase/auth';

// --- DEMO USER CONSTANT ---
const DEMO_USER = {
  uid: 'demo-guest',
  displayName: 'Guest Architect',
  email: 'guest@trigenys.group',
  photoURL: null,
  emailVerified: true,
  isAnonymous: true,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
} as unknown as User;

// Icons
const Icons = {
  Sparkle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
  ),
  Save: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  ),
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
  ),
  Create: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
  ),
  Check: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Demo: () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z"/><path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M21 17v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"/><path d="M21 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"/></svg>
  )
};

const Header = ({ currentView, onViewChange, onLogout, userPhoto, isDemo }: { currentView: AppView; onViewChange: (v: AppView) => void; onLogout: () => void, userPhoto?: string, isDemo: boolean }) => (
  <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5 bg-bordeaux-950/80 backdrop-blur-xl border-b border-white/5 shadow-2xl transition-all duration-300">
    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => onViewChange(AppView.DASHBOARD)}>
      <div className="flex flex-col">
        <h1 className="font-display text-2xl font-bold tracking-widest text-gold-400 drop-shadow-sm group-hover:text-gold-300 transition-colors">METIS</h1>
        <div className="flex items-center gap-1.5 -mt-1">
          <span className="font-['Pinyon_Script'] text-xl text-gold-400 italic">by</span>
          <span className="font-serif text-[0.6rem] tracking-[0.2em] font-bold text-gray-400 uppercase mt-1">Trigenys Group</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      <nav className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
        <button 
          onClick={() => onViewChange(AppView.DASHBOARD)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${currentView === AppView.DASHBOARD ? 'bg-gold-500 text-bordeaux-950 shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)]' : 'text-gray-400 hover:text-white'}`}
        >
          GENERATOR
        </button>
        <button 
          onClick={() => onViewChange(AppView.HISTORY)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${currentView === AppView.HISTORY ? 'bg-gold-500 text-bordeaux-950 shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)]' : 'text-gray-400 hover:text-white'}`}
        >
          VAULT
        </button>
      </nav>
      <div className="flex items-center gap-4">
        {userPhoto ? (
             <img src={userPhoto} alt="User" className="w-8 h-8 rounded-full border border-gold-500/30" />
        ) : (
            <div className="w-8 h-8 rounded-full border border-gold-500/30 bg-gold-900/50 flex items-center justify-center text-[10px] text-gold-400 font-bold">
                {isDemo ? 'DE' : 'US'}
            </div>
        )}
        <button onClick={onLogout} className="text-gold-500/80 hover:text-gold-400 transition-colors text-xs uppercase tracking-widest">
          {isDemo ? 'Exit Demo' : 'Sign Out'}
        </button>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="fixed bottom-0 w-full py-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/20 pointer-events-none z-0">
    Trigenys Group © {new Date().getFullYear()} • Powered by Gemini 2.5
  </footer>
);

const Landing = ({ onEnter }: { onEnter: () => void }) => (
  <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-bordeaux-950 relative overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-bordeaux-800/30 via-bordeaux-950 to-black z-0"></div>
    
    {/* Floating Particles/Glows */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bordeaux-600/20 rounded-full blur-[100px] animate-pulse duration-[5000ms]"></div>
    
    {/* Floating particles (CSS animation handled in index.html styles ideally, here simulating with absolute divs) */}
    <div className="absolute top-10 left-10 w-2 h-2 bg-gold-400/30 rounded-full animate-float delay-0"></div>
    <div className="absolute top-1/3 right-20 w-3 h-3 bg-gold-400/20 rounded-full animate-float delay-1000"></div>
    <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-gold-400/40 rounded-full animate-float delay-2000"></div>

    <div className="space-y-12 max-w-5xl relative z-10 perspective-1000">
      <div className="space-y-6">
        <h1 className="font-display text-8xl md:text-[10rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-400 to-gold-700 drop-shadow-2xl tracking-tighter animate-fade-in-up" style={{animationDelay: '200ms'}}>
          METIS
        </h1>
        <div className="flex items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: '600ms'}}>
          <span className="font-['Pinyon_Script'] text-4xl text-gold-400 italic mt-2 drop-shadow-md">by</span>
          <span className="font-serif text-lg tracking-[0.4em] font-bold text-gray-300 uppercase bg-gradient-to-r from-gray-200 to-gray-500 bg-clip-text text-transparent">Trigenys Group</span>
        </div>
      </div>
      
      <p className="font-serif text-2xl text-gray-400 italic leading-relaxed max-w-3xl mx-auto border-y border-white/5 py-10 animate-fade-in-up backdrop-blur-sm" style={{animationDelay: '1000ms'}}>
        "The architect of persona. Weave professional destinies with the precision of AI and the artistry of design."
      </p>

      <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-fade-in-up" style={{animationDelay: '1400ms'}}>
        <button 
          onClick={onEnter}
          className="group relative px-12 py-5 bg-gold-500 text-bordeaux-950 font-sans font-bold text-sm tracking-[0.2em] transition-all duration-500 rounded-sm overflow-hidden"
        >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <span className="relative z-10">ACCESS STUDIO</span>
            <div className="absolute inset-0 shadow-[0_0_40px_-10px_rgba(212,175,55,0.6)] group-hover:shadow-[0_0_60px_-10px_rgba(212,175,55,0.9)] transition-shadow duration-300"></div>
        </button>
      </div>
    </div>
  </div>
);

const Login = ({ onDemoLogin }: { onDemoLogin: () => void }) => (
  <div className="min-h-screen flex justify-center items-center px-4 bg-bordeaux-950 relative">
     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
     {/* Glow behind modal */}
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/10 blur-[100px] rounded-full pointer-events-none"></div>

    <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in-up">
      
      <div className="text-center mb-12">
        <h2 className="font-display text-5xl text-gold-400 mb-4 drop-shadow-sm">Entrance</h2>
        <p className="text-gray-400 text-sm font-sans tracking-widest uppercase">Authenticate to access the neural loom</p>
      </div>

      <div className="space-y-4">
          <button
            onClick={signInWithGoogle}
            className="w-full group flex items-center justify-center gap-4 bg-white text-bordeaux-950 py-4 px-6 rounded-xl font-bold hover:bg-gold-50 transition-all shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] duration-300"
          >
            <Icons.Google />
            <span>Continue with Google</span>
          </button>
          
          <button
            onClick={onDemoLogin}
            className="w-full group flex items-center justify-center gap-4 bg-transparent border border-gold-500/30 text-gold-400 py-4 px-6 rounded-xl font-bold hover:bg-gold-500/10 transition-all hover:scale-[1.02] duration-300"
          >
            <Icons.Demo />
            <span>Access Demo Studio</span>
          </button>
      </div>

      <div className="mt-12 flex justify-center">
        <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent"></div>
      </div>
      <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-wider">Trigenys Secure Access</p>
    </div>
  </div>
);

const Dashboard = ({ onSelectCV, user }: { onSelectCV: (cv: CVProfile) => void; user: User }) => {
  const [criteria, setCriteria] = useState<JobCriteria>({ 
    jobTitle: '', 
    context: '', 
    yearsExperience: 2,
    tone: CVTone.PROFESSIONAL,
    includeHobbies: true,
    includeSummary: true
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CVProfile[]>([]);
  const [thinking, setThinking] = useState(false);

  const handleGenerate = async () => {
    if (!criteria.jobTitle || !criteria.context) return;
    setLoading(true);
    setThinking(true);
    setResults([]);
    
    // Simulate thinking delay visuals
    setTimeout(() => setThinking(false), 2000); 

    try {
      const generated = await generateCVs(criteria);
      setResults(generated);
    } catch (e) {
      console.error(e);
      alert("The Oracle is silent. Please check your API key or connection.");
    } finally {
      setLoading(false);
      setThinking(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen grid lg:grid-cols-12 gap-10">
      
      {/* Control Panel */}
      <div className="lg:col-span-4 space-y-8 sticky top-28 h-fit animate-fade-in-up">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5 relative z-10">
            <div className="p-2 bg-gradient-to-br from-gold-500/20 to-transparent rounded-lg text-gold-400 border border-gold-500/10">
               <Icons.Create />
            </div>
            <div>
               <h2 className="font-display text-xl text-white">Parameters</h2>
               <p className="text-[10px] uppercase tracking-wider text-gray-500">Define your candidate</p>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-gold-500/80 mb-2 font-bold">Target Role</label>
              <input 
                type="text" 
                value={criteria.jobTitle}
                onChange={(e) => setCriteria({...criteria, jobTitle: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-gold-500/50 focus:bg-black/40 transition-all font-sans focus:ring-1 focus:ring-gold-500/20"
                placeholder="e.g. Creative Director"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-gold-500/80 mb-2 font-bold">Context & DNA</label>
              <textarea 
                rows={4}
                value={criteria.context}
                onChange={(e) => setCriteria({...criteria, context: e.target.value})}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-gold-500/50 focus:bg-black/40 transition-all resize-none font-sans focus:ring-1 focus:ring-gold-500/20"
                placeholder="Describe the company culture, specific challenges, and hidden requirements..."
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                 <label className="text-[10px] uppercase tracking-widest text-gold-500/80 font-bold">Experience Level</label>
                 <span className="text-xs font-bold text-white">{criteria.yearsExperience} Years</span>
              </div>
              <input 
                type="range" 
                min="0" max="15"
                value={criteria.yearsExperience}
                onChange={(e) => setCriteria({...criteria, yearsExperience: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold-500 hover:accent-gold-400"
              />
            </div>

            {/* Advanced Controls */}
            <div className="pt-4 border-t border-white/5 space-y-4">
               <div className="grid grid-cols-2 gap-3">
                   <button 
                      onClick={() => setCriteria(c => ({...c, includeSummary: !c.includeSummary}))}
                      className={`px-3 py-3 rounded-lg text-xs font-medium border transition-all duration-300 ${criteria.includeSummary ? 'bg-gold-500/20 border-gold-500/50 text-gold-400 shadow-[0_0_10px_-4px_rgba(212,175,55,0.3)]' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'}`}
                   >
                     Summary {criteria.includeSummary ? 'ON' : 'OFF'}
                   </button>
                   <button 
                      onClick={() => setCriteria(c => ({...c, includeHobbies: !c.includeHobbies}))}
                      className={`px-3 py-3 rounded-lg text-xs font-medium border transition-all duration-300 ${criteria.includeHobbies ? 'bg-gold-500/20 border-gold-500/50 text-gold-400 shadow-[0_0_10px_-4px_rgba(212,175,55,0.3)]' : 'bg-transparent border-white/10 text-gray-500 hover:border-white/30'}`}
                   >
                     Hobbies {criteria.includeHobbies ? 'ON' : 'OFF'}
                   </button>
               </div>
               <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gold-500/80 mb-2 font-bold">Tone of Voice</label>
                  <select 
                    value={criteria.tone}
                    onChange={(e) => setCriteria({...criteria, tone: e.target.value as CVTone})}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold-500/50"
                  >
                    {Object.values(CVTone).map(t => <option key={t} value={t} className="bg-bordeaux-950">{t}</option>)}
                  </select>
               </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !criteria.jobTitle}
              className="w-full py-4 mt-4 bg-gradient-to-r from-gold-600 to-gold-400 text-bordeaux-950 font-bold text-sm tracking-[0.2em] hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-[0_0_20px_-5px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.6)] relative overflow-hidden"
            >
              {loading ? "PROCESSING..." : "GENERATE PROFILES"}
            </button>
          </div>
        </div>
      </div>

      {/* Output Stream */}
      <div className="lg:col-span-8 space-y-6 min-h-[500px] relative">
         {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-sm rounded-3xl border border-white/5 bg-black/20">
            <div className="relative">
              <div className="w-24 h-24 border border-white/10 rounded-full animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute inset-0 border-t-2 border-gold-400 rounded-full animate-spin shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
              <div className="absolute inset-2 border-b-2 border-bordeaux-600 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center text-gold-400 animate-pulse">
                 <Icons.Sparkle />
              </div>
            </div>
            <p className="mt-8 font-display text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-gold-500 animate-pulse">
               {thinking ? "Analyzing Context..." : "Forging Identities..."}
            </p>
            <p className="text-xs text-gold-500/60 font-mono mt-3 tracking-widest uppercase">Neural Loom Active</p>
          </div>
        )}

        {results.length === 0 && !loading ? (
          <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl p-12 text-center bg-white/5 animate-fade-in-up">
            <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/5">
               <Icons.Sparkle />
            </div>
            <h3 className="font-display text-3xl text-white mb-3">The Canvas is Empty</h3>
            <p className="font-serif italic text-gray-400 max-w-md text-lg leading-relaxed">Configure the parameters on the left to invoke the AI generation engine.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((cv, idx) => (
              <div 
                key={cv.id}
                style={{animationDelay: `${idx * 150}ms`}}
                className="animate-fade-in-up"
              >
                  <CVCard cv={cv} onClick={() => onSelectCV(cv)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CVCard = ({ cv, onClick, isSavedView = false, onDelete }: { cv: CVProfile; onClick: () => void; isSavedView?: boolean; onDelete?: () => void }) => {
    const getTheme = () => {
        if (cv.type === CVType.BEST_FIT) return { border: 'border-emerald-500/30 hover:border-emerald-400/50', bg: 'bg-emerald-900/10', text: 'text-emerald-400', glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]' };
        if (cv.type === CVType.BAD_FIT_CHARMING) return { border: 'border-rose-500/30 hover:border-rose-400/50', bg: 'bg-rose-900/10', text: 'text-rose-400', glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(244,63,94,0.2)]' };
        return { border: 'border-gold-500/30 hover:border-gold-400/50', bg: 'bg-gold-900/10', text: 'text-gold-400', glow: 'group-hover:shadow-[0_0_30px_-10px_rgba(212,175,55,0.2)]' };
    };
    
    const theme = getTheme();

    return (
        <div 
          className={`group relative p-8 rounded-2xl border backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:bg-white/10 ${theme.border} ${theme.glow} bg-white/5 overflow-hidden`}
          onClick={onClick}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none transition-opacity opacity-0 group-hover:opacity-100"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                   <div className={`w-1 h-14 rounded-full ${theme.bg.replace('/10', '/80')} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}></div>
                   <div>
                        <h3 className="font-display text-2xl text-white group-hover:text-gold-300 transition-colors">{cv.fullName}</h3>
                        <p className="text-sm font-sans text-gray-400 tracking-wide uppercase mt-1">{cv.title}</p>
                   </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase border ${theme.bg} ${theme.text} border-opacity-20`}>
                        {cv.type}
                    </span>
                    {isSavedView && (
                        <span className="text-[10px] text-gray-600 font-mono">
                           {new Date(cv.generatedAt).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>
            
            <p className="text-sm text-gray-300 font-serif italic leading-relaxed opacity-80 mb-6 line-clamp-2 pl-5 border-l border-white/10">
                "{cv.summary || 'No summary available.'}"
            </p>

            <div className="flex flex-wrap gap-2 relative z-10">
                {cv.skills.slice(0, 4).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-gray-400 uppercase tracking-wider hover:bg-white/10 transition-colors">
                        {skill}
                    </span>
                ))}
            </div>
            
            {isSavedView && onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="absolute bottom-6 right-6 p-2 text-gray-600 hover:text-rose-400 transition-colors z-20 hover:bg-rose-900/20 rounded-lg"
                  title="Delete from Vault"
                >
                    <Icons.Trash />
                </button>
            )}
        </div>
    );
};

const HistoryView = ({ onSelectCV, user }: { onSelectCV: (cv: CVProfile) => void; user: User }) => {
    const [savedCVs, setSavedCVs] = useState<CVProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(user && user.uid !== 'demo-guest') {
            loadData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const loadData = async () => {
        const data = await getSavedCVs(user.uid);
        setSavedCVs(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if(confirm("Are you sure you want to permanently remove this profile from the Vault?")) {
            await deleteCV(id);
            await loadData();
        }
    };

    if (user.uid === 'demo-guest') {
        return (
            <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen animate-fade-in-up flex flex-col items-center justify-center text-center">
                 <div className="p-8 bg-white/5 border border-gold-500/20 rounded-3xl max-w-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold-900/30 text-gold-400 mb-6 border border-gold-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h2 className="font-display text-3xl text-gold-400 mb-4">Vault Access Restricted</h2>
                    <p className="font-serif italic text-gray-400 text-lg leading-relaxed mb-6">
                        "The archives are sealed for guests. To securely store your generated personas and access them anytime, please authenticate with a verified account."
                    </p>
                    <button onClick={logoutUser} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
                        Return to Login
                    </button>
                 </div>
            </div>
        )
    }

    return (
        <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen animate-fade-in-up">
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
               <h2 className="font-display text-4xl text-white">Profile Vault</h2>
               <div className="text-xs text-gray-500 font-mono">SECURE STORAGE • {savedCVs.length} RECORDS</div>
            </div>
            
            {loading ? (
                 <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4"></div>
                    <div className="text-gold-500/50 animate-pulse tracking-widest text-xs uppercase">Accessing secure storage...</div>
                 </div>
            ) : savedCVs.length === 0 ? (
                <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <div className="text-4xl mb-4 opacity-20">📂</div>
                   <p className="text-gray-500 font-serif italic text-lg">The vault is empty. Generate and save profiles to see them here.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {savedCVs.map((cv, i) => (
                        <div key={cv.id} className="animate-fade-in-up" style={{animationDelay: `${i * 100}ms`}}>
                            <CVCard 
                            cv={cv} 
                            onClick={() => onSelectCV(cv)} 
                            isSavedView 
                            onDelete={() => handleDelete(cv.id)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Modal = ({ cv, onClose, user }: { cv: CVProfile; onClose: () => void; user: User }) => {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (user.uid === 'demo-guest') {
            alert("🔒 DEMO MODE RESTRICTION\n\nPlease log in with a Google account to save profiles to the Vault.");
            return;
        }

        setSaving(true);
        try {
            await saveCV(cv, user.uid);
            alert("Profile securely archived in the Vault.");
        } catch (e) {
            alert("Error saving profile.");
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bordeaux-950/90 backdrop-blur-lg">
            <div className="w-full max-w-5xl bg-[#f8f8f8] text-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up border border-white/20">
                {/* Modal Header */}
                <div className="p-4 bg-white border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                       cv.type === CVType.BEST_FIT ? 'bg-emerald-100 text-emerald-800' :
                       cv.type === CVType.BAD_FIT_CHARMING ? 'bg-rose-100 text-rose-800' :
                       'bg-amber-100 text-amber-800'
                     }`}>
                       {cv.type}
                     </span>
                     <span className="text-[10px] text-gray-400 font-mono hidden md:inline tracking-wider">ID: {cv.id.toUpperCase()}</span>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors border border-gray-200"
                    >
                      <Icons.Save /> {saving ? "Archiving..." : "Save to Vault"}
                    </button>
                    <button 
                      onClick={() => generatePDF(cv)}
                      className="flex items-center gap-2 px-5 py-2 bg-bordeaux-900 text-gold-400 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-bordeaux-800 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Icons.Download /> Export PDF
                    </button>
                    <button 
                      onClick={onClose}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                    >
                      <Icons.X />
                    </button>
                  </div>
                </div>
                
                {/* Paper Preview */}
                <div className="overflow-y-auto p-8 md:p-12 bg-white min-h-0 font-serif">
                  <div className="max-w-3xl mx-auto space-y-10">
                      
                      {/* CV Header */}
                      <div className="text-center border-b-2 border-gold-400 pb-8">
                        <h2 className="font-display text-5xl text-bordeaux-900 font-bold mb-2 tracking-wide">{cv.fullName}</h2>
                        <p className="text-gold-600 font-sans text-xl uppercase tracking-widest font-bold">{cv.title}</p>
                        <div className="text-xs font-sans text-gray-500 mt-6 flex flex-wrap justify-center gap-6 tracking-wide uppercase font-semibold">
                          <span>{cv.email}</span>
                          <span className="text-gold-300">•</span>
                          <span>{cv.phone}</span>
                          <span className="text-gold-300">•</span>
                          <span>{cv.location}</span>
                        </div>
                      </div>

                      {/* Summary */}
                      {cv.summary && (
                          <section>
                            <h3 className="font-sans font-bold text-xs text-bordeaux-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gold-400 rounded-full"></span> Profile
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-lg">{cv.summary}</p>
                          </section>
                      )}

                      {/* Experience */}
                      <section>
                        <h3 className="font-sans font-bold text-xs text-bordeaux-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                             <span className="w-2 h-2 bg-gold-400 rounded-full"></span> Professional History
                        </h3>
                        <div className="space-y-10">
                          {cv.experience.map((exp, i) => (
                            <div key={i} className="relative pl-8 border-l-2 border-gray-100 hover:border-gold-200 transition-colors">
                              <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-gold-400"></div>
                              <div className="flex justify-between items-baseline mb-2">
                                <h4 className="font-bold text-gray-900 text-xl font-display">{exp.role}</h4>
                                <span className="text-xs text-gray-500 font-sans uppercase tracking-wide font-medium bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
                              </div>
                              <p className="text-gold-600 text-sm font-bold uppercase tracking-wide mb-3">{exp.company}</p>
                              <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Grid for Edu/Skills */}
                      <div className="grid md:grid-cols-2 gap-12 pt-6 border-t border-gray-100">
                        <section>
                          <h3 className="font-sans font-bold text-xs text-bordeaux-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 bg-gold-400 rounded-full"></span> Education
                          </h3>
                          {cv.education.map((edu, i) => (
                            <div key={i} className="mb-6">
                              <h4 className="font-bold text-gray-900 text-lg">{edu.institution}</h4>
                              <p className="text-sm text-gray-600 italic font-serif text-lg">{edu.degree}</p>
                              <p className="text-xs text-gray-400 font-sans mt-1">{edu.year}</p>
                            </div>
                          ))}
                        </section>
                        <section>
                          <h3 className="font-sans font-bold text-xs text-bordeaux-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                             <span className="w-2 h-2 bg-gold-400 rounded-full"></span> Competencies
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-8">
                            {cv.skills.map((skill, i) => (
                                <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-sans font-medium rounded border border-gray-200">
                                    {skill}
                                </span>
                            ))}
                          </div>
                          {cv.hobbies.length > 0 && (
                            <>
                                <h3 className="font-sans font-bold text-xs text-gray-400 uppercase tracking-[0.2em] mb-3">Interests</h3>
                                <p className="text-sm text-gray-600 font-serif italic">{cv.hobbies.join(", ")}</p>
                            </>
                          )}
                        </section>
                      </div>
                  </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCV, setSelectedCV] = useState<CVProfile | null>(null);

  // Function to handle manual Demo login
  const handleDemoLogin = () => {
      setUser(DEMO_USER);
      setView(AppView.DASHBOARD);
  };

  useEffect(() => {
     const unsubscribe = subscribeToAuthChanges((currentUser) => {
         // If we are currently in Demo mode, do not override the user unless it's a real login event
         // Logic: If firebase returns null, but we have a demo user set, keep the demo user.
         if (!currentUser) {
             setUser(prev => prev?.uid === 'demo-guest' ? prev : null);
             
             // Navigation Logic for non-logged in users (excluding Demo user)
             if (view !== AppView.LANDING && view !== AppView.LOGIN && user?.uid !== 'demo-guest') {
                 setView(AppView.LANDING);
             }
         } else {
             // Real user logged in
             setUser(currentUser);
             if (view === AppView.LANDING || view === AppView.LOGIN) {
                 setView(AppView.DASHBOARD);
             }
         }
     });
     return () => unsubscribe();
  }, [view, user]);

  const handleLogout = () => {
      if (user?.uid === 'demo-guest') {
          setUser(null);
          setView(AppView.LOGIN);
      } else {
          logoutUser();
      }
  };

  return (
    <div className="min-h-screen bg-bordeaux-950 text-gray-100 selection:bg-gold-500/30 font-sans overflow-x-hidden">
      {view !== AppView.LANDING && view !== AppView.LOGIN && (
        <Header 
          currentView={view} 
          onViewChange={setView} 
          onLogout={handleLogout} 
          userPhoto={user?.photoURL || undefined}
          isDemo={user?.uid === 'demo-guest'}
        />
      )}
      
      <main className="relative z-10">
        {view === AppView.LANDING && <Landing onEnter={() => user ? setView(AppView.DASHBOARD) : setView(AppView.LOGIN)} />}
        {view === AppView.LOGIN && <Login onDemoLogin={handleDemoLogin} />}
        {view === AppView.DASHBOARD && user && <Dashboard onSelectCV={setSelectedCV} user={user} />}
        {view === AppView.HISTORY && user && <HistoryView onSelectCV={setSelectedCV} user={user} />}
      </main>

      {selectedCV && user && <Modal cv={selectedCV} onClose={() => setSelectedCV(null)} user={user} />}

      {view !== AppView.LANDING && <Footer />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);