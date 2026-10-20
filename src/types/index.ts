export type Language = 'fr' | 'mo' | 'di' | 'fu';

export type OperatorId = 'orange' | 'moov' | 'telecel' | 'bank';

export interface Operator {
  id: OperatorId;
  name: string;
  code: string;
  color: string;
  accentColor: string;
  prefix: string[];
  ussd: string;
  status: 'operational' | 'degraded' | 'maintenance';
  uptime: string;
}

export type VerificationTier = 'tier1' | 'tier2';

export interface ConnectedDevice {
  id: string;
  name: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddress: string;
}

export interface LoginAudit {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  status: 'success' | 'failed' | 'otp_required';
  method: 'pin' | 'biometric' | 'otp_recovery';
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  countryCode: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  city: string;
  profession: string;
  avatarUrl: string;
  verificationTier: VerificationTier;
  idDocumentType?: 'cnib' | 'passport';
  idDocumentNumber?: string;
  hasFasoPin: boolean;
  biometricsEnabled: boolean;
  autoLockMinutes: number;
  hideBalanceDefault: boolean;
  culturalAnimations: boolean;
  theme: 'light' | 'dark' | 'system';
  textSize: 'standard' | 'large' | 'xlarge';
  language: Language;
  createdAt: string;
  devices: ConnectedDevice[];
  loginHistory: LoginAudit[];
}

export type TransactionType = 'transfer' | 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'bill_payment';
export type TransactionStatus = 'pending_auth' | 'verifying' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  reference: string;
  idempotencyKey: string;
  type: TransactionType;
  operatorId: OperatorId;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  operatorFee: number;
  fasoCommission: number;
  totalDebited: number;
  status: TransactionStatus;
  timestamp: string;
  description: string;
  operatorTransactionId?: string;
  note?: string;
}

export type LoanStatus = 'simulated' | 'under_review' | 'approved' | 'active' | 'repaid' | 'rejected';

export interface LoanScheduleItem {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  status: 'paid' | 'pending' | 'upcoming';
}

export interface LoanApplication {
  id: string;
  reference: string;
  amount: number;
  termMonths: number;
  interestRate: number; // e.g., 3.5%
  processingFee: number; // e.g., 1500 FCFA
  monthlyInstallment: number;
  totalToRepay: number;
  purpose: string;
  lenderName: string;
  isSimulationOnly: boolean;
  status: LoanStatus;
  appliedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  remainingBalance: number;
  nextPaymentDueDate?: string;
  schedule: LoanScheduleItem[];
}

export type TicketStatus = 'received' | 'in_progress' | 'awaiting_info' | 'resolved';
export type TicketCategory = 'payment_issue' | 'delay' | 'wrong_number' | 'login_security' | 'loan' | 'other';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: TicketCategory;
  transactionRef?: string;
  description: string;
  screenshotAttached: boolean;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedAgent?: string;
  internalNotes?: string;
  resolutionNote?: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  walletBalance: number;
  transactions: Transaction[];
  loans: LoanApplication[];
  tickets: SupportTicket[];
  feedbacks: UserFeedback[];
  tempRegistration: {
    phoneNumber: string;
    countryCode: string;
    otpSent?: string;
    otpExpiry?: number;
    agreedToTerms: boolean;
  } | null;
}
