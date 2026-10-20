import React, { useState } from 'react';
import { UserProfile, LoanApplication, LoanScheduleItem, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { CulturalPattern } from './CulturalPattern';
import { 
  Calculator, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Calendar, 
  Percent, 
  Coins, 
  Building, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  Receipt,
  Download,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface CreditModuleProps {
  user: UserProfile | null;
  loans: LoanApplication[];
  onApplyLoan: (loan: LoanApplication) => void;
  onRepayInstallment: (loanId: string, amount: number) => void;
  lang?: Language;
}

export const CreditModule: React.FC<CreditModuleProps> = ({
  user,
  loans,
  onApplyLoan,
  onRepayInstallment,
  lang = 'fr',
}) => {
  const t = TRANSLATIONS[lang];

  // Tab: 'simulator' | 'my_loans' | 'application_form'
  const [activeTab, setActiveTab] = useState<'simulator' | 'my_loans' | 'application_form'>('simulator');

  // Simulation Parameters
  const [simAmount, setSimAmount] = useState<number>(100000);
  const [simDuration, setSimDuration] = useState<number>(3); // months
  const interestRateMonthly = 3.5; // 3.5% indicative monthly conforming with BCEAO usury limits
  const processingFee = 1500; // 1500 FCFA

  // Calculations
  const totalInterest = Math.round(simAmount * (interestRateMonthly / 100) * simDuration);
  const totalToRepay = simAmount + totalInterest;
  const monthlyInstallment = Math.round(totalToRepay / simDuration);

  // Application Form State
  const [purpose, setPurpose] = useState<string>('Commerce de proximité / Marché');
  const [monthlyIncome, setMonthlyIncome] = useState<string>('150000');
  const [idConfirmed, setIdConfirmed] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [applicationSuccess, setApplicationSuccess] = useState<boolean>(false);

  // Selected active loan detail modal
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);

  // Generate draft schedule
  const generateSchedule = (amount: number, months: number): LoanScheduleItem[] => {
    const list: LoanScheduleItem[] = [];
    const monthlyPrincipal = Math.round(amount / months);
    const monthlyInt = Math.round((amount * (interestRateMonthly / 100)));

    for (let i = 1; i <= months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      list.push({
        installmentNumber: i,
        dueDate: d.toISOString().slice(0, 10),
        amount: monthlyPrincipal + monthlyInt,
        principal: monthlyPrincipal,
        interest: monthlyInt,
        status: i === 1 ? 'pending' : 'upcoming',
      });
    }
    return list;
  };

  // Submit Application
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !idConfirmed) {
      alert('Veuillez accepter les conditions et confirmer l’exactitude de vos justificatifs.');
      return;
    }

    const schedule = generateSchedule(simAmount, simDuration);
    const newLoan: LoanApplication = {
      id: `loan-${Date.now()}`,
      reference: `CR-BF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: simAmount,
      termMonths: simDuration,
      interestRate: interestRateMonthly,
      processingFee,
      monthlyInstallment,
      totalToRepay,
      purpose,
      lenderName: 'Partenaire Microfinance FASO Solidaire (Agrément BCEAO)',
      isSimulationOnly: true,
      status: 'under_review',
      appliedAt: new Date().toISOString(),
      remainingBalance: totalToRepay,
      nextPaymentDueDate: schedule[0]?.dueDate,
      schedule,
    };

    onApplyLoan(newLoan);
    setApplicationSuccess(true);
    setTimeout(() => {
      setApplicationSuccess(false);
      setActiveTab('my_loans');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      
      {/* SECTION 22 MANDATORY COMPLIANCE BANNER */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs shadow-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wide text-amber-800 dark:text-amber-300">
              Mention Légale Obligatoire
            </span>
            <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-bold">
              Simulation
            </span>
          </div>
          <p className="mt-1 leading-relaxed">
            {t.simulationNotice}. FASO n'invente aucun prêteur automatique. L'octroi réel dépend de la vérification de solvabilité et de l'approbation d'un établissement de microfinance agréé au Burkina Faso. Vos données personnelles et SMS privés ne sont jamais scrutés sans consentement.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'simulator'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Simuler mon emprunt</span>
        </button>
        <button
          onClick={() => setActiveTab('my_loans')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'my_loans'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Mes dossiers & Prêts ({loans.length})</span>
        </button>
      </div>

      {/* -------------------- TAB 1: INTERACTIVE SIMULATOR -------------------- */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Controls Column */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Paramètres de Simulation
                </h3>
                <p className="text-xs text-slate-500">
                  Micro-crédit solidaire pour activités économiques
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Taux {interestRateMonthly}% / mois
              </span>
            </div>

            {/* Amount Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Montant souhaité :</span>
                <span className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {simAmount.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <input
                type="range"
                min="15000"
                max="500000"
                step="5000"
                value={simAmount}
                onChange={(e) => setSimAmount(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                <span>Min: 15 000 F</span>
                <span>Max: 500 000 F</span>
              </div>
            </div>

            {/* Duration Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Durée de remboursement :
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSimDuration(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      simDuration === m
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {m} {m === 1 ? 'mois' : 'mois'}
                  </button>
                ))}
              </div>
            </div>

            {/* Partner Identity */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Identité du prêteur partenaire :</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Réseau de Microfinance Solidaire du Burkina Faso (En phase pilote)
              </p>
              <p className="text-[11px] text-slate-400">
                Agrément BCEAO en cours de déploiement pour Ouagadougou et Bobo-Dioulasso.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('application_form')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span>Déposer ma demande d'emprunt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Results & Schedule Column */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-lg flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span>Échéancier indicatif</span>
                <span className="font-mono text-emerald-400">{simDuration} mensualités</span>
              </div>

              <div className="py-4 text-center">
                <p className="text-xs text-slate-400">Mensualité estimée :</p>
                <p className="text-3xl font-extrabold font-mono text-white mt-1">
                  {monthlyInstallment.toLocaleString('fr-FR')} <span className="text-base text-emerald-400 font-sans">FCFA</span>
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between text-slate-400">
                  <span>Capital emprunté :</span>
                  <span className="font-mono text-white">{simAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total intérêts ({interestRateMonthly}%/m) :</span>
                  <span className="font-mono text-white">{totalInterest.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frais de dossier :</span>
                  <span className="font-mono text-white">{processingFee.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                  <span className="text-emerald-400">Montant total dû :</span>
                  <span className="font-mono text-emerald-400">{totalToRepay.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            </div>

            {/* Mini Schedule Preview */}
            <div className="p-3 bg-slate-800/80 rounded-xl space-y-1.5 text-[11px]">
              <p className="font-bold text-slate-300">Aperçu des dates de paiement :</p>
              {generateSchedule(simAmount, simDuration).slice(0, 3).map((item) => (
                <div key={item.installmentNumber} className="flex justify-between text-slate-400">
                  <span>Mois {item.installmentNumber} ({item.dueDate}) :</span>
                  <span className="font-mono text-white">{item.amount.toLocaleString('fr-FR')} F</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* -------------------- TAB 2: APPLICATION FORM -------------------- */}
      {activeTab === 'application_form' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Dossier de Demande d'Emprunt
              </h3>
              <p className="text-xs text-slate-500">
                Montant simulé : <strong className="text-emerald-600">{simAmount.toLocaleString('fr-FR')} FCFA</strong> sur {simDuration} mois
              </p>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="text-xs text-slate-500 hover:underline"
            >
              Modifier la simulation
            </button>
          </div>

          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Motif principal du financement
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Commerce de proximité / Marché">Commerce de proximité / Ravitaillement marché</option>
                <option value="Campagne agricole / Semences">Campagne agricole / Engrais & semences</option>
                <option value="Équipement artisanal / Outillage">Équipement artisanal / Métier à tisser Dan Fani</option>
                <option value="Frais de scolarité / Urgence familiale">Frais de scolarité / Santé familiale</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Revenu mensuel moyen estimé (FCFA)
              </label>
              <input
                type="number"
                required
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>

            {/* Consent checks */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={idConfirmed}
                  onChange={(e) => setIdConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Je certifie que les informations fournies correspondent à ma situation et que mon numéro de téléphone {user?.phoneNumber} est bien enregistré à mon nom.
                </span>
              </label>

              <label className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  J’ai pris connaissance des conditions financières (taux {interestRateMonthly}%, mensualité {monthlyInstallment} F) et j'accepte que mon dossier soit instruit en mode <strong>Simulation Partenaire</strong>.
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Transmettre ma demande d'emprunt</span>
            </button>
          </form>
        </div>
      )}

      {/* -------------------- TAB 3: USER'S PERSONAL LOAN HUB -------------------- */}
      {activeTab === 'my_loans' && (
        <div className="space-y-4">
          {loans.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Coins className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Aucune demande d'emprunt enregistrée
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Utilisez le simulateur pour évaluer vos échéances et soumettre votre premier dossier.
              </p>
              <button
                onClick={() => setActiveTab('simulator')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Lancer une simulation
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-500">{loan.reference}</span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {loan.purpose}
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {loan.status === 'under_review' ? 'En étude' : loan.status === 'simulated' ? 'Simulation active' : 'Approuvé'}
                    </span>
                  </div>

                  {/* Numbers */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs">
                    <div>
                      <p className="text-slate-500">Capital prêté :</p>
                      <p className="font-bold font-mono text-slate-900 dark:text-white">{loan.amount.toLocaleString('fr-FR')} F</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Restant dû :</p>
                      <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{loan.remainingBalance.toLocaleString('fr-FR')} F</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Mensualité :</p>
                      <p className="font-bold font-mono text-slate-800 dark:text-slate-200">{loan.monthlyInstallment.toLocaleString('fr-FR')} F</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Prochaine échéance :</p>
                      <p className="font-mono text-slate-800 dark:text-slate-200">{loan.nextPaymentDueDate || '10/11/2026'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Échéancier & Reçus</span>
                    </button>

                    <button
                      onClick={() => onRepayInstallment(loan.id, loan.monthlyInstallment)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rembourser ({loan.monthlyInstallment.toLocaleString('fr-FR')} F)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detailed Loan Schedule & Receipts Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Échéancier & Contrat Prêt
                </h3>
                <p className="text-xs font-mono text-slate-500">{selectedLoan.reference}</p>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tableau d'amortissement prévisionnel
              </h4>
              <div className="space-y-1.5">
                {selectedLoan.schedule.map((item) => (
                  <div
                    key={item.installmentNumber}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Échéance #{item.installmentNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 block font-sans">
                        Date limite : {item.dueDate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {item.amount.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className={`block text-[10px] font-bold uppercase ${
                        item.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {item.status === 'paid' ? 'Réglé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold">Conditions générales acceptées :</p>
              <p>• Taux conventionnel : {selectedLoan.interestRate}% par mois</p>
              <p>• Prélèvement direct ou remboursement anticipé sans pénalité</p>
            </div>

            <button
              onClick={() => setSelectedLoan(null)}
              className="w-full py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 font-bold text-xs rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
