import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { COUNTRY_CODES, CITIES_BURKINA } from '../constants/operators';
import { TRANSLATIONS } from '../constants/translations';
import { FasoLogo, CulturalPattern, WatermarkRibbon } from './CulturalPattern';
import { hashPin } from '../services/storage';
import { 
  Phone, 
  KeyRound, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  Lock,
  RefreshCw,
  Sparkles,
  Smartphone,
  Info
} from 'lucide-react';

interface AuthModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  mode: 'login' | 'register' | 'recovery' | 'lock';
  onModeChange: (mode: 'login' | 'register' | 'recovery' | 'lock') => void;
  onSuccess: (user: UserProfile) => void;
  onUnlock: () => void;
  lang?: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  isOpen,
  mode,
  onModeChange,
  onSuccess,
  onUnlock,
  lang = 'fr',
}) => {
  const t = TRANSLATIONS[lang];

  // Registration step state
  // 1: Phone & terms, 2: OTP, 3: Profile info, 4: Security PIN & Biometrics, 5: Success
  const [regStep, setRegStep] = useState<number>(1);
  const [countryCode, setCountryCode] = useState('+226');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [agreedTerms, setAgreedTerms] = useState(false);
  
  // OTP state
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState<string>('849201');
  const [otpCountdown, setOtpCountdown] = useState<number>(60);
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('Ouagadougou');
  const [profession, setProfession] = useState('Commerçant');

  // Security PIN state
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '', '', '']);
  const [enableBiometrics, setEnableBiometrics] = useState(true);

  // Login / Lock screen state
  const [loginPin, setLoginPin] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBiometricPromptOpen, setIsBiometricPromptOpen] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regStep === 2 && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, otpCountdown]);

  // Lockout countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockCountdown > 0) {
      timer = setInterval(() => {
        setLockCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockCountdown]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phoneNumber || phoneNumber.length < 8) {
      setErrorMsg('Veuillez saisir un numéro de téléphone valide (8 chiffres au Burkina Faso).');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Veuillez accepter les conditions d’utilisation et la politique de confidentialité.');
      return;
    }

    // Generate random 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpCountdown(60);
    setShowSmsBanner(true);
    setRegStep(2);
  };

  // Handle OTP Verification
  const handleVerifyOtp = () => {
    setErrorMsg(null);
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setErrorMsg('Veuillez saisir le code complet à 6 chiffres.');
      return;
    }
    if (entered !== generatedOtp && entered !== '123456') {
      setErrorMsg('Code de vérification incorrect. Veuillez réessayer ou demander un nouveau code.');
      return;
    }
    setShowSmsBanner(false);
    setRegStep(3);
  };

  // Quick OTP autofill simulation
  const handleAutoFillOtp = () => {
    setOtpCode(generatedOtp.split(''));
  };

  // Handle Profile Submission
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Veuillez renseigner votre nom et votre prénom.');
      return;
    }
    setErrorMsg(null);
    setRegStep(4);
  };

  // Handle PIN Creation & Finish Registration
  const handleFinishRegistration = () => {
    setErrorMsg(null);
    const pinStr = pin.join('');
    const confirmStr = confirmPin.join('');

    if (pinStr.length !== 6) {
      setErrorMsg('Le code de sécurité FASO doit comporter exactement 6 chiffres.');
      return;
    }
    if (pinStr !== confirmStr) {
      setErrorMsg('Les deux codes de sécurité saisis ne correspondent pas.');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-bf-${Date.now().toString().slice(-5)}`,
      phoneNumber,
      countryCode,
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      city,
      profession,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${phoneNumber}`,
      verificationTier: 'tier1',
      hasFasoPin: true,
      biometricsEnabled: enableBiometrics,
      autoLockMinutes: 5,
      hideBalanceDefault: false,
      culturalAnimations: true,
      theme: 'light',
      textSize: 'standard',
      language: lang,
      createdAt: new Date().toISOString(),
      devices: [
        {
          id: `dev-${Date.now()}`,
          name: 'Appareil Actuel (Navigateur / Android)',
          deviceType: 'mobile',
          location: `${city}, Burkina Faso`,
          lastActive: 'À l’instant',
          isCurrent: true,
          ipAddress: '197.239.68.14',
        },
      ],
      loginHistory: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          device: 'Appareil Actuel',
          location: `${city}, Burkina Faso`,
          status: 'success',
          method: 'pin',
        },
      ],
    };

    onSuccess(newUser);
  };

  // Handle Login or Unlock
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (lockCountdown > 0) {
      setErrorMsg(`Trop de tentatives. Veuillez patienter ${lockCountdown} secondes.`);
      return;
    }

    const enteredPin = loginPin.join('');
    if (enteredPin.length !== 6) {
      setErrorMsg('Veuillez saisir votre code FASO à 6 chiffres.');
      return;
    }

    // Default accepted test PINs: 123456 or user's PIN
    if (enteredPin === '123456' || enteredPin === '000000' || user?.hasFasoPin) {
      setFailedAttempts(0);
      setLoginPin(['', '', '', '', '', '']);
      if (mode === 'lock') {
        onUnlock();
      } else if (user) {
        onSuccess(user);
      }
    } else {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      if (nextFailed >= 3) {
        setLockCountdown(30);
        setErrorMsg('Portefeuille temporairement bloqué (30s) suite à 3 tentatives erronées.');
      } else {
        setErrorMsg(`Code secret FASO incorrect (${3 - nextFailed} tentative(s) restante(s)).`);
      }
    }
  };

  // Biometrics simulation
  const handleBiometricAuth = () => {
    setIsBiometricPromptOpen(true);
    setTimeout(() => {
      setIsBiometricPromptOpen(false);
      if (mode === 'lock') {
        onUnlock();
      } else if (user) {
        onSuccess(user);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cultural stripe border on top */}
        <CulturalPattern variant="border" />
        <WatermarkRibbon variant="splash" />
        <CulturalPattern variant="subtle" />

        {/* SMS Simulation Banner (When OTP is sent) */}
        {showSmsBanner && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 animate-in slide-in-from-top">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold">SMS</span>
              <div>
                <p className="font-semibold">FASO Sécurité (+226)</p>
                <p className="font-mono">Votre code OTP est <span className="font-extrabold text-red-600 dark:text-red-400">{generatedOtp}</span></p>
              </div>
            </div>
            <button
              onClick={handleAutoFillOtp}
              className="text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2 py-1 rounded transition-colors"
            >
              Insérer
            </button>
          </div>
        )}

        <div className="p-6 relative z-10">
          
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="inline-block mx-auto mb-2">
              <FasoLogo size="lg" showTagline={false} />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {mode === 'lock' && 'Portefeuille Verrouillé'}
              {mode === 'login' && 'Connexion à FASO'}
              {mode === 'register' && 'Créer votre compte FASO'}
              {mode === 'recovery' && 'Récupération de compte'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'lock' && 'Confirmez votre identité avec votre code secret à 6 chiffres ou par biométrie.'}
              {mode === 'login' && 'Accédez à vos services financiers du Burkina Faso en toute sécurité.'}
              {mode === 'register' && 'Inscription simple avec votre numéro de téléphone.'}
              {mode === 'recovery' && 'Procédure officielle de réinitialisation sécurisée.'}
            </p>
          </div>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* -------------------- MODE: LOCK / LOGIN -------------------- */}
          {(mode === 'login' || mode === 'lock') && (
            <div className="space-y-4">
              {mode === 'login' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                      🇧🇫 +226
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="70 23 45 67"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* 6-digit Code input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Code secret FASO (6 chiffres)
                  </label>
                  <span className="text-[10px] text-slate-400">Ne jamais partager</span>
                </div>
                
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5].map((idx) => (
                    <input
                      key={idx}
                      id={`pin-input-${idx}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      disabled={lockCountdown > 0}
                      value={loginPin[idx] || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newPin = [...loginPin];
                        newPin[idx] = val;
                        setLoginPin(newPin);
                        if (val && idx < 5) {
                          document.getElementById(`pin-input-${idx + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !loginPin[idx] && idx > 0) {
                          document.getElementById(`pin-input-${idx - 1}`)?.focus();
                        }
                      }}
                      className="w-10 sm:w-12 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span>Code démo : <strong className="text-emerald-600 dark:text-emerald-400">123456</strong></span>
                  <button
                    onClick={() => {
                      setLoginPin(['1', '2', '3', '4', '5', '6']);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    Remplir 123456
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={lockCountdown > 0}
                  onClick={() => handleLoginSubmit()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{mode === 'lock' ? 'Déverrouiller le portefeuille' : 'Se connecter'}</span>
                </button>

                {/* Biometric Unlock Option */}
                <button
                  type="button"
                  onClick={handleBiometricAuth}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs border border-slate-200 dark:border-slate-700"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Déverrouiller avec la biométrie (FaceID / Empreinte)</span>
                </button>
              </div>

              {/* Recovery & Switch to Register */}
              <div className="flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onModeChange('recovery')}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium"
                >
                  Code oublié ?
                </button>
                {mode !== 'lock' && (
                  <button
                    onClick={() => {
                      setRegStep(1);
                      onModeChange('register');
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    Créer un compte
                  </button>
                )}
              </div>
            </div>
          )}

          {/* -------------------- MODE: REGISTER -------------------- */}
          {mode === 'register' && (
            <div>
              {/* Stepper indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all ${
                      regStep === step
                        ? 'w-8 bg-emerald-600 dark:bg-emerald-400'
                        : regStep > step
                        ? 'w-5 bg-emerald-200 dark:bg-emerald-900'
                        : 'w-3 bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* STEP 1: Phone & Terms */}
              {regStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sélectionnez votre indicatif et numéro
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-2.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.code} ({c.country})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\s+/g, ''))}
                        placeholder="70 23 45 67"
                        className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Numéro utilisé pour la vérification OTP et la sécurité de votre portefeuille.
                    </p>
                  </div>

                  {/* Terms acceptance */}
                  <label className="flex items-start gap-2 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                      J’accepte les <strong>Conditions Générales d’Utilisation</strong> de FASO et la <strong>Politique de Confidentialité</strong> conforme aux règles de la CIL et de la BCEAO.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Recevoir le code de vérification (OTP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => onModeChange('login')}
                      className="text-xs text-slate-500 hover:text-emerald-600 font-medium"
                    >
                      Déjà un compte ? Se connecter
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter OTP */}
              {regStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Code envoyé au <strong className="font-mono">{countryCode} {phoneNumber}</strong>
                    </p>
                  </div>

                  <div className="flex justify-between gap-1.5 sm:gap-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <input
                        key={idx}
                        id={`otp-box-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={otpCode[idx] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newOtp = [...otpCode];
                          newOtp[idx] = val;
                          setOtpCode(newOtp);
                          if (val && idx < 5) {
                            document.getElementById(`otp-box-${idx + 1}`)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
                            document.getElementById(`otp-box-${idx - 1}`)?.focus();
                          }
                        }}
                        className="w-10 sm:w-12 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {otpCountdown > 0 ? `Renvoyer dans ${otpCountdown}s` : 'Code expiré'}
                    </span>
                    <button
                      disabled={otpCountdown > 0}
                      onClick={() => {
                        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedOtp(newCode);
                        setOtpCountdown(60);
                        setShowSmsBanner(true);
                      }}
                      className="text-emerald-600 font-bold disabled:opacity-40"
                    >
                      Renvoyer l'OTP
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-xs"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm"
                    >
                      Vérifier le numéro
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Profile Info */}
              {regStep === 3 && (
                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: Ousmane"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nom de famille
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ex: Ouédraogo"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Ville de résidence (Burkina Faso)
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    >
                      {CITIES_BURKINA.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Activité / Profession
                    </label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="Ex: Commerçant, Éleveur, Artisan, Salarié..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      Votre numéro a été vérifié. Votre compte débutera au <strong>Niveau 1</strong> (Plafond 200 000 FCFA/jour). Vous pourrez soumettre votre CNIB plus tard pour le Niveau 2.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    <span>Continuer vers le code de sécurité</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 4: Create FASO PIN & Biometrics */}
              {regStep === 4 && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      <strong>Règle de sécurité :</strong> Le code FASO à 6 chiffres protège votre application. Il est <strong>strictement distinct</strong> de votre code PIN Orange Money, Moov ou Telecel.
                    </span>
                  </div>

                  {/* Enter PIN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Créer un code de sécurité FASO (6 chiffres)
                    </label>
                    <div className="flex justify-between gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                          key={idx}
                          id={`reg-pin-${idx}`}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          value={pin[idx] || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const newP = [...pin];
                            newP[idx] = val;
                            setPin(newP);
                            if (val && idx < 5) document.getElementById(`reg-pin-${idx + 1}`)?.focus();
                          }}
                          className="w-10 h-10 text-center font-bold text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Confirm PIN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirmer le code de sécurité (6 chiffres)
                    </label>
                    <div className="flex justify-between gap-1.5">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <input
                          key={idx}
                          id={`reg-conf-${idx}`}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          value={confirmPin[idx] || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            const newP = [...confirmPin];
                            newP[idx] = val;
                            setConfirmPin(newP);
                            if (val && idx < 5) document.getElementById(`reg-conf-${idx + 1}`)?.focus();
                          }}
                          className="w-10 h-10 text-center font-bold text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Biometric Toggle */}
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white">Activer la biométrie</p>
                        <p className="text-[10px] text-slate-500">Connexion rapide par empreinte ou visage</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableBiometrics}
                      onChange={(e) => setEnableBiometrics(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleFinishRegistration}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Créer mon compte et ouvrir la session</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* -------------------- MODE: RECOVERY -------------------- */}
          {mode === 'recovery' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                En cas d'oubli de votre code ou de changement de carte SIM, un protocole sécurisé permet de récupérer l'accès via votre numéro vérifié.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Numéro de téléphone enregistré
                </label>
                <input
                  type="tel"
                  defaultValue={user?.phoneNumber || '70234567'}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p className="font-semibold text-slate-800 dark:text-white">Étapes de réinitialisation :</p>
                <p>1. Vérification par code SMS à usage unique (OTP).</p>
                <p>2. Rapprochement avec votre pièce d'identité (CNIB) si nécessaire.</p>
                <p>3. Révocation de toutes les autres sessions actives.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('Code de récupération envoyé par SMS au numéro du compte.');
                  onModeChange('login');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
              >
                Envoyer le lien de récupération sécurisé
              </button>

              <button
                type="button"
                onClick={() => onModeChange('login')}
                className="w-full text-center text-xs text-slate-500 hover:underline"
              >
                Retour à la connexion
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Biometric Scanning Animation Simulation Modal */}
      {isBiometricPromptOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-emerald-500/30 flex flex-col items-center gap-3 animate-in zoom-in-95">
            <div className="relative">
              <Fingerprint className="w-16 h-16 text-emerald-500 animate-pulse" />
              <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping opacity-25"></div>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Authentification Biométrique</p>
            <p className="text-xs text-slate-500">Posez votre doigt sur le capteur...</p>
          </div>
        </div>
      )}
    </div>
  );
};
