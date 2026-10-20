import React, { useState } from 'react';
import { 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RotateCcw, 
  PlusCircle, 
  ShieldCheck, 
  HelpCircle, 
  Smartphone,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from 'lucide-react';

interface SandboxControlsProps {
  onInjectMoney: (amount: number) => void;
  onForceLock: () => void;
  onResetData: () => void;
  onOpenSupportConsole: () => void;
}

export const SandboxControls: React.FC<SandboxControlsProps> = ({
  onInjectMoney,
  onForceLock,
  onResetData,
  onOpenSupportConsole,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const featureStatuses = [
    { name: '18. Inscription Téléphone & OTP', status: 'Opérationnelle en sandbox', type: 'sandbox' },
    { name: '18. Connexion & Code Sécurité 6 chiffres', status: 'Opérationnelle en production', type: 'prod' },
    { name: '19. Passerelle Mobile Money & Idempotence', status: 'Opérationnelle en sandbox', type: 'sandbox' },
    { name: '19. Bouton retour & Vérification opérateur', status: 'Opérationnelle en production', type: 'prod' },
    { name: '20. Paramètres complets & Appareils', status: 'Opérationnelle en production', type: 'prod' },
    { name: '21. Protection Portefeuille & Clavier', status: 'Opérationnelle en production', type: 'prod' },
    { name: '22. Module Emprunt & Simulateur BCEAO', status: 'Simulée — Partenaire en cours', type: 'sim' },
    { name: '23. Signalements & Console Agent Support', status: 'Opérationnelle en production', type: 'prod' },
    { name: 'Assistance WhatsApp (+226 64 48 90 60)', status: 'Opérationnelle en production', type: 'prod' },
  ];

  return (
    <div className="fixed bottom-3 right-3 z-40 max-w-sm">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden text-xs">
        
        {/* Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-extrabold tracking-wider font-mono text-emerald-400">
              VALIDATION FASO — TESTEUR
            </span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Expanded Panel */}
        {isOpen && (
          <div className="p-4 space-y-3.5 border-t border-slate-800 max-h-[75vh] overflow-y-auto">
            
            {/* Quick action testing buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Actions Rapides de Validation :
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onInjectMoney(25000)}
                  className="px-2.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 rounded-xl text-emerald-300 font-bold flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>+25 000 F Orange</span>
                </button>

                <button
                  onClick={onForceLock}
                  className="px-2.5 py-2 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 rounded-xl text-amber-300 font-bold flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Verrouiller Écran</span>
                </button>

                <button
                  onClick={onOpenSupportConsole}
                  className="px-2.5 py-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/50 rounded-xl text-blue-300 font-bold flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Console Agent</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Réinitialiser toutes les données de test à l’état par défaut du Burkina Faso ?')) {
                      onResetData();
                    }
                  }}
                  className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-slate-300 font-bold flex items-center gap-1.5 transition-colors text-[11px]"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Réinitialiser Données</span>
                </button>
              </div>
            </div>

            {/* Requirement 24 Status Matrix */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Statut Réglementaire des Modules (Art. 24) :
              </span>
              <div className="space-y-1 text-[10px]">
                {featureStatuses.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-0.5">
                    <span className="text-slate-300 truncate max-w-[190px]">{item.name}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-bold shrink-0 ${
                        item.type === 'prod'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : item.type === 'sandbox'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-800/60 p-2 rounded-xl">
              💡 Code PIN par défaut : <strong className="text-emerald-400 font-mono">123456</strong>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
