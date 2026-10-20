import { AppState, UserProfile, Transaction, LoanApplication, SupportTicket, UserFeedback } from '../types';

const STORAGE_KEY = 'faso_applet_state_v1';

// Simple fast SHA-256 equivalent mock for browser storage (never stored in clear text)
export const hashPin = (pin: string): string => {
  let hash = 0;
  const salt = 'faso_bf_salt_2026_';
  const str = salt + pin;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
};

const DEFAULT_USER: UserProfile = {
  id: 'usr-bf-77821',
  phoneNumber: '70234567',
  countryCode: '+226',
  fullName: 'Ousmane Ouédraogo',
  firstName: 'Ousmane',
  lastName: 'Ouédraogo',
  email: 'ousmane.ouedraogo@faso.bf',
  city: 'Ouagadougou',
  profession: 'Commerçant / Entrepreneur',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  verificationTier: 'tier1',
  hasFasoPin: true,
  biometricsEnabled: true,
  autoLockMinutes: 5,
  hideBalanceDefault: false,
  culturalAnimations: true,
  theme: 'light',
  textSize: 'standard',
  language: 'fr',
  createdAt: '2026-02-14T08:30:00Z',
  devices: [
    {
      id: 'dev-1',
      name: 'Tecno Camon 20 Pro (Cet appareil)',
      deviceType: 'mobile',
      location: 'Ouagadougou, Burkina Faso',
      lastActive: 'À l’instant',
      isCurrent: true,
      ipAddress: '197.239.68.14',
    },
    {
      id: 'dev-2',
      name: 'Samsung Galaxy A14',
      deviceType: 'mobile',
      location: 'Bobo-Dioulasso, Burkina Faso',
      lastActive: 'Il y a 3 jours',
      isCurrent: false,
      ipAddress: '197.239.71.88',
    },
    {
      id: 'dev-3',
      name: 'Navigateur Web Chrome (Boutique)',
      deviceType: 'desktop',
      location: 'Ouagadougou, Zone 1',
      lastActive: 'Il y a 1 semaine',
      isCurrent: false,
      ipAddress: '41.138.89.2',
    },
  ],
  loginHistory: [
    {
      id: 'aud-1',
      timestamp: '2026-10-19T18:45:00Z',
      device: 'Tecno Camon 20 Pro',
      location: 'Ouagadougou, secteur 28',
      status: 'success',
      method: 'biometric',
    },
    {
      id: 'aud-2',
      timestamp: '2026-10-18T10:12:00Z',
      device: 'Tecno Camon 20 Pro',
      location: 'Ouagadougou, secteur 28',
      status: 'success',
      method: 'pin',
    },
    {
      id: 'aud-3',
      timestamp: '2026-10-16T15:30:00Z',
      device: 'Samsung Galaxy A14',
      location: 'Bobo-Dioulasso, Koko',
      status: 'success',
      method: 'pin',
    },
  ],
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    reference: 'TXN-BF-20261019-8921',
    idempotencyKey: 'idem-8921-om-01',
    type: 'transfer',
    operatorId: 'orange',
    recipientName: 'Fatoumata Sawadogo',
    recipientPhone: '76123456',
    amount: 15000,
    operatorFee: 150,
    fasoCommission: 0,
    totalDebited: 15150,
    status: 'completed',
    timestamp: '2026-10-19T14:32:00Z',
    description: 'Envoi d’argent vers Orange Money',
    operatorTransactionId: 'OM.20261019.448921',
    note: 'Frais scolaires Ouaga',
  },
  {
    id: 'tx-2',
    reference: 'TXN-BF-20261018-7104',
    idempotencyKey: 'idem-7104-mv-02',
    type: 'deposit',
    operatorId: 'moov',
    recipientName: 'Approvisionnement Portefeuille',
    recipientPhone: '70234567',
    amount: 50000,
    operatorFee: 0,
    fasoCommission: 0,
    totalDebited: 50000,
    status: 'completed',
    timestamp: '2026-10-18T09:15:00Z',
    description: 'Rechargement depuis Moov Money BF',
    operatorTransactionId: 'MM.20261018.11204',
  },
  {
    id: 'tx-3',
    reference: 'TXN-BF-20261016-5519',
    idempotencyKey: 'idem-5519-tc-03',
    type: 'transfer',
    operatorId: 'telecel',
    recipientName: 'Ibrahim Traoré (Fournisseur)',
    recipientPhone: '68901234',
    amount: 25000,
    operatorFee: 200,
    fasoCommission: 0,
    totalDebited: 25200,
    status: 'completed',
    timestamp: '2026-10-16T16:40:00Z',
    description: 'Règlement commande tissus Dan Fani',
    operatorTransactionId: 'TC.20261016.9912',
  },
  {
    id: 'tx-4',
    reference: 'TXN-BF-20261015-3390',
    idempotencyKey: 'idem-3390-sn-04',
    type: 'bill_payment',
    operatorId: 'orange',
    recipientName: 'SONABEL Énergie Burkina',
    recipientPhone: 'SONABEL-POL-04',
    amount: 18500,
    operatorFee: 100,
    fasoCommission: 0,
    totalDebited: 18600,
    status: 'completed',
    timestamp: '2026-10-15T11:20:00Z',
    description: 'Paiement Facture Électricité Sonabel',
    operatorTransactionId: 'OM.20261015.33901',
  },
];

