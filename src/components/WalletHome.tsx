import React, { useState } from 'react';
import { UserProfile, Transaction, Language, OperatorId } from '../types';
import { OPERATORS } from '../constants/operators';
import { TRANSLATIONS } from '../constants/translations';
import { CulturalPattern, WatermarkRibbon } from './CulturalPattern';
import { 
  Send, 
  ArrowDownLeft, 
  Coins, 
  Receipt, 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  Share2, 
  Zap, 
  HelpCircle,
  MessageCircle,
  X
} from 'lucide-react';

interface WalletHomeProps {
  user: UserProfile | null;
  balance: number;
  hideBalance: boolean;
  onToggleHideBalance: () => void;
  transactions: Transaction[];
  onOpenTransfer: (type?: 'transfer' | 'deposit') => void;
  onOpenCredit: () => void;
  onOpenBills: () => void;
  onOpenSupport: () => void;
  lang?: Language;
}

export const WalletHome: React.FC<WalletHomeProps> = ({
  user,
  balance,
  hideBalance,
  onToggleHideBalance,
  transactions,
  onOpenTransfer,
  onOpenCredit,
  onOpenBills,
  onOpenSupport,
  lang = 'fr',
}) => {
  const t = TRANSLATIONS[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesQuery = 
      tx.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.recipientPhone.includes(searchQuery);

    if (!matchesQuery) return false;
    if (filterType === 'all') return true;
    if (filterType === 'transfer') return tx.type === 'transfer';
    if (filterType === 'deposit') return tx.type === 'deposit';
    if (filterType === 'bill') return tx.type === 'bill_payment';
    return true;
  });

  const getOperatorBadge = (operatorId: OperatorId) => {
    const op = OPERATORS.find((o) => o.id === operatorId) || OPERATORS[0];
    return (
      <span
        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ backgroundColor: op.accentColor, color: op.color }}
      >
        {op.name}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      
      {/* -------------------- 1. HERO BALANCE CARD -------------------- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-slate-900 text-white p-5 sm:p-6 shadow-xl border border-emerald-600/30">
        
        {/* Animated Burkina Faso Ribbon Watermark in Card */}
        <WatermarkRibbon variant="card" />

        {/* Subtle background pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#fbbf24 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-200 font-medium">
                {t.culturalGreeting}, <strong className="text-white font-bold">{user?.firstName || 'Partenaire'}</strong>
              </span>
              <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                Tier {user?.verificationTier === 'tier2' ? '2' : '1'}
              </span>
            </div>

            <button
              onClick={onToggleHideBalance}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold backdrop-blur-xs"
              title={hideBalance ? t.showBalance : t.hideBalance}
            >
              {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{hideBalance ? 'Afficher' : 'Masquer'}</span>
            </button>
          </div>

          {/* Amount Display */}
          <div className="py-1">
            <span className="text-xs text-emerald-200 uppercase tracking-widest font-semibold block">
              {t.balanceLabel}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1">
              {hideBalance ? (
                <span className="tracking-widest">••••••••</span>
              ) : (
                <span>
                  {balance.toLocaleString('fr-FR')} <span className="text-xl sm:text-2xl font-bold font-sans text-amber-300">FCFA</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Fonds protégés • Conforme réglementations BCEAO</span>
            </p>
          </div>

          {/* Quick Action Buttons inside Card */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-600/30">
            <button
              onClick={() => onOpenTransfer('transfer')}
              className="py-2.5 px-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.sendMoney}</span>
            </button>

            <button
              onClick={() => onOpenTransfer('deposit')}
              className="py-2.5 px-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 backdrop-blur-xs active:scale-95"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.depositWithdraw}</span>
            </button>

            <button
              onClick={onOpenCredit}
              className="py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 text-slate-900" />
              <span>{t.loanCredit}</span>
            </button>
          </div>

        </div>
      </div>

      {/* -------------------- 2. OPERATOR LIVE STATUS BAR -------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-500 shrink-0">
          Réseaux connectés :
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {OPERATORS.map((op) => (
            <div
              key={op.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: op.color }} />
              <span className="text-slate-800 dark:text-slate-200 text-[11px]">{op.name.split(' ')[0]}</span>
              <span className="text-emerald-600 text-[10px] font-mono font-bold">● {op.uptime}</span>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- 3. BURKINA SERVICES SHORTCUTS -------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={onOpenBills}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            Facture SONABEL
          </span>
          <span className="text-[10px] text-slate-400">Électricité prépayée</span>
        </button>

        <button
          onClick={onOpenBills}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            Facture ONEA
          </span>
          <span className="text-[10px] text-slate-400">Eau & assainissement</span>
        </button>

        <button
          onClick={onOpenCredit}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs text-left transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <Coins className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            Simulation Prêt
          </span>
          <span className="text-[10px] text-slate-400">Micro-financement</span>
        </button>

        <a
          href="https://wa.me/22664489060?text=Bonjour%20FASO,%20j'ai%20besoin%20d'aide"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs text-left transition-all group block"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white block">
            WhatsApp +226
          </span>
          <span className="text-[10px] text-emerald-600 font-mono font-semibold">64 48 90 60</span>
        </a>
      </div>

      {/* -------------------- 4. RECENT TRANSACTIONS -------------------- */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {t.recentActivity}
            </h3>
            <p className="text-xs text-slate-500">
              Historique certifié par clé d'idempotence
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700"
            >
              <option value="all">Tous</option>
              <option value="transfer">Envois</option>
              <option value="deposit">Dépôts</option>
              <option value="bill">Factures</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucune transaction trouvée pour cette recherche.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTxForReceipt(tx)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      tx.type === 'deposit'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        : 'bg-red-50 dark:bg-red-950 text-red-600'
                    }`}
                  >
                    {tx.type === 'deposit' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {tx.recipientName}
                      </span>
                      {getOperatorBadge(tx.operatorId)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(tx.timestamp).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })} • <span className="font-mono">{tx.reference.slice(-9)}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black font-mono block ${
                      tx.type === 'deposit'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'deposit' ? '+' : '-'}
                    {tx.amount.toLocaleString('fr-FR')} F
                  </span>
                  <span className="text-[10px] text-slate-400 font-sans">
                    Frais : {tx.operatorFee} F
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* -------------------- RECEIPT MODAL -------------------- */}
      {selectedTxForReceipt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Reçu Officiel FASO
                </h3>
              </div>
              <button
                onClick={() => setSelectedTxForReceipt(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Montant</span>
              <p className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {selectedTxForReceipt.amount.toLocaleString('fr-FR')} FCFA
              </p>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ● Transaction Validée
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Référence FASO :</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTxForReceipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Clé d'idempotence :</span>
                <span className="text-[10px] text-slate-500">{selectedTxForReceipt.idempotencyKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Destinataire :</span>
                <span className="font-sans font-bold text-slate-800 dark:text-slate-200">{selectedTxForReceipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Date & Heure :</span>
                <span>{new Date(selectedTxForReceipt.timestamp).toLocaleString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Frais opérateur :</span>
                <span>{selectedTxForReceipt.operatorFee} FCFA</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm font-sans">
                <span>Total débité :</span>
                <span className="font-mono text-emerald-600">{selectedTxForReceipt.totalDebited.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert(`Reçu PDF téléchargé : ${selectedTxForReceipt.reference}.pdf`)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Télécharger PDF</span>
              </button>
              <button
                onClick={() => alert('Détails copiés pour partage.')}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Partager</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
