import { Language } from '../types';

export interface TranslationDictionary {
  appName: string;
  slogan: string;
  culturalGreeting: string;
  balanceLabel: string;
  hideBalance: string;
  showBalance: string;
  sendMoney: string;
  depositWithdraw: string;
  loanCredit: string;
  billsServices: string;
  recentActivity: string;
  settings: string;
  security: string;
  supportWhatsApp: string;
  myAccount: string;
  preferences: string;
  privacy: string;
  securityPin: string;
  biometrics: string;
  operatorStatus: string;
  returnToAppBtn: string;
  verifyingOperation: string;
  confirmOperation: string;
  simulationNotice: string;
  tier1Badge: string;
  tier2Badge: string;
  giveFeedback: string;
  reportIssue: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  fr: {
    appName: 'FASO',
    slogan: 'La finance simple, sécurisée et solidaire du Burkina Faso',
    culturalGreeting: 'Bienvenue au Faso',
    balanceLabel: 'Solde disponible',
    hideBalance: 'Masquer le solde',
    showBalance: 'Afficher le solde',
    sendMoney: 'Envoyer',
    depositWithdraw: 'Recharger',
    loanCredit: 'Emprunter',
    billsServices: 'Factures',
    recentActivity: 'Historique des opérations',
    settings: 'Paramètres',
    security: 'Sécurité du portefeuille',
    supportWhatsApp: 'Assistance WhatsApp (+226)',
    myAccount: 'Mon Compte',
    preferences: 'Préférences',
    privacy: 'Confidentialité',
    securityPin: 'Code de sécurité FASO (6 chiffres)',
    biometrics: 'Déverrouillage biométrique',
    operatorStatus: 'Réseaux Mobile Money',
    returnToAppBtn: 'Je suis revenu dans FASO — vérifier mon opération',
    verifyingOperation: 'Vérification en cours auprès de l’opérateur...',
    confirmOperation: 'Confirmer l’opération',
    simulationNotice: 'Simulation — aucun prêt réel accordé sans validation de partenaire agréé BCEAO',
    tier1Badge: 'Niveau 1 : Numéro vérifié',
    tier2Badge: 'Niveau 2 : Identité certifiée BCEAO',
    giveFeedback: 'Donner mon avis',
    reportIssue: 'Signaler un problème',
  },
  mo: {
    appName: 'FASO',
    slogan: 'Ligdi tʋʋma fãa yaa bãane n paam bas-m-meng Burkiina pʋgẽ',
    culturalGreeting: 'Ne y beogo / Zaambré Burkiina',
    balanceLabel: 'Ligdi m’be arzantẽ',
    hideBalance: 'Solg ligda',
    showBalance: 'Wilg ligda',
    sendMoney: 'Tʋm ligdi',
    depositWithdraw: 'Pugl ligdi',
    loanCredit: 'Pend ligdi',
    billsServices: 'Kõb-tõod / Samde',
    recentActivity: 'Tʋʋma kʋdgã',
    settings: 'Yel-manesem',
    security: 'Gũusgu la bãane',
    supportWhatsApp: 'WhatsApp sõngr (+226)',
    myAccount: 'Mam yel-manesem',
    preferences: 'Gom-biis la yam-leoogo',
    privacy: 'Solg-kʋlem zemsgo',
    securityPin: 'FASO gũusg sõor (6)',
    biometrics: 'Nug-bila meemre',
    operatorStatus: 'Telefoŋ ligdi tʋʋma',
    returnToAppBtn: 'M leba FASO pʋgẽ — ges m tʋʋmde',
    verifyingOperation: 'B ket n vaesda tʋʋmdã...',
    confirmOperation: 'Sak tʋʋmde',
    simulationNotice: 'Makre bala — Pa ligd meng ye sã n ka zems ne laaga',
    tier1Badge: 'Kood 1 : Telefoŋ sõor sakame',
    tier2Badge: 'Kood 2 : Seb-kãsenga sakame',
    giveFeedback: 'Kõ f tagsgo',
    reportIssue: 'Wilg zu-loebre',
  },
  di: {
    appName: 'FASO',
    slogan: 'Wari ko kɛnɛya ni lafiya Burikina Faso kɔnɔ',
    culturalGreeting: 'I ni ce, k’an bɛn FASO la',
    balanceLabel: 'Wari min bɛ bolo',
    hideBalance: 'Wari dogo',
    showBalance: 'Wari jira',
    sendMoney: 'Wari ci',
    depositWithdraw: 'Wari bila / Bɔ',
    loanCredit: 'Doni ta',
    billsServices: 'Fasura sara',
    recentActivity: 'Ko kɛlenw cogo',
    settings: 'Labɛnw',
    security: 'Lakana ni lafiya',
    supportWhatsApp: 'WhatsApp dɛmɛ (+226)',
    myAccount: 'Ne ka kɔnti',
    preferences: 'Kan ni ladilikanw',
    privacy: 'Gundoko lakana',
    securityPin: 'FASO gundojateminɛ (6)',
    biometrics: 'Bolokɔni lakana',
    operatorStatus: 'Telefɔni wari siraw',
    returnToAppBtn: 'Ne kɔsegira FASO kɔnɔ — ko sɛgɛsɛgɛ',
    verifyingOperation: 'Ko in bɛ sɛgɛsɛgɛli la kɛnɛ ma...',
    confirmOperation: 'Ko in kɛ ni sɔn ye',
    simulationNotice: 'Ladjɛlen don — Doni sɔrɔli bɛ banki fanga sara la',
    tier1Badge: 'Hakɛ 1 : Telefɔni sɔrɔla',
    tier2Badge: 'Hakɛ 2 : Batisira kɛra',
    giveFeedback: 'I ka hakilina di',
    reportIssue: 'Gɛlɛya jira',
  },
  fu: {
    appName: 'FASO',
    slogan: 'Ceede jam, kisal e ballal nder Burkina Faso',
    culturalGreeting: 'Jam waali / Fofo Burkina',
    balanceLabel: 'Ceede keɓaaɗe',
    hideBalance: 'Suuɗ ceede',
    showBalance: 'Hollu ceede',
    sendMoney: 'Neldu ceede',
    depositWithdraw: 'Waɗdu / Yaltin',
    loanCredit: 'Ñamaande',
    billsServices: 'Kojomaaji yoɓde',
    recentActivity: 'Golle ɓennuɗe',
    settings: 'Teeltol',
    security: 'Kisal e reentaare',
    supportWhatsApp: 'Ballal WhatsApp (+226)',
    myAccount: 'Konto am',
    preferences: 'Ɗemngal e cuɓe',
    privacy: 'Gundooje kisal',
    securityPin: 'Kisal FASO limoore (6)',
    biometrics: 'Hollirdu honndu',
    operatorStatus: 'Kuuje Mobile Money',
    returnToAppBtn: 'Mi ruttike nder FASO — Ƴeew golle am',
    verifyingOperation: 'Eɗen ƴeewa golle ɗe...',
    confirmOperation: 'Jaɓ golle ɗe',
    simulationNotice: 'Yerundorde tan — Wonaa ñamaande tigi so jaɓaaka',
    tier1Badge: 'Tolno 1 : Limoore laaɓtinaande',
    tier2Badge: 'Tolno 2 : seedamfaagal BCEAO',
    giveFeedback: 'Hollu miijo ma',
    reportIssue: 'Hollu caɗeele',
  },
};
