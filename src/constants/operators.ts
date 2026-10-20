import { Operator } from '../types';

export const OPERATORS: Operator[] = [
  {
    id: 'orange',
    name: 'Orange Money BF',
    code: 'OM_BF',
    color: '#ff7900',
    accentColor: '#fff5ec',
    prefix: ['07', '74', '75', '76', '77', '56', '57', '64'],
    ussd: '*144#',
    status: 'operational',
    uptime: '99.94%',
  },
  {
    id: 'moov',
    name: 'Moov Money BF',
    code: 'MOOV_BF',
    color: '#0066b3',
    accentColor: '#edf6fd',
    prefix: ['01', '02', '60', '61', '62', '63', '70', '71', '72', '73'],
    ussd: '*555#',
    status: 'operational',
    uptime: '99.88%',
  },
  {
    id: 'telecel',
    name: 'Telecel B-Mobile',
    code: 'TELECEL_BF',
    color: '#e60000',
    accentColor: '#fdf0f0',
    prefix: ['68', '69', '78', '79', '58', '59'],
    ussd: '*156#',
    status: 'operational',
    uptime: '99.75%',
  },
  {
    id: 'bank',
    name: 'GIM-UEMOA / Coris Bank',
    code: 'GIM_BF',
    color: '#047857',
    accentColor: '#ecfdf5',
    prefix: ['IBAN_BF', 'CORIS', 'BOA', 'ECOBANK'],
    ussd: '*888#',
    status: 'operational',
    uptime: '99.98%',
  },
];

export const COUNTRY_CODES = [
  { code: '+226', country: 'Burkina Faso', flag: '🇧🇫', digits: 8, default: true },
  { code: '+225', country: "Côte d'Ivoire", flag: '🇨🇮', digits: 10, default: false },
  { code: '+223', country: 'Mali', flag: '🇲🇱', digits: 8, default: false },
  { code: '+221', country: 'Sénégal', flag: '🇸🇳', digits: 9, default: false },
  { code: '+228', country: 'Togo', flag: '🇹🇬', digits: 8, default: false },
  { code: '+229', country: 'Bénin', flag: '🇧🇯', digits: 8, default: false },
  { code: '+227', country: 'Niger', flag: '🇳🇪', digits: 8, default: false },
];

export const CITIES_BURKINA = [
  'Ouagadougou',
  'Bobo-Dioulasso',
  'Koudougou',
  'Ouahigouya',
  'Banfora',
  'Dédougou',
  'Fada N’gourma',
  'Kaya',
  'Tenkodogo',
  'Houndé',
  'Pouytenga',
  'Kombissiri',
];
