import React from 'react';
import { UserProfile, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { FasoLogo } from './CulturalPattern';
import { 
  ShieldCheck, 
  Lock, 
  Settings, 
  Eye, 
  EyeOff, 
  Globe, 
  MessageCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  balance: number;
  hideBalance: boolean;
  onToggleHideBalance: () => void;
  onOpenSettings: (tab?: string) => void;
  onOpenSupport: (tab?: 'feedback' | 'report') => void;
  onLockSession: () => void;
  onSelectLanguage: (lang: Language) => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  balance,
  hideBalance,
  onToggleHideBalance,
  onOpenSettings,
  onOpenSupport,
  onLockSession,
  onSelectLanguage,
  onOpenProfile,
}) => {
  const currentLang = user?.language || 'fr';
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div 
          onClick={onOpenProfile}
          className="cursor-pointer group flex items-center gap-2"
          title="Consulter mon profil"
        >
          <FasoLogo size="md" showTagline={false} />
        </div>

        {/* Center / Fast balance & Tier badge */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={onToggleHideBalance}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title={hideBalance ? t.showBalance : t.hideBalance}
          >
            {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>
              {hideBalance ? '•••••• FCFA' : `${balance.toLocaleString('fr-FR')} FCFA`}
            </span>
          </button>

          <span className="text-slate-300 dark:text-slate-600">|</span>

          <span 
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              user?.verificationTier === 'tier2'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            {user?.verificationTier === 'tier2' ? 'Tier 2 BCEAO' : 'Tier 1 Vérifié'}
          </span>
        </div>

        {/* Actions & controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Direct WhatsApp Assistance Button */}
          <a
            href="https://wa.me/22664489060?text=Bonjour%20FASO,%20j'ai%20besoin%20d'assistance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium transition-all shadow-xs"
            title="Assistance WhatsApp officielle FASO (+226 64 48 90 60)"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span className="hidden md:inline font-mono font-bold">+226 64 48 90 60</span>
            <span className="md:hidden font-bold">Aide</span>
          </a>

          {/* Language selector dropdown */}
          <div className="relative group">
            <button
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Changer de langue (Français, Mooré, Dioula, Fulfuldé)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="uppercase font-bold text-[11px]">{currentLang}</span>
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={() => onSelectLanguage('fr')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between ${
                  currentLang === 'fr' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Français</span>
                <span className="text-[10px] text-slate-400">FR</span>
              </button>
              <button
                onClick={() => onSelectLanguage('mo')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between ${
                  currentLang === 'mo' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Mooré</span>
                <span className="text-[10px] text-slate-400">MO</span>
              </button>
              <button
                onClick={() => onSelectLanguage('di')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between ${
                  currentLang === 'di' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Dioula</span>
                <span className="text-[10px] text-slate-400">DI</span>
              </button>
              <button
                onClick={() => onSelectLanguage('fu')}
                className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between ${
                  currentLang === 'fu' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>Fulfuldé</span>
                <span className="text-[10px] text-slate-400">FU</span>
              </button>
            </div>
          </div>

          {/* Quick Lock Button */}
          <button
            onClick={onLockSession}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Verrouiller le portefeuille maintenant"
          >
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => onOpenSettings()}
            className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile Avatar */}
          <button
            onClick={onOpenProfile}
            className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500/70 hover:scale-105 transition-transform"
            title="Mon Profil"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                {user?.firstName?.[0] || 'F'}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
