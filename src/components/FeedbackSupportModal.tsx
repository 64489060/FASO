import React, { useState } from 'react';
import { UserProfile, SupportTicket, UserFeedback, TicketCategory, TicketStatus, Transaction, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { CulturalPattern } from './CulturalPattern';
import { 
  Star, 
  AlertCircle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Upload, 
  ShieldAlert, 
  X, 
  Send, 
  UserCheck, 
  Search,
  Filter,
  FileText
} from 'lucide-react';

interface FeedbackSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  transactions: Transaction[];
  tickets: SupportTicket[];
  feedbacks: UserFeedback[];
  onAddTicket: (ticket: SupportTicket) => void;
  onUpdateTicket: (ticket: SupportTicket) => void;
  onAddFeedback: (feedback: UserFeedback) => void;
  initialTab?: 'feedback' | 'report' | 'my_tickets' | 'admin_console';
  lang?: Language;
}

export const FeedbackSupportModal: React.FC<FeedbackSupportModalProps> = ({
  isOpen,
  onClose,
  user,
  transactions,
  tickets,
  feedbacks,
  onAddTicket,
  onUpdateTicket,
  onAddFeedback,
  initialTab = 'report',
  lang = 'fr',
}) => {
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = useState<'feedback' | 'report' | 'my_tickets' | 'admin_console'>(initialTab);

  // Feedback State
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Rapidité']);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Ticket / Report State
  const [ticketCategory, setTicketCategory] = useState<TicketCategory>('payment_issue');
  const [linkedTxRef, setLinkedTxRef] = useState<string>('');
  const [ticketDescription, setTicketDescription] = useState<string>('');
  const [screenshotAttached, setScreenshotAttached] = useState<boolean>(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Admin Agent Console State
  const [selectedTicketForAdmin, setSelectedTicketForAdmin] = useState<SupportTicket | null>(null);
  const [adminAgentName, setAdminAgentName] = useState<string>('Kadiatou Diallo (Support FASO Ouaga)');
  const [adminInternalNotes, setAdminInternalNotes] = useState<string>('');
  const [adminResolutionNote, setAdminResolutionNote] = useState<string>('');
  const [adminNewStatus, setAdminNewStatus] = useState<TicketStatus>('in_progress');

  if (!isOpen || !user) return null;

  // Available feedback tags
  const feedbackTags = [
    'Rapidité d’exécution',
    'Frais transparents',
    'Sécurité du portefeuille',
    'Facilité d’utilisation',
    'Bonne interconnexion Orange/Moov/Telecel',
    'Support réactif',
  ];

  // Submit Feedback
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const fb: UserFeedback = {
      id: `fb-${Date.now()}`,
      userId: user.id,
      rating,
      tags: selectedTags,
      comment: feedbackComment,
      createdAt: new Date().toISOString(),
    };
    onAddFeedback(fb);
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackComment('');
      onClose();
    }, 1500);
  };

  // Submit Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) {
      alert('Veuillez décrire le problème rencontré.');
      return;
    }

    const ticketId = `TICK-BF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      id: ticketId,
      userId: user.id,
      userName: user.fullName,
      userPhone: `${user.countryCode} ${user.phoneNumber}`,
      category: ticketCategory,
      transactionRef: linkedTxRef || undefined,
      description: ticketDescription,
      screenshotAttached,
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onAddTicket(newTicket);
    setCreatedTicketId(ticketId);
    setTimeout(() => {
      setCreatedTicketId(null);
      setTicketDescription('');
      setActiveTab('my_tickets');
    }, 1800);
  };

  // Admin save ticket update
  const handleSaveAdminUpdate = () => {
    if (!selectedTicketForAdmin) return;
    const updated: SupportTicket = {
      ...selectedTicketForAdmin,
      assignedAgent: adminAgentName,
      internalNotes: adminInternalNotes || selectedTicketForAdmin.internalNotes,
      resolutionNote: adminResolutionNote || selectedTicketForAdmin.resolutionNote,
      status: adminNewStatus,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTicket(updated);
    setSelectedTicketForAdmin(null);
    alert('Ticket mis à jour dans la console superviseur.');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Reçu</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">En cours de traitement</span>;
      case 'awaiting_info':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">En attente d'informations</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Résolu</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Cultural stripe */}
        <CulturalPattern variant="border" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Retours Utilisateurs & Assistance Technique
            </h2>
            <p className="text-xs text-slate-500">
              Assistance officielle du Burkina Faso • Rapprochements Mobile Money
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 gap-1 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'report' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Signaler un problème
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'feedback' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Donner mon avis
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'my_tickets' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span>Mes réclamations</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px]">
              {tickets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('admin_console')}
            className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'admin_console' ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shadow-xs font-bold' : 'text-slate-500'
            }`}
            title="Console Agent Support (Exigence 23)"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Console Superviseur ({tickets.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* ==================== TAB 1: SIGNALER UN PROBLÈME (SECTION 23) ==================== */}
          {activeTab === 'report' && (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nature de la difficulté
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  <option value="payment_issue">Difficulté de paiement ou débit non confirmé</option>
                  <option value="delay">Délai anormalement long de réception</option>
                  <option value="wrong_number">Erreur de numéro de bénéficiaire</option>
                  <option value="login_security">Connexion ou sécurité du portefeuille</option>
                  <option value="loan">Question relative au simulateur de crédit</option>
                  <option value="other">Autre réclamation technique</option>
                </select>
              </div>

              {/* Transaction Reference link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Associer une transaction récente (facultatif)
                </label>
                <select
                  value={linkedTxRef}
                  onChange={(e) => setLinkedTxRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
                >
                  <option value="">-- Aucune transaction sélectionnée --</option>
                  {transactions.map((tx) => (
                    <option key={tx.id} value={tx.reference}>
                      {tx.reference} — {tx.amount.toLocaleString('fr-FR')} F ({tx.recipientName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description détaillée du problème
                </label>
                <textarea
                  required
                  rows={4}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Décrivez précisément ce qui s’est produit (heure, message affiché, opérateur utilisé...)"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* SECTION 23 MANDATORY WARNING ON SENSITIVE DATA IN SCREENSHOTS */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Avertissement strict de sécurité :</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Avant de joindre toute capture d'écran, veillez à <strong>masquer impérativement vos codes secrets (PIN, OTP) et numéros bancaires sensibles</strong>. FASO ne vous demandera jamais votre code par message.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={screenshotAttached}
                    onChange={(e) => setScreenshotAttached(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-white">
                    Simuler l'ajout d'une capture d'écran (anonymisée)
                  </span>
                </label>
              </div>

              {/* Success confirmation note */}
              {createdTicketId && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Signalement enregistré sous l'identifiant <strong>{createdTicketId}</strong>.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Transmettre mon signalement au support</span>
              </button>
            </form>
          )}

          {/* ==================== TAB 2: DONNER MON AVIS ==================== */}
          {activeTab === 'feedback' && (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="text-center py-2 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Comment évaluez-vous votre expérience sur FASO ?
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {rating === 5 ? 'Excellent !' : rating === 4 ? 'Très bien' : rating === 3 ? 'Moyen' : 'À améliorer'}
                </span>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Points forts ou axes prioritaires
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {feedbackTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vos remarques et suggestions
                </label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Partagez vos impressions ou ce qui pourrait être amélioré..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              {feedbackSent && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                  Merci beaucoup pour votre contribution au développement de FASO ! 🇧🇫
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm"
              >
                Envoyer mon avis
              </button>
            </form>
          )}

          {/* ==================== TAB 3: MES RÉCLAMATIONS ==================== */}
          {activeTab === 'my_tickets' && (
            <div className="space-y-3">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-10 h-10 mx-auto opacity-50" />
                  <p className="text-xs font-semibold">Aucun signalement en cours</p>
                </div>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{t.id}</span>
                        {getStatusBadge(t.status)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {t.description}
                    </p>

                    {t.transactionRef && (
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        Réf. liée : {t.transactionRef}
                      </p>
                    )}

                    {t.resolutionNote && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 space-y-0.5">
                        <p className="font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Réponse du support ({t.assignedAgent || 'Agent FASO'}) :</span>
                        </p>
                        <p className="text-[11px]">{t.resolutionNote}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ==================== TAB 4: CONSOLE SUPERVISEUR / AGENT (SECTION 23 REQUIREMENTS) ==================== */}
          {activeTab === 'admin_console' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    Console Agent & Superviseur Support FASO
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Accès Sécurisé RBAC</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Traitement officiel des réclamations : affectation d'agent, notes internes et clôture motivée.
                </p>
              </div>

              {/* List of tickets to manage */}
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketForAdmin(t);
                      setAdminNewStatus(t.status);
                      setAdminInternalNotes(t.internalNotes || '');
                      setAdminResolutionNote(t.resolutionNote || '');
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedTicketForAdmin?.id === t.id
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs">{t.id}</span>
                        {getStatusBadge(t.status)}
                      </div>
                      <span className="text-xs font-medium text-slate-500">{t.userName} ({t.userPhone})</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">
                      {t.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action Sheet on Selected Ticket */}
              {selectedTicketForAdmin && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-800 space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Traitement du dossier {selectedTicketForAdmin.id}
                    </h4>
                    <span className="text-[11px] text-slate-400">Demandeur : {selectedTicketForAdmin.userName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Agent affecté</label>
                      <input
                        type="text"
                        value={adminAgentName}
                        onChange={(e) => setAdminAgentName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Nouveau Statut</label>
                      <select
                        value={adminNewStatus}
                        onChange={(e) => setAdminNewStatus(e.target.value as TicketStatus)}
                        className="w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 font-bold"
                      >
                        <option value="received">Reçu</option>
                        <option value="in_progress">En cours de traitement</option>
                        <option value="awaiting_info">En attente d'informations</option>
                        <option value="resolved">Résolu et clôturé</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Note interne (non visible par l'utilisateur)</label>
                    <input
                      type="text"
                      value={adminInternalNotes}
                      onChange={(e) => setAdminInternalNotes(e.target.value)}
                      placeholder="Ex: Rapprochement vérifié sur portail Orange Money API..."
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Réponse / Justification communiquée à l'utilisateur</label>
                    <textarea
                      rows={2}
                      value={adminResolutionNote}
                      onChange={(e) => setAdminResolutionNote(e.target.value)}
                      placeholder="Ex: L'opération a été créditée après régularisation réseau..."
                      className="w-full px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedTicketForAdmin(null)}
                      className="px-3 py-2 rounded-xl border text-xs font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAdminUpdate}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Enregistrer la décision du support
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
