/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Transaction, 
  LoanApplication, 
  SupportTicket, 
  UserFeedback, 
  Language, 
  AppState 
} from './types';
import { 
  getInitialState, 
  saveState, 
  resetToDefaults 
} from './services/storage';
import { TRANSLATIONS } from './constants/translations';
import { Header } from './components/Header';
import { WalletHome } from './components/WalletHome';
import { CreditModule } from './components/CreditModule';
import { SettingsModal } from './components/SettingsModal';
import { TransferModal } from './components/TransferModal';
import { AuthModal } from './components/AuthModal';
import { FeedbackSupportModal } from './components/FeedbackSupportModal';
import { SandboxControls } from './components/SandboxControls';
import { CulturalPattern, WatermarkRibbon } from './components/CulturalPattern';
import { 
  Wallet, 
  Coins, 
  History, 
  Settings, 
  HelpCircle, 
  MessageCircle,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';

export default function App() {
  // App State loaded from localStorage
  const [appState, setAppState] = useState<AppState>(getInitialState);

  // Active top-level navigation view
  // 'wallet' | 'credit' | 'history' | 'settings'
  const [activeView, setActiveView] = useState<'wallet' | 'credit' | 'history' | 'settings'>('wallet');

  // Modals visibility
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery' | 'lock'>('login');
  
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferDefaultType, setTransferDefaultType] = useState<'transfer' | 'deposit'>('transfer');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>('account');

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportInitialTab, setSupportInitialTab] = useState<'feedback' | 'report' | 'my_tickets' | 'admin_console'>('report');

  // Balance privacy state (defaults to user preference)
  const [hideBalance, setHideBalance] = useState<boolean>(
    appState.user?.hideBalanceDefault ?? false
  );

  // Save changes to localStorage
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Handle inactivity timeout auto-lock
  useEffect(() => {
    const lockMinutes = appState.user?.autoLockMinutes || 5;
    let timeoutId: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!appState.isLocked) {
          setAppState((prev) => ({ ...prev, isLocked: true }));
          setAuthMode('lock');
          setIsAuthOpen(true);
        }
      }, lockMinutes * 60 * 1000);
    };

    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);

    resetInactivityTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('touchstart', resetInactivityTimer);
    };
  }, [appState.user?.autoLockMinutes, appState.isLocked]);

  // Current language dictionary
  const currentLang: Language = appState.user?.language || 'fr';
  const t = TRANSLATIONS[currentLang];

  // User updates
  const handleUpdateUser = (updatedUser: UserProfile) => {
    setAppState((prev) => ({ ...prev, user: updatedUser }));
    setHideBalance(updatedUser.hideBalanceDefault);
  };

  // Transaction execution & wallet update
  const handleCompleteTransaction = (newTx: Transaction) => {
    setAppState((prev) => {
      const balanceDiff = newTx.type === 'deposit' ? newTx.amount : -newTx.totalDebited;
      return {
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance + balanceDiff),
        transactions: [newTx, ...prev.transactions],
      };
    });
  };

  // Loan application
  const handleApplyLoan = (newLoan: LoanApplication) => {
    setAppState((prev) => ({
      ...prev,
      loans: [newLoan, ...prev.loans],
    }));
  };

  // Loan repayment
  const handleRepayInstallment = (loanId: string, amount: number) => {
    if (appState.walletBalance < amount) {
      alert(`Solde insuffisant pour le remboursement (${appState.walletBalance.toLocaleString('fr-FR')} FCFA disponible).`);
      return;
    }

    // Deduct from wallet and update loan
    const repaymentTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: `TXN-REP-${Math.floor(1000 + Math.random() * 9000)}`,
      idempotencyKey: `idem-rep-${Date.now()}`,
      type: 'loan_repayment',
      operatorId: 'orange',
      recipientName: 'Remboursement Microfinance FASO',
      recipientPhone: 'CREDIT-FASO',
      amount,
      operatorFee: 0,
      fasoCommission: 0,
      totalDebited: amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: 'Remboursement échéance prêt solidaire',
    };

    setAppState((prev) => {
      const updatedLoans = prev.loans.map((l) => {
        if (l.id === loanId) {
          const newBal = Math.max(0, l.remainingBalance - amount);
          return {
            ...l,
            remainingBalance: newBal,
            status: newBal === 0 ? ('repaid' as const) : l.status,
          };
        }
        return l;
      });

      return {
        ...prev,
        walletBalance: prev.walletBalance - amount,
        transactions: [repaymentTx, ...prev.transactions],
        loans: updatedLoans,
      };
    });

    alert(`Échéance de ${amount.toLocaleString('fr-FR')} FCFA remboursée avec succès par prélèvement portefeuille.`);
  };

  // Support tickets
  const handleAddTicket = (newTicket: SupportTicket) => {
    setAppState((prev) => ({
      ...prev,
      tickets: [newTicket, ...prev.tickets],
    }));
  };

  const handleUpdateTicket = (updatedTicket: SupportTicket) => {
    setAppState((prev) => ({
      ...prev,
      tickets: prev.tickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)),
    }));
  };

  // Feedback
  const handleAddFeedback = (feedback: UserFeedback) => {
    setAppState((prev) => ({
      ...prev,
      feedbacks: [feedback, ...prev.feedbacks],
    }));
  };

  // Manual Lock session
  const handleManualLock = () => {
    setAppState((prev) => ({ ...prev, isLocked: true }));
    setAuthMode('lock');
    setIsAuthOpen(true);
  };

  // Unlock session
  const handleUnlock = () => {
    setAppState((prev) => ({ ...prev, isLocked: false }));
    setIsAuthOpen(false);
  };

  // Log in or register new user
  const handleAuthSuccess = (loggedUser: UserProfile) => {
    setAppState((prev) => ({
      ...prev,
      user: loggedUser,
      isAuthenticated: true,
      isLocked: false,
    }));
    setIsAuthOpen(false);
  };

  // Logout
  const handleLogout = () => {
    setIsSettingsOpen(false);
    setAppState((prev) => ({
      ...prev,
      isAuthenticated: false,
      isLocked: true,
    }));
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  // Quick sandbox inject money
  const handleInjectMoney = (amount: number) => {
    const depositTx: Transaction = {
      id: `tx-inj-${Date.now()}`,
      reference: `TXN-BF-${Math.floor(1000 + Math.random() * 9000)}`,
      idempotencyKey: `idem-inj-${Date.now()}`,
      type: 'deposit',
      operatorId: 'orange',
      recipientName: 'Approvisionnement Testeur Orange Money',
      recipientPhone: appState.user?.phoneNumber || '70234567',
      amount,
      operatorFee: 0,
      fasoCommission: 0,
      totalDebited: amount,
      status: 'completed',
      timestamp: new Date().toISOString(),
      description: 'Rechargement de test Sandbox',
    };
    handleCompleteTransaction(depositTx);
  };

  // Reset to default
  const handleResetData = () => {
    const def = resetToDefaults();
    setAppState(def);
    setHideBalance(def.user?.hideBalanceDefault ?? false);
  };

  return (
    <div className={`min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors ${
      appState.user?.textSize === 'large' ? 'text-base' : appState.user?.textSize === 'xlarge' ? 'text-lg' : 'text-sm'
    }`}>
      
      {/* Animated Burkina Faso ribbon watermark */}
      <WatermarkRibbon variant="screen" />

      {/* Subtle Faso Dan Fani background pattern if enabled */}
      {appState.user?.culturalAnimations && <CulturalPattern variant="subtle" />}

      {/* Top Header */}
      <Header
        user={appState.user}
        balance={appState.walletBalance}
        hideBalance={hideBalance}
        onToggleHideBalance={() => setHideBalance(!hideBalance)}
        onOpenSettings={(tab) => {
          setSettingsTab(tab || 'account');
          setIsSettingsOpen(true);
        }}
        onOpenSupport={(tab) => {
          setSupportInitialTab(tab || 'report');
          setIsSupportOpen(true);
        }}
        onLockSession={handleManualLock}
        onSelectLanguage={(lang) => {
          if (appState.user) {
            handleUpdateUser({ ...appState.user, language: lang });
          }
        }}
        onOpenProfile={() => {
          setSettingsTab('account');
          setIsSettingsOpen(true);
        }}
      />

      {/* Cultural Banner Accent */}
      {appState.user?.culturalAnimations && (
        <div className="max-w-4xl mx-auto px-4 pt-3 w-full">
          <CulturalPattern variant="banner" />
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-5 w-full pb-24 relative z-10">
        
        {/* VIEW 1: WALLET HOME */}
        {activeView === 'wallet' && (
          <WalletHome
            user={appState.user}
            balance={appState.walletBalance}
            hideBalance={hideBalance}
            onToggleHideBalance={() => setHideBalance(!hideBalance)}
            transactions={appState.transactions}
            onOpenTransfer={(type) => {
              setTransferDefaultType(type || 'transfer');
              setIsTransferOpen(true);
            }}
            onOpenCredit={() => setActiveView('credit')}
            onOpenBills={() => {
              setTransferDefaultType('transfer');
              setIsTransferOpen(true);
            }}
            onOpenSupport={() => {
              setSupportInitialTab('report');
              setIsSupportOpen(true);
            }}
            lang={currentLang}
          />
        )}

        {/* VIEW 2: CREDIT / EMPRUNT (SECTION 22) */}
        {activeView === 'credit' && (
          <CreditModule
            user={appState.user}
            loans={appState.loans}
            onApplyLoan={handleApplyLoan}
            onRepayInstallment={handleRepayInstallment}
            lang={currentLang}
          />
        )}

        {/* VIEW 3: HISTORIQUE COMPLET */}
        {activeView === 'history' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Journal Intégral des Transactions
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Toutes vos opérations sont certifiées avec clé d'idempotence et horodatage BCEAO.
              </p>
            </div>

            <WalletHome
              user={appState.user}
              balance={appState.walletBalance}
              hideBalance={hideBalance}
              onToggleHideBalance={() => setHideBalance(!hideBalance)}
              transactions={appState.transactions}
              onOpenTransfer={(type) => {
                setTransferDefaultType(type || 'transfer');
                setIsTransferOpen(true);
              }}
              onOpenCredit={() => setActiveView('credit')}
              onOpenBills={() => {
                setTransferDefaultType('transfer');
                setIsTransferOpen(true);
              }}
              onOpenSupport={() => {
                setSupportInitialTab('report');
                setIsSupportOpen(true);
              }}
              lang={currentLang}
            />
          </div>
        )}

        {/* VIEW 4: PARAMÈTRES EN-PLACE */}
        {activeView === 'settings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
              {t.settings}
            </h2>
            <SettingsModal
              isOpen={true}
              onClose={() => setActiveView('wallet')}
              user={appState.user}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onOpenSupport={(tab) => {
                setSupportInitialTab(tab || 'report');
                setIsSupportOpen(true);
              }}
              initialTab="account"
              lang={currentLang}
            />
          </div>
        )}

      </main>

      {/* -------------------- BOTTOM NAVIGATION BAR (MOBILE FIRST) -------------------- */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setActiveView('wallet')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              activeView === 'wallet'
                ? 'text-emerald-700 dark:text-emerald-400 font-extrabold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px]">Portefeuille</span>
          </button>

          <button
            onClick={() => setActiveView('credit')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              activeView === 'credit'
                ? 'text-emerald-700 dark:text-emerald-400 font-extrabold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Coins className="w-5 h-5" />
            <span className="text-[10px]">{t.loanCredit}</span>
          </button>

          {/* Central Quick Send Floating Button */}
          <button
            onClick={() => {
              setTransferDefaultType('transfer');
              setIsTransferOpen(true);
            }}
            className="w-12 h-12 -mt-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform active:scale-90 border-4 border-white dark:border-slate-900"
            title="Envoyer ou Recharger"
          >
            <Send className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              activeView === 'history'
                ? 'text-emerald-700 dark:text-emerald-400 font-extrabold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px]">Historique</span>
          </button>

          <button
            onClick={() => {
              setSettingsTab('account');
              setIsSettingsOpen(true);
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              isSettingsOpen
                ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">{t.settings}</span>
          </button>
        </div>
      </nav>

      {/* -------------------- MODALS -------------------- */}

      {/* Auth Modal (Phone, OTP, 6-digit PIN, Lock-Screen, Recovery) */}
      <AuthModal
        user={appState.user}
        isOpen={isAuthOpen}
        mode={authMode}
        onModeChange={(m) => setAuthMode(m)}
        onSuccess={handleAuthSuccess}
        onUnlock={handleUnlock}
        lang={currentLang}
      />

      {/* Transfer & Section 19 Callback Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        user={appState.user}
        currentBalance={appState.walletBalance}
        allTransactions={appState.transactions}
        onCompleteTransaction={handleCompleteTransaction}
        lang={currentLang}
      />

      {/* Settings Modal (Section 20) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={appState.user}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        onOpenSupport={(tab) => {
          setSupportInitialTab(tab || 'report');
          setIsSupportOpen(true);
        }}
        initialTab={settingsTab}
        lang={currentLang}
      />

      {/* Feedback & Support Modal (Section 23) */}
      <FeedbackSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        user={appState.user}
        transactions={appState.transactions}
        tickets={appState.tickets}
        feedbacks={appState.feedbacks}
        onAddTicket={handleAddTicket}
        onUpdateTicket={handleUpdateTicket}
        onAddFeedback={handleAddFeedback}
        initialTab={supportInitialTab}
        lang={currentLang}
      />

      {/* Developer Sandbox & Validation Controls (Section 24) */}
      <SandboxControls
        onInjectMoney={handleInjectMoney}
        onForceLock={handleManualLock}
        onResetData={handleResetData}
        onOpenSupportConsole={() => {
          setSupportInitialTab('admin_console');
          setIsSupportOpen(true);
        }}
      />

    </div>
  );
}
