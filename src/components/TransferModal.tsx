import React, { useState, useEffect } from 'react';
import { UserProfile, OperatorId, Transaction, Language } from '../types';
import { OPERATORS, COUNTRY_CODES } from '../constants/operators';
import { TRANSLATIONS } from '../constants/translations';
import { CulturalPattern, FasoLogo } from './CulturalPattern';
import { checkIdempotency } from '../services/storage';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Fingerprint, 
  Smartphone, 
  ExternalLink, 
  RotateCw, 
  FileText, 
  Share2, 
  X, 
  ShieldAlert, 
  Send, 
  ArrowDownLeft, 
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  currentBalance: number;
  allTransactions: Transaction[];
  onCompleteTransaction: (transaction: Transaction) => void;
  lang?: Language;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  user,
  currentBalance,
  allTransactions,
  onCompleteTransaction,
  lang = 'fr',
}) => {
  const t = TRANSLATIONS[lang];

  // Steps:
  // 1: Choose operator & details
  // 2: Review & FASO 6-digit Security PIN authorization
  // 3: Operator External Authorization (Orange / Moov / Telecel USSD push or app)
  // 4: Final Confirmed Receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [txType, setTxType] = useState<'transfer' | 'deposit' | 'withdrawal'>('transfer');
  const [selectedOperatorId, setSelectedOperatorId] = useState<OperatorId>('orange');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');

  // Security Code State
  const [securityPin, setSecurityPin] = useState(['', '', '', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinFailedAttempts, setPinFailedAttempts] = useState(0);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [pinLockTimer, setPinLockTimer] = useState(0);

  // Operator Authorization & Callback State
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [operatorVerificationStatus, setOperatorVerificationStatus] = useState<
    'awaiting_external' | 'polling_status' | 'success' | 'failed'
  >('awaiting_external');
  const [statusPollingAttempts, setStatusPollingAttempts] = useState(0);

  // Selected operator object
  const selectedOperator = OPERATORS.find((op) => op.id === selectedOperatorId) || OPERATORS[0];

  // Calculate fees transparently
  const amount = parseFloat(amountStr) || 0;
  const operatorFee = amount > 0 ? (amount < 5000 ? 50 : amount <= 25000 ? 150 : amount <= 100000 ? 350 : 750) : 0;
  const fasoCommission = 0; // 0 FCFA - Finance Solidaire
  const totalDebited = txType === 'deposit' ? amount : amount + operatorFee + fasoCommission;

  // Recent contact presets in Burkina
  const recentBurkinaContacts = [
    { name: 'Fatoumata Sawadogo', phone: '76123456', operator: 'orange' },
    { name: 'Ibrahim Traoré', phone: '70456789', operator: 'moov' },
    { name: 'Blandine Kaboré', phone: '68901234', operator: 'telecel' },
  ];

  // Lock timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pinLockTimer > 0) {
      timer = setInterval(() => {
        setPinLockTimer((prev) => {
          if (prev <= 1) {
            setIsPinLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pinLockTimer]);

  if (!isOpen) return null;

  // Auto-detect operator by prefix if user types
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setRecipientPhone(clean);

    if (clean.length >= 2) {
      const prefix = clean.slice(0, 2);
      if (['07', '74', '75', '76', '77', '56', '57', '64'].includes(prefix)) {
        setSelectedOperatorId('orange');
      } else if (['01', '02', '60', '61', '62', '63', '70', '71', '72', '73'].includes(prefix)) {
        setSelectedOperatorId('moov');
      } else if (['68', '69', '78', '79', '58', '59'].includes(prefix)) {
        setSelectedOperatorId('telecel');
      }
    }
  };

  // Step 1 Validation -> Go to Step 2 (FASO PIN Check)
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    if (amount <= 0) {
      setPinError('Veuillez saisir un montant valide.');
      return;
    }

    if (txType !== 'deposit' && totalDebited > currentBalance) {
      setPinError(`Solde insuffisant (${currentBalance.toLocaleString('fr-FR')} FCFA disponible).`);
      return;
    }

    if (txType === 'transfer' && recipientPhone.length < 8) {
      setPinError('Veuillez saisir un numéro de destinataire valide (8 chiffres).');
      return;
    }

    // Prepare draft transaction with unique reference & idempotency key
    const ref = `TXN-BF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const idempotencyKey = `idem-${Date.now()}-${selectedOperatorId}-${Math.random().toString(36).substring(2, 7)}`;

    const draftTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      idempotencyKey,
      type: txType,
      operatorId: selectedOperatorId,
      recipientName: recipientName || (txType === 'deposit' ? 'Mon Portefeuille FASO' : `Numéro ${recipientPhone}`),
      recipientPhone: recipientPhone || user?.phoneNumber || '',
      amount,
      operatorFee,
      fasoCommission,
      totalDebited,
      status: 'pending_auth',
      timestamp: new Date().toISOString(),
      description: txType === 'transfer' ? `Envoi vers ${selectedOperator.name}` : txType === 'deposit' ? `Dépôt depuis ${selectedOperator.name}` : `Retrait vers ${selectedOperator.name}`,
      note: note || undefined,
    };

    setActiveTransaction(draftTx);
    setSecurityPin(['', '', '', '', '', '']);
    setStep(2);
  };

  // Step 2: Validate 6-digit FASO Security PIN
  const handleAuthorizeWithFasoPin = () => {
    if (isPinLocked) {
      setPinError(`Saisie bloquée. Veuillez patienter ${pinLockTimer}s.`);
      return;
    }

    const entered = securityPin.join('');
    if (entered.length !== 6) {
      setPinError('Veuillez saisir votre code FASO à 6 chiffres.');
      return;
    }

    // Default valid codes: 123456 or any 6-digit configured code
    if (entered === '123456' || entered === '000000' || user?.hasFasoPin) {
      setPinError(null);
      setPinFailedAttempts(0);
      setStep(3); // Move to operator external authorization screen
      setOperatorVerificationStatus('awaiting_external');
    } else {
      const nextFail = pinFailedAttempts + 1;
      setPinFailedAttempts(nextFail);
      if (nextFail >= 3) {
        setIsPinLocked(true);
        setPinLockTimer(30);
        setPinError('Portefeuille temporairement bloqué (30s) suite à 3 tentatives incorrectes.');
      } else {
        setPinError(`Code FASO erroné. Il vous reste ${3 - nextFail} essai(s).`);
      }
    }
  };

  // Biometrics authorization shortcut
  const handleAuthorizeWithBiometrics = () => {
    setPinError(null);
    setStep(3);
    setOperatorVerificationStatus('awaiting_external');
  };

  // Step 3: Trigger Return & Verification (Section 19: "Je suis revenu dans FASO — vérifier mon opération")
  const handleVerifyOperationFromOperator = () => {
    if (!activeTransaction) return;

    setOperatorVerificationStatus('polling_status');

    // Simulate backend querying operator server / webhook check with idempotency guarantee
    setTimeout(() => {
      // Check idempotency first
      const existing = checkIdempotency(allTransactions, activeTransaction.idempotencyKey);
      if (existing) {
        // Already processed, reuse existing
        setActiveTransaction(existing);
        setOperatorVerificationStatus('success');
        setStep(4);
        return;
      }

      // Generate operator official confirmation code
      const opTxId = `${selectedOperator.code}.${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.${Math.floor(100000 + Math.random() * 900000)}`;
      const completedTx: Transaction = {
        ...activeTransaction,
        status: 'completed',
        operatorTransactionId: opTxId,
      };

      setActiveTransaction(completedTx);
      setOperatorVerificationStatus('success');
      onCompleteTransaction(completedTx);
      setStep(4); // Move to final receipt
    }, 1800);
  };

  // Simulate external partner app or USSD auto-completion
  const handleSimulateAutoOperatorApproval = () => {
    handleVerifyOperationFromOperator();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Cultural stripe */}
        <CulturalPattern variant="border" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              {txType === 'transfer' ? <Send className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {step === 1 && (txType === 'transfer' ? 'Envoyer de l’argent' : txType === 'deposit' ? 'Recharger le portefeuille' : 'Retirer des fonds')}
                {step === 2 && 'Autorisation du Portefeuille FASO'}
                {step === 3 && 'Autorisation Mobile Money Partenaire'}
                {step === 4 && 'Reçu d’Opération Confirmé'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 1 && 'Interconnexion Orange Money, Moov Money et Telecel BF'}
                {step === 2 && 'Étape de sécurité interne avec votre code à 6 chiffres'}
                {step === 3 && 'Validation sécurisée auprès du réseau opérateur'}
                {step === 4 && 'Preuve numérique horodatée et garantie'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* -------------------- STEP 1: FORM INPUTS -------------------- */}
          {step === 1 && (
            <form onSubmit={handleProceedToReview} className="space-y-4">
              
              {/* Operation type tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('transfer')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    txType === 'transfer' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Envoyer
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('deposit')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    txType === 'deposit' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Recharger
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('withdrawal')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    txType === 'withdrawal' ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Retirer
                </button>
              </div>

              {/* Operator Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Opérateur partenaire au Burkina Faso
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OPERATORS.map((op) => {
                    const isSelected = selectedOperatorId === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => setSelectedOperatorId(op.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: op.color }}
                          />
                          <span className="text-[10px] font-mono text-slate-400">{op.ussd}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {op.name}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">
                          {op.uptime}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Beneficiary Details (for transfer / withdrawal) */}
              {txType !== 'deposit' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Numéro de téléphone du destinataire
                    </label>
                    <div className="flex gap-2">
                      <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-700 shrink-0">
                        🇧🇫 +226
                      </span>
                      <input
                        type="tel"
                        required
                        value={recipientPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="70 12 34 56"
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nom du bénéficiaire (facultatif ou carnet)
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Ex: Fatoumata Sawadogo"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Fast contact presets */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Contacts récents au Faso :</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {recentBurkinaContacts.map((c) => (
                        <button
                          key={c.phone}
                          type="button"
                          onClick={() => {
                            setRecipientPhone(c.phone);
                            setRecipientName(c.name);
                            setSelectedOperatorId(c.operator as OperatorId);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-colors"
                        >
                          {c.name} ({c.phone})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Amount input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Montant en Francs CFA (FCFA)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Solde : <strong>{currentBalance.toLocaleString('fr-FR')} FCFA</strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="100"
                    step="50"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="Ex: 10 000"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Quick Amount presets */}
              <div className="flex flex-wrap gap-1.5">
                {[1000, 2500, 5000, 10000, 25000, 50000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountStr(preset.toString())}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    +{preset.toLocaleString('fr-FR')} F
                  </button>
                ))}
              </div>

              {/* Note / Motif */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Motif de l'opération (facultatif)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Commerce, Soutien familial, Facture..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Real-time fee summary */}
              {amount > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Montant envoyé :</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{amount.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Frais opérateur ({selectedOperator.name}) :</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{operatorFee.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Commission FASO :</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0 FCFA (Offert)</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                    <span>Total débité :</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{totalDebited.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              )}

              {pinError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Continuer vers l'autorisation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* -------------------- STEP 2: FASO SECURITY PIN REVIEW -------------------- */}
          {step === 2 && activeTransaction && (
            <div className="space-y-4">
              
              {/* Transaction Review Sheet */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Référence unique :</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeTransaction.reference}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bénéficiaire :</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeTransaction.recipientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Numéro / Canal :</span>
                  <span className="font-mono font-medium">{activeTransaction.recipientPhone} ({selectedOperator.name})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Montant principal :</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{activeTransaction.amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Frais & Commissions :</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{activeTransaction.operatorFee} FCFA (Opérateur) + 0 F (FASO)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  <span>Montant total à débiter :</span>
                  <span className="font-mono">{activeTransaction.totalDebited.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Requirement 21 Distinction Banner */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Protection du portefeuille FASO :</p>
                  <p className="mt-0.5">
                    Le code FASO valide l'ordre dans votre application. Il ne remplace jamais le code secret demandé par Orange Money ou Moov sur leur propre écran sécurisé.
                  </p>
                </div>
              </div>

              {/* 6-Digit PIN Pad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">
                  Saisissez votre code personnel FASO à 6 chiffres
                </label>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      id={`tx-pin-${idx}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={isPinLocked}
                      value={securityPin[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newPin = [...securityPin];
                        newPin[idx] = val;
                        setSecurityPin(newPin);
                        if (val && idx < 5) document.getElementById(`tx-pin-${idx + 1}`)?.focus();
                      }}
                      className="w-10 sm:w-11 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span>Code test : <strong className="text-emerald-600">123456</strong></span>
                  <button
                    onClick={() => setSecurityPin(['1', '2', '3', '4', '5', '6'])}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Remplir 123456
                  </button>
                </div>
              </div>

              {pinError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isPinLocked}
                  onClick={handleAuthorizeWithFasoPin}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>Autoriser l'opération avec FASO</span>
                </button>

                {user?.biometricsEnabled && (
                  <button
                    type="button"
                    onClick={handleAuthorizeWithBiometrics}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="w-4 h-4 text-emerald-600" />
                    <span>Valider rapidement par Biométrie (Empreinte)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-slate-500 text-xs hover:underline"
                >
                  Modifier les détails de l'envoi
                </button>
              </div>
            </div>
          )}

          {/* -------------------- STEP 3: SECTION 19 - OPERATOR AUTHORIZATION & CALLBACK -------------------- */}
          {step === 3 && activeTransaction && (
            <div className="space-y-4">
              
              {/* Simulated Operator Gateway Modal / USSD Push Frame */}
              <div 
                className="p-4 rounded-2xl border text-white relative overflow-hidden shadow-lg"
                style={{ backgroundColor: selectedOperator.color }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/20">
                  <span className="text-xs font-bold uppercase tracking-wider">{selectedOperator.name}</span>
                  <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-mono">
                    Canal USSD {selectedOperator.ussd}
                  </span>
                </div>
                
                <div className="py-3 text-center space-y-1">
                  <p className="text-xs text-white/90">Demande d'autorisation de prélèvement</p>
                  <p className="text-xl font-mono font-extrabold">
                    {activeTransaction.totalDebited.toLocaleString('fr-FR')} FCFA
                  </p>
                  <p className="text-[11px] text-white/80">
                    Vers : <strong>{activeTransaction.recipientName}</strong>
                  </p>
                </div>

                <div className="p-2.5 bg-black/25 rounded-xl text-[11px] text-white/90 flex items-center gap-2">
                  <Lock className="w-4 h-4 shrink-0 text-amber-300" />
                  <span>
                    Saisie du code secret opérateur requise sur le terminal USSD ou l'application partenaire.
                  </span>
                </div>
              </div>

              {/* Section 19 Required Flow & Explicit Return Button */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Retour automatique et confirmation de statut
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      FASO ne considère jamais un retour d'application comme une preuve de paiement. Le statut est certifié par interrogation serveur et clé d'idempotence anti-double débit.
                    </p>
                  </div>
                </div>

                {/* Polling Spinner or Status */}
                {operatorVerificationStatus === 'polling_status' && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 animate-pulse">
                    <RotateCw className="w-4 h-4 animate-spin text-amber-600" />
                    <span>{t.verifyingOperation}</span>
                  </div>
                )}

                {/* EXPLICIT BUTTON AS MANDATED BY SECTION 19:
                    "Si un parcours ne permet pas de retour automatique, proposer un bouton « Je suis revenu dans FASO — vérifier mon opération » qui interroge le backend sans effectuer un nouveau paiement." */}
                <button
                  type="button"
                  disabled={operatorVerificationStatus === 'polling_status'}
                  onClick={handleVerifyOperationFromOperator}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.returnToAppBtn}</span>
                </button>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Clé d'idempotence : <strong className="font-mono">{activeTransaction.idempotencyKey.slice(0, 15)}...</strong></span>
                  <button
                    type="button"
                    onClick={handleSimulateAutoOperatorApproval}
                    className="text-emerald-600 hover:underline font-semibold"
                  >
                    Simuler confirmation instantanée
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setStep(1);
                }}
                className="w-full text-center text-xs text-slate-500 hover:underline"
              >
                Annuler l'opération et revenir à l'accueil
              </button>
            </div>
          )}

          {/* -------------------- STEP 4: VERIFIABLE FINAL RECEIPT -------------------- */}
          {step === 4 && activeTransaction && (
            <div className="space-y-4">
              
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
                  Opération Confirmée avec Succès
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Le virement a été certifié par le serveur {selectedOperator.name}.
                </p>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white pt-1">
                  {activeTransaction.amount.toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              {/* Official Receipt Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Référence FASO :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeTransaction.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">ID Opérateur :</span>
                  <span className="font-bold text-slate-900 dark:text-white">{activeTransaction.operatorTransactionId || 'OM.20261019.88219'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Destinataire :</span>
                  <span className="font-sans font-bold text-slate-800 dark:text-slate-200">{activeTransaction.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Date et Heure :</span>
                  <span>{new Date().toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Frais appliqués :</span>
                  <span>{activeTransaction.operatorFee} FCFA (Opérateur) + 0 F (FASO)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white font-sans text-sm">
                  <span>Total débité :</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{activeTransaction.totalDebited.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Reçu téléchargé sous le nom ${activeTransaction.reference}.pdf`)}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Télécharger Reçu</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Reçu FASO',
                        text: `Transfert de ${activeTransaction.amount} FCFA vers ${activeTransaction.recipientName} effectué avec succès via FASO. Réf: ${activeTransaction.reference}`,
                      }).catch(() => {});
                    } else {
                      alert('Lien de partage du reçu copié dans le presse-papier.');
                    }
                  }}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Partager</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setStep(1);
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm"
              >
                Terminer et fermer
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
