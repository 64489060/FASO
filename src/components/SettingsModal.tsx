import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { OPERATORS } from '../constants/operators';
import { TRANSLATIONS } from '../constants/translations';
import { CulturalPattern, FasoLogo } from './CulturalPattern';
import { 
  User, 
  Shield, 
  Lock, 
  Fingerprint, 
  Smartphone, 
  History, 
  KeyRound, 
  Bell, 
  Globe, 
  EyeOff, 
  Palette, 
  MessageCircle, 
  HelpCircle, 
  FileCheck, 
  X, 
  Check, 
  Trash2, 
  LogOut, 
  Download, 
  AlertTriangle,
  Sparkles,
  PhoneCall,
  Activity,
  Layers,
  Edit2
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenSupport: (tab?: 'feedback' | 'report') => void;
  initialTab?: string;
  lang?: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onOpenSupport,
  initialTab = 'account',
  lang = 'fr',
}) => {
  const t = TRANSLATIONS[lang];

  // Active navigation tab
  // 'account' | 'security' | 'privacy' | 'preferences' | 'assistance'
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Profile Edit State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [city, setCity] = useState(user?.city || 'Ouagadougou');
  const [profession, setProfession] = useState(user?.profession || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.phoneNumber || 'faso_user');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Security: PIN Change State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmNewPinInput, setConfirmNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // FAQ Expand State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!isOpen || !user) return null;

  // Handle Profile Save
  const handleSaveProfile = () => {
    const updated: UserProfile = {
      ...user,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      city,
      profession,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`,
    };
    onUpdateUser(updated);
    setIsEditingProfile(false);
  };

  // Handle PIN Change
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length !== 6 || confirmNewPinInput.length !== 6) {
      setPinChangeMsg({ type: 'error', text: 'Le nouveau code doit contenir exactement 6 chiffres.' });
      return;
    }
    if (newPinInput !== confirmNewPinInput) {
      setPinChangeMsg({ type: 'error', text: 'Les deux nouveaux codes ne correspondent pas.' });
      return;
    }

    setPinChangeMsg({ type: 'success', text: 'Code secret FASO mis à jour avec succès !' });
    setTimeout(() => {
      setIsChangingPin(false);
      setPinChangeMsg(null);
      setCurrentPinInput('');
      setNewPinInput('');
      setConfirmNewPinInput('');
    }, 1200);
  };

  // Revoke Device
  const handleRevokeDevice = (deviceId: string) => {
    const updatedDevices = user.devices.filter((d) => d.id !== deviceId);
    onUpdateUser({ ...user, devices: updatedDevices });
  };

  // Revoke All Other Devices
  const handleRevokeAllOtherDevices = () => {
    const currentOnly = user.devices.filter((d) => d.isCurrent);
    onUpdateUser({ ...user, devices: currentOnly });
    alert('Toutes les autres sessions connectées ont été révoquées avec succès.');
  };

  // Export personal data JSON
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FASO_donnees_${user.phoneNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // FAQ items
  const faqs = [
    {
      q: 'Pourquoi le code FASO est-il différent de mon code Orange Money ou Moov ?',
      a: 'Le code secret FASO protège votre application et vos ordres internes. Votre code Orange ou Moov reste strictement confidentiel et n’est jamais stocké ni intercepté par FASO.',
    },
    {
      q: 'Que faire si je perds mon téléphone ou ma carte SIM ?',
      a: 'Contactez immédiatement notre assistance WhatsApp au +226 64 48 90 60 pour bloquer temporairement vos accès, puis utilisez la procédure de récupération sécurisée sur votre nouvel appareil.',
    },
    {
      q: 'Quels sont les plafonds de transfert par niveau (Tier 1 vs Tier 2) ?',
      a: 'Niveau 1 (Numéro vérifié) : 200 000 FCFA/jour. Niveau 2 (CNIB / Passeport certifié BCEAO) : jusqu’à 2 000 000 FCFA/jour.',
    },
    {
      q: 'Comment fonctionne le simulateur d’emprunt ?',
      a: 'Le module crédit est un simulateur transparent sans octroi de prêt direct tant qu’un partenaire financier agréé n’a pas instruit et validé votre dossier conformément à la réglementation.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Cultural stripe */}
        <CulturalPattern variant="border" />

        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Paramètres de l'application
            </h2>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-2 py-0.5 rounded-full">
              v2.4.0-bf
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 gap-1 text-xs font-semibold no-scrollbar">
          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'account' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mon Compte</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'security' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Sécurité Portefeuille</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'preferences' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Préférences</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'privacy' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Confidentialité</span>
          </button>
          <button
            onClick={() => setActiveTab('assistance')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'assistance' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Assistance & Réseaux</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* ==================== TAB: MON COMPTE ==================== */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-20 h-20 rounded-2xl border-2 border-emerald-500 object-cover bg-slate-200"
                  />
                  <button
                    onClick={() => {
                      const next = Math.random().toString(36).substring(7);
                      setAvatarSeed(next);
                      onUpdateUser({
                        ...user,
                        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${next}`,
                      });
                    }}
                    className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-900 border rounded-full text-slate-600 text-xs shadow-xs"
                    title="Changer d'avatar"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {user.fullName}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40 w-fit mx-auto sm:mx-0">
                      <Shield className="w-3 h-3" />
                      {user.verificationTier === 'tier2' ? 'Niveau 2 : Certifié BCEAO' : 'Niveau 1 : Numéro vérifié'}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    🇧🇫 {user.countryCode} {user.phoneNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.city}, Burkina Faso • {user.profession}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isEditingProfile ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              {/* Editing Form */}
              {isEditingProfile && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Modifier les informations de profil autorisées
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block">Prénom</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-slate-50 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Profession / Activité</label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-xs bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              )}

              {/* Tier Upgrade Banner */}
              {user.verificationTier === 'tier1' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Passez au Niveau 2 (Tier 2 Réglementaire)
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Augmentez votre plafond quotidien à 2 000 000 FCFA en renseignant votre numéro de CNIB ou de Passeport burkinabè.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const cnib = prompt('Veuillez saisir le numéro de votre CNIB (ex: B12345678) :');
                      if (cnib) {
                        onUpdateUser({
                          ...user,
                          verificationTier: 'tier2',
                          idDocumentType: 'cnib',
                          idDocumentNumber: cnib,
                        });
                        alert('Félicitations ! Votre compte est désormais certifié Niveau 2 (BCEAO).');
                      }
                    }}
                    className="px-3 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shrink-0 hover:bg-emerald-700"
                  >
                    Fournir CNIB
                  </button>
                </div>
              )}

              {/* Logout button */}
              <div className="pt-2">
                <button
                  onClick={onLogout}
                  className="w-full py-3 rounded-2xl border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion de mon compte FASO</span>
                </button>
              </div>

            </div>
          )}

          {/* ==================== TAB: SÉCURITÉ DU PORTEFEUILLE ==================== */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              
              {/* Code FASO management */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                        Code de sécurité FASO (6 chiffres)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Distinct de votre code PIN Mobile Money
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChangingPin(!isChangingPin)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    {isChangingPin ? 'Fermer' : 'Modifier mon code'}
                  </button>
                </div>

                {isChangingPin && (
                  <form onSubmit={handleChangePinSubmit} className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div>
                      <label className="text-[11px] text-slate-500 block">Nouveau code (6 chiffres)</label>
                      <input
                        type="password"
                        maxLength={6}
                        required
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono tracking-widest bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block">Confirmer nouveau code</label>
                      <input
                        type="password"
                        maxLength={6}
                        required
                        value={confirmNewPinInput}
                        onChange={(e) => setConfirmNewPinInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono tracking-widest bg-white dark:bg-slate-900"
                      />
                    </div>

                    {pinChangeMsg && (
                      <p className={`text-xs font-semibold ${pinChangeMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pinChangeMsg.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Valider le nouveau code
                    </button>
                  </form>
                )}
              </div>

              {/* Biometrics Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Déverrouillage biométrique
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      FaceID / Empreinte digitale locale sur cet appareil
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={user.biometricsEnabled}
                  onChange={(e) => onUpdateUser({ ...user, biometricsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Auto-Lock Inactivity */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Verrouillage automatique après inactivité
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Protège vos fonds lorsque l'application passe en arrière-plan
                    </p>
                  </div>
                  <select
                    value={user.autoLockMinutes}
                    onChange={(e) => onUpdateUser({ ...user, autoLockMinutes: parseInt(e.target.value) })}
                    className="px-2.5 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                  </select>
                </div>
              </div>

              {/* Connected Devices (Gestion des appareils connectés) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Appareils autorisés ({user.devices.length})
                    </h4>
                  </div>
                  {user.devices.length > 1 && (
                    <button
                      onClick={handleRevokeAllOtherDevices}
                      className="text-[11px] text-red-600 hover:underline font-bold"
                    >
                      Révoquer les autres sessions
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {user.devices.map((device) => (
                    <div
                      key={device.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white">{device.name}</span>
                          {device.isCurrent && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                              Cet appareil
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {device.location} • IP: {device.ipAddress} • {device.lastActive}
                        </p>
                      </div>

                      {!device.isCurrent && (
                        <button
                          onClick={() => handleRevokeDevice(device.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="Révoquer cet appareil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Login Audit Trail (Historique des connexions) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>Historique des récentes connexions</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  {user.loginHistory.map((item) => (
                    <div key={item.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0 text-slate-600 dark:text-slate-400">
                      <span>{new Date(item.timestamp).toLocaleString('fr-FR')} ({item.device})</span>
                      <span className="font-mono text-emerald-600">{item.method === 'biometric' ? 'Biométrie' : 'Code FASO'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol in case of lost/stolen phone */}
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 text-xs text-red-900 dark:text-red-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Procédure d'urgence en cas de perte de téléphone ou SIM</span>
                </p>
                <p>
                  Appelez immédiatement notre centre d'urgence au <strong>+226 64 48 90 60</strong> pour geler vos transferts et protéger votre solde.
                </p>
              </div>

            </div>
          )}

          {/* ==================== TAB: PRÉFÉRENCES ==================== */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              
              {/* Language Choice (French, Mooré, Dioula, Fulfuldé) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>Langue d'affichage & dialectes du Burkina</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'fr', label: 'Français', note: 'Par défaut' },
                    { id: 'mo', label: 'Mooré', note: 'Zaambré' },
                    { id: 'di', label: 'Dioula', note: 'Julakan' },
                    { id: 'fu', label: 'Fulfuldé', note: 'Peul' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onUpdateUser({ ...user, language: l.id as Language })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        user.language === l.id
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs block">{l.label}</span>
                      <span className="text-[10px] text-slate-400">{l.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hide Balance Default */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-slate-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Masquer le solde par défaut
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Discrétion anti-regards indiscrets dans les lieux publics
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={user.hideBalanceDefault}
                  onChange={(e) => onUpdateUser({ ...user, hideBalanceDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Cultural Animations toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                      Motifs culturels Faso Dan Fani
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Animations légères et bordures traditionnelles burkinabè
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={user.culturalAnimations}
                  onChange={(e) => onUpdateUser({ ...user, culturalAnimations: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Text Size Accessibility */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Taille du texte (Accessibilité)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Lisibilité optimale sur tous les écrans
                  </p>
                </div>
                <select
                  value={user.textSize}
                  onChange={(e) => onUpdateUser({ ...user, textSize: e.target.value as any })}
                  className="px-2.5 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-900 font-bold"
                >
                  <option value="standard">Standard</option>
                  <option value="large">Grand</option>
                  <option value="xlarge">Très grand</option>
                </select>
              </div>

            </div>
          )}

          {/* ==================== TAB: CONFIDENTIALITÉ ==================== */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 dark:text-white">
                  Gestion du consentement & Protection CIL Burkina
                </h4>
                <p className="text-slate-600 dark:text-slate-300">
                  FASO traite vos données dans le strict respect de la loi portant protection des données à caractère personnel du Burkina Faso (CIL) et des instructions de la Banque Centrale (BCEAO).
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-[11px] text-slate-500">
                  <p>• Données collectées : Numéro de téléphone vérifié, identité, logs de sécurité, historique de transactions.</p>
                  <p>• Conservation légale : Les transactions financières sont conservées pour une durée minimale de 5 ans conformément aux règles de lutte anti-blanchiment (LBC/FT).</p>
                </div>
              </div>

              {/* Data Export Button */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                    Droit d'accès et portabilité
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Téléchargez l'intégralité de vos informations au format JSON
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                </button>
              </div>

            </div>
          )}

          {/* ==================== TAB: ASSISTANCE ET INFORMATIONS ==================== */}
          {activeTab === 'assistance' && (
            <div className="space-y-4">
              
              {/* WhatsApp direct help */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
                      Assistance WhatsApp Officielle FASO
                    </h4>
                    <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      +226 64 48 90 60
                    </p>
                    <p className="text-[10px] text-emerald-600">Disponible 7j/7 de 7h à 22h GMT</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/22664489060?text=Bonjour%20FASO,%20j'ai%20une%20question"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
                >
                  Ouvrir WhatsApp
                </a>
              </div>

              {/* Feedbacks and issues buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenSupport('report');
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-left space-y-1 bg-slate-50 dark:bg-slate-800/70"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    Signaler un problème
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Litige de paiement, erreur ou lenteur
                  </span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSupport('feedback');
                  }}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-left space-y-1 bg-slate-50 dark:bg-slate-800/70"
                >
                  <span className="text-xs font-bold text-slate-800 dark:text-white block">
                    Donner mon avis
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Noter et suggérer des améliorations
                  </span>
                </button>
              </div>

              {/* Live Operator Status */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>État des passerelles opérateurs au Faso</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono">100% Opérationnel</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  {OPERATORS.map((op) => (
                    <div key={op.id} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{op.name}</span>
                      <span className="text-[10px] text-emerald-600 font-bold">● {op.uptime}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive FAQ */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2">
                  Foire Aux Questions (FAQ)
                </h4>
                <div className="space-y-1.5">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden bg-white dark:bg-slate-900"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full p-2.5 text-left text-xs font-bold text-slate-800 dark:text-white flex items-center justify-between"
                      >
                        <span>{faq.q}</span>
                        <span className="text-slate-400">{expandedFaq === idx ? '−' : '+'}</span>
                      </button>
                      {expandedFaq === idx && (
                        <div className="p-2.5 pt-0 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
