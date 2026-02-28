import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { t, toggleLang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-emerald-50/30 to-teal-50">
      <header className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">VoteChain</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-lg bg-slate-600 text-white font-medium hover:bg-slate-700 transition"
          >
            Admin
          </button>
          <button
            onClick={toggleLang}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
          >
            {t.changeLanguage}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