const DEFAULT_LOANS: LoanApplication[] = [
  {
    id: 'loan-sim-01',
    reference: 'SIM-CR-2026-0041',
    amount: 100000,
    termMonths: 3,
    interestRate: 3.5,
    processingFee: 1500,
    monthlyInstallment: 35667,
    totalToRepay: 107000,
    purpose: 'Campagne agricole / Maraîchage',
    lenderName: 'Partenaire Microfinance FASO Solidaire (Agrément BCEAO en cours)',
    isSimulationOnly: true,
    status: 'simulated',
    appliedAt: '2026-10-10T11:00:00Z',
    remainingBalance: 107000,
    schedule: [
      { installmentNumber: 1, dueDate: '2026-11-10', amount: 35667, principal: 33333, interest: 2334, status: 'pending' },
      { installmentNumber: 2, dueDate: '2026-12-10', amount: 35667, principal: 33333, interest: 2334, status: 'upcoming' },
      { installmentNumber: 3, dueDate: '2027-01-10', amount: 35666, principal: 33334, interest: 2332, status: 'upcoming' },
    ],
  },
];

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-BF-8821',
    userId: 'usr-bf-77821',
    userName: 'Ousmane Ouédraogo',
    userPhone: '+226 70234567',
    category: 'payment_issue',
    transactionRef: 'TXN-BF-20261016-5519',
    description: 'Le transfert Telecel a mis 15 minutes avant confirmation mais a bien été débité.',
    screenshotAttached: false,
    status: 'resolved',
    createdAt: '2026-10-16T17:00:00Z',
    updatedAt: '2026-10-16T17:45:00Z',
    assignedAgent: 'Kadiatou Diallo (Support Ouaga)',
    internalNotes: 'Vérification log opérateur Telecel : pic de charge réseau résolu.',
    resolutionNote: 'Opération confirmée et rapprochée avec le destinataire.',
  },
];

export const getInitialState = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: parsed.user ?? DEFAULT_USER,
        isAuthenticated: true,
        isLocked: false,
        walletBalance: parsed.walletBalance ?? 142500,
        transactions: parsed.transactions ?? DEFAULT_TRANSACTIONS,
        loans: parsed.loans ?? DEFAULT_LOANS,
        tickets: parsed.tickets ?? DEFAULT_TICKETS,
        feedbacks: parsed.feedbacks ?? [],
        tempRegistration: null,
      };
    }
  } catch (e) {
    console.warn('Failed to parse state from localStorage', e);
  }

  return {
    user: DEFAULT_USER,
    isAuthenticated: true,
    isLocked: false,
    walletBalance: 142500,
    transactions: DEFAULT_TRANSACTIONS,
    loans: DEFAULT_LOANS,
    tickets: DEFAULT_TICKETS,
    feedbacks: [],
    tempRegistration: null,
  };
};

export const saveState = (state: AppState) => {
  try {
    const stateToSave = {
      user: state.user,
      walletBalance: state.walletBalance,
      transactions: state.transactions,
      loans: state.loans,
      tickets: state.tickets,
      feedbacks: state.feedbacks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
};

export const resetToDefaults = (): AppState => {
  localStorage.removeItem(STORAGE_KEY);
  return {
    user: DEFAULT_USER,
    isAuthenticated: true,
    isLocked: false,
    walletBalance: 142500,
    transactions: DEFAULT_TRANSACTIONS,
    loans: DEFAULT_LOANS,
    tickets: DEFAULT_TICKETS,
    feedbacks: [],
    tempRegistration: null,
  };
};

// Check if an idempotency key was already processed
export const checkIdempotency = (transactions: Transaction[], idempotencyKey: string): Transaction | undefined => {
  return transactions.find((t) => t.idempotencyKey === idempotencyKey && t.status === 'completed');
};
